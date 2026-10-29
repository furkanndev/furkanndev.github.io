// ==============================================================================
// Furkan Gültekin Portfolio — Interactive Runtime & Autonomous Version Sync
// ==============================================================================

const GITHUB_USERNAME = "furkanndev";
const STORAGE_KEY = "furkanndev_versions_cache_v2";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL for local cache

// Project Data Dictionary with Real Screenshots and Live Versioning
const PROJECTS = [
  {
    num: "01",
    title: "AuraPDF Pro",
    repo: "AuraPDF",
    version: "v2.2.4",
    tag: "Desktop Workstation · Python & PyQt6",
    desc: "Acrobat-grade Windows desktop PDF platform. Direct in-page text editing, PyMuPDF C++ rendering, sandwich OCR, AcroForms, Word/Excel conversion, and Inno Setup installer.",
    url: "https://github.com/furkanndev/AuraPDF",
    downloadUrl: "https://github.com/furkanndev/AuraPDF/releases/latest",
    img: "img/aurapdf_hero.png"
  },
  {
    num: "02",
    title: "Keystone",
    repo: "KeyStone",
    version: "v2.0.1",
    tag: "Deployment Suite · Win32 & PyQt6",
    desc: "Post-installation Windows workstation setup suite. 140+ silent Winget package deployments, real-time registry optimizer with rollback, and pre/post-format profile migration.",
    url: "https://github.com/furkanndev/KeyStone",
    downloadUrl: "https://github.com/furkanndev/KeyStone/releases/latest",
    img: "img/keystone_apps.png"
  },
  {
    num: "03",
    title: "Social-Saver",
    repo: "Social-Saver",
    version: "v1.0",
    tag: "Systems Pipeline · Flask & Webview",
    desc: "Anonymous Instagram story & profile media viewer. Intercepts direct CDN media streams with zero read receipts (seen = false) and provides automated session cookie capture.",
    url: "https://github.com/furkanndev/Social-Saver",
    downloadUrl: "https://github.com/furkanndev/Social-Saver/releases/tag/v1.0",
    img: "img/keystone_tweaks.png"
  },
  {
    num: "04",
    title: "DirectoryChangeMonitorService",
    repo: "DirectoryChangeMonitorService",
    version: null,
    tag: "Linux Daemon · Kernel inotify",
    desc: "Zero-overhead Linux background daemon persistently auditing filesystem directory changes across 6 POSIX event categories with monotonic sequence logging.",
    url: "https://github.com/furkanndev/DirectoryChangeMonitorService",
    downloadUrl: null,
    img: "img/keystone_backup.png"
  },
  {
    num: "05",
    title: "NavalStrike",
    repo: "NavalStrike",
    version: null,
    tag: "Arcade Engine · C# .NET WinForms",
    desc: "Interactive 2D naval arcade game featuring decoupled domain architecture (Savas.Library / Savas.Desktop), interface contracts, 60 FPS loop, and leaderboards.",
    url: "https://github.com/furkanndev/NavalStrike",
    downloadUrl: null,
    img: "img/aurapdf_edit.png"
  },
  {
    num: "06",
    title: "HiddenObjectsGame",
    repo: "HiddenObjectsGame",
    version: null,
    tag: "Tactical Deduction · C# Console",
    desc: "Tactical Cartesian deduction puzzle on a dynamic 20x20 matrix with algorithmic procedural target seeding and colorized ANSI fog-of-war terminal rendering.",
    url: "https://github.com/furkanndev/HiddenObjectsGame",
    downloadUrl: null,
    img: "img/aurapdf_hero.png"
  },
  {
    num: "07",
    title: "MatrixManipulator",
    repo: "MatrixManipulator",
    version: null,
    tag: "Linear Algebra · Modern C++17",
    desc: "High-performance linear algebra engine for randomized 5x5 matrix generation, in-place coordinate scalar swaps, and O(n^3) classical dot product computation.",
    url: "https://github.com/furkanndev/MatrixManipulator",
    downloadUrl: null,
    img: "img/keystone_apps.png"
  },
  {
    num: "08",
    title: "DealerDistribution",
    repo: "DealerDistribution",
    version: null,
    tag: "Simulation Logic · C++ Pointers",
    desc: "Warehouse product allocation and dealer traversal simulation in C++ using memory pointer tracking, inventory balance auditing, and orders.txt logging.",
    url: "https://github.com/furkanndev/DealerDistribution",
    downloadUrl: null,
    img: "img/keystone_tweaks.png"
  },
  {
    num: "09",
    title: "BusPassengerAllocation",
    repo: "BusPassengerAllocation",
    version: null,
    tag: "Data Structures · C (GCC)",
    desc: "Dynamic tour passenger seating management system implementing custom Stack and List structures for row-by-row seat management across multi-bus fleets.",
    url: "https://github.com/furkanndev/BusPassengerAllocation",
    downloadUrl: null,
    img: "img/keystone_backup.png"
  },
  {
    num: "10",
    title: "IEEE754-Converter",
    repo: "IEEE754-Converter",
    version: null,
    tag: "Systems Computing · C Bitwise",
    desc: "Numerical precision conversion utility converting arbitrary inputs to 32-bit single precision and 64-bit double precision IEEE 754 standard binary strings.",
    url: "https://github.com/furkanndev/IEEE754-Converter",
    downloadUrl: null,
    img: "img/aurapdf_edit.png"
  }
];

