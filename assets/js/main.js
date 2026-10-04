(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.querySelector("i").className = open ? "ph ph-x" : "ph ph-list";
    };
    toggle.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    window.matchMedia("(min-width: 861px)").addEventListener("change", () => setOpen(false));
  }

  // Header hairline once the page leaves the top
  const header = document.querySelector(".site-header");
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;";
  document.body.prepend(sentinel);
  if (header && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    }).observe(sentinel);
  }

  // Scroll reveal
  const revealables = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    revealables.forEach((el) => io.observe(el));
  }

  // Work filters
  const filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    const projects = document.querySelectorAll("[data-category]");
    const empty = document.querySelector("[data-empty]");
    filterBar.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-filter]");
      if (!chip) return;
      const value = chip.dataset.filter;
      filterBar.querySelectorAll("[data-filter]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      let shown = 0;
      projects.forEach((p) => {
        const match = value === "all" || p.dataset.category.split(" ").includes(value);
        p.hidden = !match;
        if (match) { shown++; p.classList.add("is-in"); }
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  // Contact form: validate inline, then hand off to the visitor's mail app
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const status = form.querySelector(".form-status");
    const rules = {
      name: (v) => (v.trim() ? "" : "Please add your name."),
      email: (v) => (!v.trim() ? "Please add your email." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "That email doesn't look right."),
      type: (v) => (v ? "" : "Pick the closest match."),
      message: (v) => (v.trim().length >= 20 ? "" : "A couple of sentences helps us reply properly (20 characters min)."),
    };
    const check = (input) => {
      const rule = rules[input.name];
      if (!rule) return true;
      const msg = rule(input.value);
      const field = input.closest(".field");
      field.classList.toggle("has-error", Boolean(msg));
      field.querySelector(".error").textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    };
    form.addEventListener("blur", (e) => { if (e.target.name in rules && e.target.value) check(e.target); }, true);
    form.addEventListener("input", (e) => {
      if (e.target.closest(".field")?.classList.contains("has-error")) check(e.target);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = [...form.querySelectorAll("input, select, textarea")];
      const invalid = inputs.filter((i) => !check(i));
      if (invalid.length) {
        invalid[0].focus();
        status.hidden = false;
        status.className = "form-status is-error";
        status.textContent = "A few fields need attention before sending.";
        return;
      }
      const data = new FormData(form);
      const to = form.dataset.to;
      const subject = `New project: ${data.get("type")} (${data.get("name")})`;
      const body = [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        data.get("company") ? `Company: ${data.get("company")}` : null,
        `Project type: ${data.get("type")}`,
        data.get("timeline") ? `Timeline: ${data.get("timeline")}` : null,
        "",
        data.get("message"),
      ].filter((l) => l !== null).join("\n");
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.hidden = false;
      status.className = "form-status is-success";
      status.innerHTML = `<strong>Almost there.</strong> Your email app should open with the message filled in. If it didn't, write to <a href="mailto:${to}">${to}</a>.`;
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
