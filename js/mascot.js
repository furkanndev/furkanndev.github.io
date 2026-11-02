// ==============================================================================
// Broadcast mascot — a tiny CRT perched on the channel bug. Every so often it
// pulls a laptop out of the bug, codes on the newest repository and stows it.
// ==============================================================================

(() => {
  const FIRST_SESSION_MS = 6000;
  const MIN_GAP_MS = 25000;
  const MAX_GAP_MS = 45000;
  const TYPE_MS = 55;
  const LINE_PAUSE_MS = 700;
  const STEP_MS = 550;

  const SPRITE = `
    <div class="mascot-bubble"></div>
    <svg class="mascot-svg" viewBox="0 0 32 24" shape-rendering="crispEdges">
      <clipPath id="mFace"><rect x="10" y="9" width="12" height="8"/></clipPath>
      <g class="m-body">
        <rect class="m-tip" x="11" y="1" width="1" height="1" fill="#FF4FA3"/>
        <rect x="12" y="2" width="1" height="1" fill="#EBD79B"/>
        <rect x="13" y="3" width="1" height="1" fill="#EBD79B"/>
        <rect x="14" y="4" width="1" height="3" fill="#EBD79B"/>
        <rect x="20" y="1" width="1" height="1" fill="#4FE3FF"/>
        <rect x="19" y="2" width="1" height="1" fill="#EBD79B"/>
        <rect x="18" y="3" width="1" height="1" fill="#EBD79B"/>
        <rect x="17" y="4" width="1" height="3" fill="#EBD79B"/>
        <rect x="8" y="7" width="16" height="13" fill="#C9A24A"/>
        <rect x="8" y="7" width="16" height="1" fill="#EBD79B"/>
        <rect x="8" y="19" width="16" height="1" fill="#8A6D2E"/>
        <rect x="10" y="9" width="12" height="8" fill="#08080A"/>
        <g clip-path="url(#mFace)">
          <g class="m-code">
            <rect x="11" y="14" width="6" height="1" fill="#4FE3FF"/>
            <rect x="12" y="16" width="8" height="1" fill="#EBD79B"/>
            <rect x="11" y="18" width="4" height="1" fill="#FF4FA3"/>
            <rect x="12" y="20" width="7" height="1" fill="#4FE3FF"/>
          </g>
        </g>
        <g class="m-eyes" fill="#4FE3FF">
          <rect x="12" y="10" width="2" height="3"/>
          <rect x="18" y="10" width="2" height="3"/>
        </g>
        <rect x="10" y="18" width="1" height="1" fill="#FF4FA3"/>
        <rect x="12" y="18" width="4" height="1" fill="#8A6D2E"/>
        <rect class="m-arm" x="6" y="12" width="2" height="4" fill="#8A6D2E"/>
        <rect class="m-arm m-arm-r" x="24" y="12" width="2" height="4" fill="#8A6D2E"/>
        <rect x="11" y="20" width="3" height="4" fill="#8A6D2E"/>
        <rect x="18" y="20" width="3" height="4" fill="#8A6D2E"/>
      </g>
      <g class="m-laptop">
        <rect class="m-glow" x="10" y="15" width="12" height="1" fill="#4FE3FF" opacity="0.35"/>
        <g class="m-lid">
          <rect x="9" y="16" width="14" height="6" fill="#25252C"/>
          <rect x="9" y="16" width="14" height="1" fill="#C9A24A"/>
          <rect x="15" y="18" width="2" height="2" fill="#EBD79B"/>
        </g>
        <rect x="6" y="22" width="20" height="2" fill="#3A3A44"/>
        <rect x="6" y="22" width="20" height="1" fill="#C9A24A"/>
      </g>
    </svg>`;

  const bug = document.querySelector(".bug");
  if (!bug) return;

  const mascot = document.createElement("div");
  mascot.className = "mascot";
  mascot.innerHTML = SPRITE;
  bug.appendChild(mascot);

  const bubble = mascot.querySelector(".mascot-bubble");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let busy = false;

  async function typeLine(text) {
    bubble.textContent = "";
    if (calm) {
      bubble.textContent = text;
    } else {
      for (const char of text) {
        bubble.textContent += char;
        await wait(TYPE_MS);
      }
    }
    await wait(LINE_PAUSE_MS);
  }

  async function codingSession() {
    if (busy) return;
    busy = true;
    const repo = PROJECTS[0]?.repo || "furkanndev";

    mascot.classList.add("is-fetching");
    await wait(STEP_MS);
    mascot.classList.add("is-open");
    await wait(STEP_MS);
    mascot.classList.add("is-coding");

    for (const line of [`cd ${repo}`, "vim main", "git push"]) {
      await typeLine(line);
    }

    mascot.classList.remove("is-coding");
    await wait(STEP_MS);
    mascot.classList.remove("is-open");
    await wait(STEP_MS);
    mascot.classList.remove("is-fetching");
    await wait(STEP_MS);
    busy = false;
  }

  function scheduleNext(delay) {
    setTimeout(async () => {
      if (!document.hidden) await codingSession();
      scheduleNext(MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS));
    }, delay);
  }

  mascot.addEventListener("click", codingSession);
  if (!calm) scheduleNext(FIRST_SESSION_MS);
})();