// -----------------------------------------------------------------------------
// Autonomous Live Version & Release Synchronization
// -----------------------------------------------------------------------------

function applyRepoVersion(repoName, version, downloadUrl) {
  if (!version) return;

  // 1. Workstation Frame OSD badge
  const osdEl = document.querySelector(`[data-repo-osd="${repoName}"]`);
  if (osdEl) {
    if (repoName === "AuraPDF") {
      osdEl.innerHTML = `● CH 01 &middot; AURAPDF PRO ${version} &middot; LIVE INTERFACE`;
    } else {
      osdEl.innerHTML = `● CH 01 &middot; ${repoName.toUpperCase()} ${version} &middot; LIVE INTERFACE`;
    }
  }

  // 2. Broadcast Ticker items
  const tickerEls = document.querySelectorAll(`[data-repo-ticker="${repoName}"]`);
  tickerEls.forEach((el) => {
    if (repoName === "AuraPDF") {
      el.innerHTML = `&bull; AURA PDF PRO ${version} RELEASED`;
    } else if (repoName === "KeyStone") {
      el.textContent = `KEYSTONE WORKSTATION DEPLOYMENT SUITE ${version}`;
    } else {
      el.textContent = `${repoName.toUpperCase()} ${version} ACTIVE`;
    }
  });

  // 3. Currently / Now section
  const nowEls = document.querySelectorAll(`[data-repo-now="${repoName}"]`);
  nowEls.forEach((el) => {
    if (repoName === "AuraPDF") {
      el.innerHTML = `AuraPDF Pro ${version} &mdash; Standalone Windows Suite`;
    } else if (repoName === "KeyStone") {
      el.innerHTML = `Keystone Platform ${version} &mdash; Windows Post-Install Deployment`;
    }
  });

  // 4. Flagship Card Badges
  const badgeEls = document.querySelectorAll(`[data-repo-badge="${repoName}"]`);
  badgeEls.forEach((el) => {
    if (repoName === "AuraPDF") {
      el.innerHTML = `release ${version} pro &bull; win x64`;
    } else if (repoName === "KeyStone") {
      el.innerHTML = `version ${version} &bull; win x64`;
    } else {
      el.innerHTML = `release ${version}`;
    }
  });

  // 5. Flagship Download Buttons
  const downloadEls = document.querySelectorAll(`[data-repo-download="${repoName}"]`);
  downloadEls.forEach((el) => {
    el.innerHTML = `download ${version} &darr;`;
    if (downloadUrl) el.href = downloadUrl;
  });

  // 6. Works list version pills
  const tagEls = document.querySelectorAll(`[data-repo-tag="${repoName}"]`);
  tagEls.forEach((el) => {
    el.textContent = version;
  });

  // 7. Update in PROJECTS in-memory dataset
  const proj = PROJECTS.find((p) => p.repo === repoName);
  if (proj) {
    proj.version = version;
    if (downloadUrl) proj.downloadUrl = downloadUrl;
  }
}

function applyTelemetryStats(publicRepos) {
  if (!publicRepos) return;
  const repoCountEl = document.querySelector('[data-telemetry="repos"]');
  if (repoCountEl) {
    repoCountEl.textContent = String(publicRepos);
  }
}

