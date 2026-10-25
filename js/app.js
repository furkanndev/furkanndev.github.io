// Project Data Dictionary with Real Screenshots
const PROJECTS = [
  {
    num: "01",
    title: "AuraPDF Pro",
    tag: "Desktop Workstation · Python & PyQt6",
    desc: "Acrobat-grade Windows desktop PDF platform. Direct in-page text editing, PyMuPDF C++ rendering, sandwich OCR, AcroForms, Word/Excel conversion, and Inno Setup installer.",
    url: "https://github.com/furkanndev/AuraPDF",
    img: "img/aurapdf_hero.png"
  },
  {
    num: "02",
    title: "Keystone",
    tag: "Deployment Suite · Win32 & PyQt6",
    desc: "Post-installation Windows workstation setup suite. 140+ silent Winget package deployments, real-time registry optimizer with rollback, and pre/post-format profile migration.",
    url: "https://github.com/furkanndev/KeyStone",
    img: "img/keystone_apps.png"
  },
  {
    num: "03",
    title: "Social-Saver",
    tag: "Systems Pipeline · Flask & Webview",
    desc: "Anonymous Instagram story & profile media viewer. Intercepts direct CDN media streams with zero read receipts (seen = false) and provides automated session cookie capture.",
    url: "https://github.com/furkanndev/Social-Saver",
    img: "img/keystone_tweaks.png"
  },
  {
    num: "04",
    title: "DirectoryChangeMonitorService",
    tag: "Linux Daemon · Kernel inotify",
    desc: "Zero-overhead Linux background daemon persistently auditing filesystem directory changes across 6 POSIX event categories with monotonic sequence logging.",
    url: "https://github.com/furkanndev/DirectoryChangeMonitorService",
    img: "img/keystone_backup.png"
  },
  {
    num: "05",
    title: "NavalStrike",
    tag: "Arcade Engine · C# .NET WinForms",
    desc: "Interactive 2D naval arcade game featuring decoupled domain architecture (Savas.Library / Savas.Desktop), interface contracts, 60 FPS loop, and leaderboards.",
    url: "https://github.com/furkanndev/NavalStrike",
    img: "img/aurapdf_edit.png"
  },
  {
    num: "06",
    title: "HiddenObjectsGame",
    tag: "Tactical Deduction · C# Console",
    desc: "Tactical Cartesian deduction puzzle on a dynamic 20x20 matrix with algorithmic procedural target seeding and colorized ANSI fog-of-war terminal rendering.",
    url: "https://github.com/furkanndev/HiddenObjectsGame",
    img: "img/aurapdf_hero.png"
  },
  {
    num: "07",
    title: "MatrixManipulator",
    tag: "Linear Algebra · Modern C++17",
    desc: "High-performance linear algebra engine for randomized 5x5 matrix generation, in-place coordinate scalar swaps, and O(n^3) classical dot product computation.",
    url: "https://github.com/furkanndev/MatrixManipulator",
    img: "img/keystone_apps.png"
  },
  {
    num: "08",
    title: "DealerDistribution",
    tag: "Simulation Logic · C++ Pointers",
    desc: "Warehouse product allocation and dealer traversal simulation in C++ using memory pointer tracking, inventory balance auditing, and orders.txt logging.",
    url: "https://github.com/furkanndev/DealerDistribution",
    img: "img/keystone_tweaks.png"
  },
  {
    num: "09",
    title: "BusPassengerAllocation",
    tag: "Data Structures · C (GCC)",
    desc: "Dynamic tour passenger seating management system implementing custom Stack and List structures for row-by-row seat management across multi-bus fleets.",
    url: "https://github.com/furkanndev/BusPassengerAllocation",
    img: "img/keystone_backup.png"
  },
  {
    num: "10",
    title: "IEEE754-Converter",
    tag: "Systems Computing · C Bitwise",
    desc: "Numerical precision conversion utility converting arbitrary inputs to 32-bit single precision and 64-bit double precision IEEE 754 standard binary strings.",
    url: "https://github.com/furkanndev/IEEE754-Converter",
    img: "img/aurapdf_edit.png"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  // Interactive Monitor Feed Switching
  const monNum = document.getElementById("monNum");
  const monTitle = document.getElementById("monTitle");
  const monTag = document.getElementById("monTag");
  const monDesc = document.getElementById("monDesc");
  const monLink = document.getElementById("monLink");
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
