// Project Data Dictionary
const PROJECTS = [
  {
    num: "01",
    title: "AuraPDF Pro",
    tag: "Desktop Workstation · Python & PyQt6",
    desc: "Acrobat-grade Windows desktop PDF platform. Direct in-page text editing, PyMuPDF C++ rendering, sandwich OCR, AcroForms, Word/Excel conversion, and Inno Setup installer.",
    url: "https://github.com/furkanndev/AuraPDF"
  },
  {
    num: "02",
    title: "Keystone",
    tag: "Deployment Suite · Win32 & PyQt6",
    desc: "Post-installation Windows workstation setup suite. 140+ silent Winget package deployments, real-time registry optimizer with rollback, and pre/post-format profile migration.",
    url: "https://github.com/furkanndev/KeyStone"
  },
  {
    num: "03",
    title: "Social-Saver",
    tag: "Systems Pipeline · Flask & Webview",
    desc: "Anonymous Instagram story & profile media viewer. Intercepts direct CDN media streams with zero read receipts (seen = false) and provides automated session cookie capture.",
    url: "https://github.com/furkanndev/Social-Saver"
  },
  {
    num: "04",
    title: "DirectoryChangeMonitorService",
    tag: "Linux Daemon · Kernel inotify",
    desc: "Zero-overhead Linux background daemon persistently auditing filesystem directory changes across 6 POSIX event categories with monotonic sequence logging.",
    url: "https://github.com/furkanndev/DirectoryChangeMonitorService"
  },
  {
    num: "05",
    title: "NavalStrike",
    tag: "Arcade Engine · C# .NET WinForms",
    desc: "Interactive 2D naval arcade game featuring decoupled domain architecture (Savas.Library / Savas.Desktop), interface contracts, 60 FPS loop, and leaderboards.",
    url: "https://github.com/furkanndev/NavalStrike"
  },
  {
    num: "06",
    title: "HiddenObjectsGame",
    tag: "Tactical Deduction · C# Console",
    desc: "Tactical Cartesian deduction puzzle on a dynamic 20x20 matrix with algorithmic procedural target seeding and colorized ANSI fog-of-war terminal rendering.",
    url: "https://github.com/furkanndev/HiddenObjectsGame"
  },
  {
    num: "07",
    title: "MatrixManipulator",
    tag: "Linear Algebra · Modern C++17",
    desc: "High-performance linear algebra engine for randomized 5x5 matrix generation, in-place coordinate scalar swaps, and O(n^3) classical dot product computation.",
    url: "https://github.com/furkanndev/MatrixManipulator"
  },
  {
    num: "08",
    title: "DealerDistribution",
    tag: "Simulation Logic · C++ Pointers",
    desc: "Warehouse product allocation and dealer traversal simulation in C++ using memory pointer tracking, inventory balance auditing, and orders.txt logging.",
    url: "https://github.com/furkanndev/DealerDistribution"
  },
  {
    num: "09",
    title: "BusPassengerAllocation",
    tag: "Data Structures · C (GCC)",
    desc: "Dynamic tour passenger seating management system implementing custom Stack and List structures for row-by-row seat management across multi-bus fleets.",
    url: "https://github.com/furkanndev/BusPassengerAllocation"
  },
  {
    num: "10",
    title: "IEEE754-Converter",
    tag: "Systems Computing · C Bitwise",
    desc: "Numerical precision conversion utility converting arbitrary inputs to 32-bit single precision and 64-bit double precision IEEE 754 standard binary strings.",
    url: "https://github.com/furkanndev/IEEE754-Converter"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  // 1. CRT Canvas Waveform Visualization
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width, height;
    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    let step = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Radar / Grid circles
      ctx.strokeStyle = "rgba(79, 227, 255, 0.08)";
      ctx.lineWidth = 1;
      const cx = width / 2;
      const cy = height / 2;
      for (let r = 40; r < Math.max(width, height) / 1.5; r += 50) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Dynamic Signal Waveform
      ctx.beginPath();
      ctx.strokeStyle = "#C9A24A";
      ctx.lineWidth = 1.8;
      for (let x = 0; x < width; x += 3) {
        const y = cy + Math.sin((x + step) * 0.02) * 28 * Math.cos((x - step) * 0.01) + Math.sin(x * 0.05 + step * 0.03) * 12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary Waveform (Cyan)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(79, 227, 255, 0.55)";
      ctx.lineWidth = 1.2;
      for (let x = 0; x < width; x += 4) {
        const y = cy + Math.sin((x * 0.018 - step * 0.025)) * 20 * Math.sin((x + step) * 0.008);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      step += 1.8;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // 2. Interactive Monitor Feed Switching
  const monNum = document.getElementById("monNum");
  const monTitle = document.getElementById("monTitle");
  const monTag = document.getElementById("monTag");
  const monDesc = document.getElementById("monDesc");
  const monLink = document.getElementById("monLink");
  const monSnow = document.getElementById("monSnow");
  const prows = document.querySelectorAll(".prow");

  function setProject(idx) {
    const p = PROJECTS[idx];
    if (!p) return;

    // Trigger CRT snow burst
    if (monSnow) {
      monSnow.classList.remove("burst");
      void monSnow.offsetWidth; // reflow
      monSnow.classList.add("burst");
    }

    if (monNum) monNum.textContent = p.num;
    if (monTitle) monTitle.textContent = p.title;
    if (monTag) monTag.textContent = p.tag;
    if (monDesc) monDesc.textContent = p.desc;
    if (monLink) monLink.href = p.url;

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

  // 3. Navigation Active Link Tracking
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
