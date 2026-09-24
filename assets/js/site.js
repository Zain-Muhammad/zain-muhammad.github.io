(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: scrolled state, progress bar, back-to-top ---------- */
  const header = $(".site-header");
  const toTop = $(".to-top");
  const root = document.documentElement;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 12);
    toTop.classList.toggle("is-visible", y > 900);
    root.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  const nav = $("#site-nav");
  const toggle = $(".nav-toggle");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    $("use", toggle).setAttribute("href", open ? "#i-close" : "#i-menu");
  };
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = $$(".site-nav a");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((l) => {
    const target = $(l.getAttribute("href"));
    if (target) sectionObserver.observe(target);
  });

  /* ---------- Scroll reveal (staggered per group) ---------- */
  const revealEls = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      let i = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--delay", Math.min(i++ * 90, 450) + "ms");
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Marquee: duplicate items for a seamless loop ---------- */
  $$("[data-marquee] .marquee-track").forEach((track) => {
    [...track.children].forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      $$("img", clone).forEach((img) => (img.alt = ""));
      track.appendChild(clone);
    });
  });

  /* ---------- Role rotator ---------- */
  const rotator = $("[data-rotator]");
  if (rotator && !reduceMotion) {
    const items = $$("li", rotator);
    let index = 0;
    setInterval(() => {
      if (document.hidden) return;
      const current = items[index];
      index = (index + 1) % items.length;
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      items[index].classList.add("is-active");
      setTimeout(() => current.classList.remove("is-leaving"), 600);
    }, 2600);
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count);
      counterObserver.unobserve(el);
      if (reduceMotion) return;
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(end * eased) + "+";
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------- Card spotlight follows the cursor ---------- */
  if (window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });

    /* Magnetic primary buttons */
    if (!reduceMotion) {
      $$(".btn-magnetic").forEach((btn) => {
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) * 0.18;
          const y = (e.clientY - r.top - r.height / 2) * 0.28;
          btn.style.transform = `translate(${x}px, ${y}px)`;
        });
        btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
      });
    }
  }

  /* ---------- Interactive background ---------- */
  const aurora = $(".bg-aurora");
  if (aurora && !reduceMotion) {
    // Palette per section: shifts smoothly as you scroll (colours interpolate via @property)
    const palettes = {
      hero:         ["#0f9e99", "#b6c94a", "#0d6b67"],
      about:        ["#0f9e99", "#f2fd7d", "#1b7fa6"],
      experience:   ["#1b7fa6", "#9fe39a", "#0f9e99"],
      skills:       ["#5b4bd6", "#37d3c4", "#0f9e99"],
      services:     ["#0f9e99", "#d9a441", "#0d6b67"],
      portfolio:    ["#2a6fdb", "#37d3c4", "#b6c94a"],
      testimonials: ["#0f9e99", "#c85a8a", "#5b4bd6"],
      resume:       ["#1b7fa6", "#b6c94a", "#0f9e99"],
      contact:      ["#0f9e99", "#f2fd7d", "#37d3c4"]
    };
    const setPalette = (id) => {
      const p = palettes[id];
      if (!p) return;
      p.forEach((c, i) => aurora.style.setProperty("--c" + (i + 1), c));
    };
    const paletteObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setPalette(e.target.id));
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(palettes).forEach((id) => {
      const el = document.getElementById(id);
      if (el) paletteObserver.observe(el);
    });

    // Cursor glow + parallax, eased with a lerp so it trails the pointer
    if (window.matchMedia("(hover: hover)").matches) {
      let tx = innerWidth / 2, ty = innerHeight / 3, cx = tx, cy = ty, raf = 0;
      const loop = () => {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        aurora.style.setProperty("--mx", cx.toFixed(1) + "px");
        aurora.style.setProperty("--my", cy.toFixed(1) + "px");
        aurora.style.setProperty("--px", ((cx / innerWidth) * 2 - 1).toFixed(3));
        aurora.style.setProperty("--py", ((cy / innerHeight) * 2 - 1).toFixed(3));
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(loop) : 0;
      };
      document.addEventListener("pointermove", (e) => {
        tx = e.clientX; ty = e.clientY;
        aurora.classList.add("is-active");
        if (!raf) raf = requestAnimationFrame(loop);
      }, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => aurora.classList.remove("is-active"));
    }

    // Colour ripple on click / tap
    document.addEventListener("pointerdown", (e) => {
      const r = document.createElement("div");
      r.className = "aurora-ripple";
      r.style.left = e.clientX + "px";
      r.style.top = e.clientY + "px";
      aurora.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
    }, { passive: true });
  }

  /* ---------- Skills tabs (WAI-ARIA tabs pattern) ---------- */
  $$("[data-tabs]").forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap);
    const indicator = $(".tab-indicator", wrap);
    const moveIndicator = (tab) => {
      indicator.style.width = tab.offsetWidth + "px";
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    };
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
      moveIndicator(tab);
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        select(tabs[(i + dir + tabs.length) % tabs.length], true);
      });
    });
    const init = () => moveIndicator(tabs.find((t) => t.getAttribute("aria-selected") === "true"));
    init();
    window.addEventListener("resize", init);
    if (document.fonts) document.fonts.ready.then(init);
  });

  /* ---------- Portfolio filter ---------- */
  const projects = $$("[data-projects] .project");
  $$(".filter").forEach((btn, _, all) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      all.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      let shown = 0;
      projects.forEach((p) => {
        const match = cat === "all" || p.dataset.cat === cat;
        p.hidden = !match;
        p.classList.remove("is-entering");
        if (match && !reduceMotion) {
          void p.offsetWidth; // restart animation
          p.style.setProperty("--d", Math.min(shown++ * 50, 500) + "ms");
          p.classList.add("is-entering");
        }
      });
    });
  });

  /* ---------- Testimonials expand / collapse ---------- */
  const quotes = $("[data-quotes]");
  const quotesToggle = $("[data-quotes-toggle]");
  if (quotes && quotesToggle) {
    // Collapse by count rather than height, so multi-column layout never spills sideways
    const markExtras = () => {
      const limit = window.matchMedia("(max-width: 680px)").matches ? 3 : 6;
      $$(".quote", quotes).forEach((q, i) => q.classList.toggle("is-extra", i >= limit));
    };
    markExtras();
    window.addEventListener("resize", markExtras);
    quotes.classList.add("is-collapsed");
    quotesToggle.addEventListener("click", () => {
      const collapsed = quotes.classList.toggle("is-collapsed");
      quotesToggle.setAttribute("aria-expanded", String(!collapsed));
      quotesToggle.textContent = collapsed ? "Show all testimonials" : "Show fewer testimonials";
      if (collapsed) quotes.scrollIntoView({ block: "start" });
    });
  }

  /* ---------- Lightboxes ---------- */
  window.addEventListener("load", () => {
    if (typeof GLightbox !== "function") return;
    GLightbox({ selector: ".portfolio-lightbox" });
    GLightbox({ selector: ".portfolio-details-lightbox", width: "90%", height: "90vh" });
  });

  /* ---------- Footer year ---------- */
  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
