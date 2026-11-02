// ==============================================================================
// Live GitHub Feed — activity stream, repository list, README media and telemetry
// Falls back to the local cache, then to the static HTML, when the API is out of reach.
// ==============================================================================

(() => {
  const USER = "furkanndev";
  const API = "https://api.github.com";
  const RAW = "https://raw.githubusercontent.com";
  const CACHE_KEY = "furkanndev_live_v3";
  const TTL_MS = 15 * 60 * 1000;
  const TICK_MS = 60 * 1000;
  const MAX_ITEMS = 5;
  const MAX_COMMIT_LOOKUPS = 4;
  const HIDDEN_REPOS = new Set([USER, `${USER}.github.io`]);
  const NOISE = /^(merge|chore|wip|bump)\b/i;
  const MAX_SHOTS = 8;
  const MAX_EXCERPT_LINES = 6;
  const NOT_A_SCREENSHOT = /shields\.io|badge|app_icon|logo|\.svg(\?|$)/i;
  const IMAGE_REFS = /!\[[^\]]*\]\(([^)\s]+)|<img[^>]+src=["']([^"']+)/g;

  const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const UNITS = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60]
  ];

  function timeAgo(iso) {
    const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
    for (const [unit, size] of UNITS) {
      if (Math.abs(seconds) >= size) {
        return relative.format(Math.round(seconds / size), unit);
      }
    }
    return "just now";
  }

  async function getJson(path) {
    const resp = await fetch(`${API}${path}`, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!resp.ok) {
      const err = new Error(`GitHub API ${resp.status}`);
      err.status = resp.status;
      throw err;
    }
    return resp.json();
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage may be disabled in restricted iframe/incognito
    }
  }

  function shortName(fullName) {
    return fullName.split("/")[1];
  }

  async function commitTitle(fullName, sha) {
    try {
      const commit = await getJson(`/repos/${fullName}/commits/${sha}`);
      return commit.commit.message.split("\n")[0].slice(0, 90);
    } catch (e) {
      return null;
    }
  }

  async function buildFeed(events) {
    const items = [];
    const seen = new Set();
    const sorted = [...events].sort((a, b) => b.created_at.localeCompare(a.created_at));
    let lookups = 0;

    for (const ev of sorted) {
      const repo = shortName(ev.repo.name);
      const key = `${ev.type}:${repo}`;
      if (HIDDEN_REPOS.has(repo) || seen.has(key)) continue;

      if (ev.type === "ReleaseEvent" && ev.payload.action === "published") {
        seen.add(key);
        items.push({
          kind: "release",
          title: `${repo} ${ev.payload.release.tag_name.replace(/^pro-/i, "")}`,
          note: ev.payload.release.name || "New release",
          url: ev.payload.release.html_url,
          at: ev.created_at
        });
      } else if (ev.type === "PushEvent" && lookups < MAX_COMMIT_LOOKUPS) {
        seen.add(key);
        lookups += 1;
        const message = await commitTitle(ev.repo.name, ev.payload.head);
        if (message && NOISE.test(message)) continue;
        items.push({
          kind: "commit",
          title: repo,
          note: message || "New commits pushed",
          url: `https://github.com/${ev.repo.name}/commit/${ev.payload.head}`,
          at: ev.created_at
        });
      } else if (ev.type === "CreateEvent" && ev.payload.ref_type === "repository") {
        seen.add(key);
        items.push({
          kind: "new repo",
          title: repo,
          note: ev.payload.description || "New repository",
          url: `https://github.com/${ev.repo.name}`,
          at: ev.created_at
        });
      }
    }
    return items.slice(0, MAX_ITEMS);
  }

  function plainLine(line) {
    return line
      .replace(/<[^>]+>/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/^[#>\-*\s]+/, "")
      .replace(/[*_`]/g, "")
      .trim();
  }

  function readmeText(markdown) {
    const lines = [];
    let inCode = false;
    for (const raw of markdown.split(/\r?\n/)) {
      if (raw.trim().startsWith("```")) {
        inCode = !inCode;
        continue;
      }
      if (inCode || /^\s*(<|!\[|\||\[!|---)/.test(raw)) continue;
      const line = plainLine(raw);
      if (line) lines.push(line);
    }
    return lines;
  }

  function parseReadme(repo, markdown) {
    const base = `${RAW}/${USER}/${repo}/HEAD/`;
    const shots = [...markdown.matchAll(IMAGE_REFS)]
      .map((match) => new URL(match[1] || match[2], base).href)
      .filter((url) => url.startsWith("https://") && !NOT_A_SCREENSHOT.test(url));
    const text = readmeText(markdown);
    return {
      shots: [...new Set(shots)].slice(0, MAX_SHOTS),
      excerpt: text.slice(0, MAX_EXCERPT_LINES).map((line) => line.slice(0, 76)),
      summary: (text.find((line) => line.length > 40) || "").slice(0, 220)
    };
  }

  // raw.githubusercontent.com does not count against the API rate limit
  async function fetchMedia(repos) {
    const media = {};
    await Promise.all(repos.map(async (repo) => {
      try {
        const resp = await fetch(`${RAW}/${USER}/${repo}/HEAD/README.md`);
        if (resp.ok) media[repo] = parseReadme(repo, await resp.text());
      } catch (e) {
        // Network failure: the repo keeps its static card
      }
    }));
    return media;
  }

  async function fetchLive() {
    const [user, repos, events] = await Promise.all([
      getJson(`/users/${USER}`),
      getJson(`/users/${USER}/repos?per_page=100&sort=pushed`),
      getJson(`/users/${USER}/events/public?per_page=50`)
    ]);

    const feed = await buildFeed(events);
    const lastRelease = feed.find((item) => item.kind === "release");
    const own = repos.filter((r) => !r.fork);
    const shown = own.filter((r) => !HIDDEN_REPOS.has(r.name));
    const meta = {};
    own.forEach((r) => {
      meta[r.name] = { language: r.language, stars: r.stargazers_count, pushedAt: r.pushed_at };
    });

    return {
      fetchedAt: Date.now(),
      stats: {
        repos: user.public_repos,
        languages: new Set(shown.map((r) => r.language).filter(Boolean)).size,
        lastPush: shown.length ? shown[0].pushed_at : null,
        lastRelease: lastRelease ? lastRelease.at : null
      },
      meta,
      feed,
      list: shown.map((r) => ({ name: r.name, language: r.language, description: r.description }))
    };
  }

  function setTelemetry(name, value) {
    const el = document.querySelector(`[data-telemetry="${name}"]`);
    if (el && value !== null && value !== undefined) el.textContent = String(value);
  }

  function renderStats(stats) {
    setTelemetry("repos", stats.repos);
    setTelemetry("languages", stats.languages);
    if (stats.lastPush) setTelemetry("lastpush", timeAgo(stats.lastPush));
    if (stats.lastRelease) setTelemetry("lastrelease", timeAgo(stats.lastRelease));
  }

  function renderRepos(meta) {
    document.querySelectorAll(".prow[data-repo]").forEach((row) => {
      const info = meta[row.dataset.repo];
      if (!info) return;
      let line = row.querySelector(".plive");
      if (!line) {
        line = document.createElement("div");
        line.className = "plive";
        row.querySelector(".pnote").after(line);
      }
      const parts = [`updated ${timeAgo(info.pushedAt)}`];
      if (info.language) parts.unshift(info.language);
      if (info.stars) parts.push(`${info.stars} ${info.stars === 1 ? "star" : "stars"}`);
      line.textContent = parts.join(" · ");
    });
  }

  function feedRow(item) {
    const li = document.createElement("li");

    const badge = document.createElement("div");
    badge.className = item.kind === "release" ? "nw" : item.kind === "commit" ? "nw cyan" : "nw brass";
    const label = document.createElement("b");
    label.textContent = item.kind;
    badge.appendChild(label);

    const title = document.createElement("div");
    title.className = "nt";
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.title;
    title.appendChild(link);

    const note = document.createElement("div");
    note.className = "ns";
    note.textContent = `${item.note} · ${timeAgo(item.at)}`;

    const body = document.createElement("div");
    body.append(title, note);
    li.append(badge, body);
    return li;
  }

  function renderFeed(feed) {
    const list = document.getElementById("nowFeed");
    if (list && feed.length) list.replaceChildren(...feed.map(feedRow));
  }

  function renderStatus(fetchedAt) {
    document.querySelectorAll("[data-live-status]").forEach((el) => {
      el.textContent = `live · synced ${timeAgo(new Date(fetchedAt).toISOString())}`;
    });
  }

  function render(data) {
    applyLiveProjects(data.list, data.media);
    if (!data.fetchedAt) return;
    renderStats(data.stats);
    renderRepos(data.meta);
    renderFeed(data.feed);
    renderStatus(data.fetchedAt);
  }

  let state = readCache();
  let refreshing = false;

  async function refresh() {
    if (refreshing || document.hidden) return;
    const now = Date.now();
    if (state.retryAt && now < state.retryAt) return;
    if (state.fetchedAt && now - state.fetchedAt < TTL_MS) return;

    refreshing = true;
    let next = state;
    try {
      next = await fetchLive();
    } catch (e) {
      if (e.status === 403 || e.status === 429) next = { ...state, retryAt: now + TTL_MS };
    }
    const repos = next.list?.map((r) => r.name) || PROJECTS.map((p) => p.repo);
    state = { ...next, media: { ...state.media, ...await fetchMedia(repos) } };
    writeCache(state);
    render(state);
    refreshing = false;
  }

  render(state);
  refresh();
  setInterval(() => {
    render(state);
    refresh();
  }, TICK_MS);
  document.addEventListener("visibilitychange", refresh);
})();
