// ==============================================================================
// Slideshow — cross-fading image rotator with dot controls.
// A host element with several images cycles through them on its own; with one
// image it behaves like a plain <img>. Images that fail to load are skipped.
// ==============================================================================

class Slideshow {
  constructor(host, { interval = 4500, adopt = null, onEmpty = null } = {}) {
    this.host = host;
    this.interval = interval;
    this.onEmpty = onEmpty;
    this.urls = [];
    this.index = 0;
    this.timer = null;
    this.paused = false;
    this.token = 0;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.stack = document.createElement("div");
    this.stack.className = "slides";
    this.dots = document.createElement("div");
    this.dots.className = "slide-dots";
    this.dots.hidden = true;
    host.prepend(this.stack);
    host.append(this.dots);

    if (adopt) {
      adopt.classList.add("slide", "on");
      this.stack.append(adopt);
    }

    host.addEventListener("mouseenter", () => { this.paused = true; });
    host.addEventListener("mouseleave", () => { this.paused = false; });
    host.addEventListener("focusin", () => { this.paused = true; });
    host.addEventListener("focusout", () => { this.paused = false; });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) this.restart();
    });
  }

  get slides() {
    return [...this.stack.querySelectorAll("img.slide:not(.leaving)")];
  }

  static preload(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Replaces the current set of images; `start` picks the first one shown.
  async set(urls, start = 0, alt = "") {
    const list = [...new Set(urls.filter(Boolean))];
    if (list.join("|") === this.urls.join("|")) return;
    const token = ++this.token;

    const loaded = await Promise.all(list.map((u) => Slideshow.preload(u)));
    if (token !== this.token) return; // a newer call superseded this one

    const imgs = loaded.filter(Boolean);
    this.urls = list;
    if (!imgs.length) {
      if (this.onEmpty) this.onEmpty();
      return;
    }

    const old = this.slides;
    const first = Math.min(Math.max(start, 0), imgs.length - 1);
    imgs.forEach((img, i) => {
      img.className = "slide" + (i === first ? " on" : "");
      img.alt = alt ? `${alt} (${i + 1}/${imgs.length})` : "";
      img.decoding = "async";
      this.stack.append(img);
    });
    // Let the new image paint at opacity 1 before the old one fades out
    old.forEach((o) => {
      o.classList.remove("on");
      o.classList.add("leaving");
    });
    setTimeout(() => old.forEach((o) => o.remove()), 1000);

    this.index = first;
    this.buildDots(imgs.length);
    this.restart();
  }

  buildDots(count) {
    this.dots.replaceChildren();
    this.dots.hidden = count < 2;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slide-dot" + (i === this.index ? " on" : "");
      dot.setAttribute("aria-label", `Show image ${i + 1} of ${count}`);
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        this.show(i);
        this.restart();
      });
      this.dots.append(dot);
    }
  }

  show(i) {
    const current = this.slides.filter((s) => !s.classList.contains("leaving"));
    if (!current.length) return;
    this.index = (i + current.length) % current.length;
    current.forEach((s, n) => s.classList.toggle("on", n === this.index));
    [...this.dots.children].forEach((d, n) => d.classList.toggle("on", n === this.index));
  }

  restart() {
    clearInterval(this.timer);
    this.timer = null;
    if (this.reduced || this.slides.length < 2) return;
    this.timer = setInterval(() => {
      if (this.paused || document.hidden) return;
      this.show(this.index + 1);
    }, this.interval);
  }
}