async function initAutonomousVersionSync() {
  let cache = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw);
    }
  } catch (e) {
    // localStorage may be disabled in restricted iframe/incognito
  }

  // 1. Immediately apply cached data if available
  if (cache && cache.repos) {
    Object.values(cache.repos).forEach((r) => {
      if (r.latest_version) {
        applyRepoVersion(r.repo, r.latest_version, r.download_url);
      }
    });
    if (cache.user && cache.user.public_repos) {
      applyTelemetryStats(cache.user.public_repos);
    }
  }

  // If cache is fresh (< 15 mins), do not aggressively refetch external API
  const isCacheFresh = cache && cache.timestamp && (Date.now() - cache.timestamp < CACHE_TTL_MS);

  // 2. Load static data/versions.json snapshot (Same-origin, unmetered, always fast)
  try {
    const res = await fetch(`data/versions.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.repos) {
        Object.values(data.repos).forEach((r) => {
          if (r.latest_version) {
            applyRepoVersion(r.repo, r.latest_version, r.download_url);
          }
        });
        if (data.user && data.user.public_repos) {
          applyTelemetryStats(data.user.public_repos);
        }
      }
    }
  } catch (e) {
    // data/versions.json fallback silent
  }

  // If cache is already fresh, we can skip querying GitHub API to avoid rate limits
  if (isCacheFresh) {
    return;
  }

  // 3. Live GitHub API check for flagships to catch immediate releases within seconds
  const liveRepos = ["AuraPDF", "KeyStone"];
  const updatedCache = {
    timestamp: Date.now(),
    repos: cache?.repos || {},
    user: cache?.user || { public_repos: 20 }
  };

  for (const repo of liveRepos) {
    try {
      const resp = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo}/releases/latest`, {
        headers: { Accept: "application/vnd.github.v3+json" }
      });
      if (resp.status === 200) {
        const rel = await resp.json();
        const ver = rel.tag_name;
        const dlUrl = rel.assets && rel.assets.length > 0
          ? rel.assets[0].browser_download_url
          : rel.html_url;

        if (ver) {
          applyRepoVersion(repo, ver, dlUrl);
          updatedCache.repos[repo] = {
            repo,
            latest_version: ver,
            download_url: dlUrl
          };
        }
      }
    } catch (e) {
      // Graceful silence on network error / 403 rate limit
    }
  }

  // 4. Update user telemetry stats from GitHub
  try {
    const uResp = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (uResp.status === 200) {
      const uData = await uResp.json();
      if (uData.public_repos) {
        applyTelemetryStats(uData.public_repos);
        updatedCache.user.public_repos = uData.public_repos;
      }
    }
  } catch (e) {
    // Ignore rate limits
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCache));
  } catch (e) {}
}

// -----------------------------------------------------------------------------
// Interactive UI & Event Listeners
// -----------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Start autonomous version synchronizer
  initAutonomousVersionSync();

  // Interactive Monitor Feed Switching
  const monNum = document.getElementById("monNum");
  const monTitle = document.getElementById("monTitle");
  const monTag = document.getElementById("monTag");
  const monDesc = document.getElementById("monDesc");
  const monLink = document.getElementById("monLink");
  const monDownload = document.getElementById("monDownload");
  const monImg = document.getElementById("monImg");
  const monSnow = document.getElementById("monSnow");
  const prows = document.querySelectorAll(".prow");

  function setProject(idx) {
    const p = PROJECTS[idx];
    if (!p) return;

    // Trigger CRT snow burst
    if (monSnow) {
      monSnow.classList.remove("burst");
      void monSnow.offsetWidth; // force reflow
      monSnow.classList.add("burst");
    }

    if (monImg) monImg.src = p.img;
    if (monNum) monNum.textContent = p.num;
    if (monTitle) monTitle.textContent = p.title;
    if (monTag) {
      monTag.textContent = p.version ? `${p.tag} · ${p.version}` : p.tag;
    }
    if (monDesc) monDesc.textContent = p.desc;
    if (monLink) monLink.href = p.url;

    if (monDownload) {
      if (p.downloadUrl) {
        monDownload.style.display = "inline-block";
        monDownload.href = p.downloadUrl;
        monDownload.textContent = p.version ? `DOWNLOAD ${p.version.toUpperCase()} ↓` : "LATEST RELEASE ↓";
      } else {
        monDownload.style.display = "none";
      }
    }

    prows.forEach((row, i) => {
      row.classList.toggle("on", i === idx);
    });
  }

  prows.forEach((row) => {
    row.addEventListener("mouseenter", () => {
      const idx = parseInt(row.dataset.index, 10);
      setProject(idx);
    });
  });

  // Navigation Active Link Tracking
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) {
        current = sec.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("on", link.getAttribute("href") === `#${current}`);
    });
  });
});
