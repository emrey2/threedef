(() => {
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduceMotion = () => reduceMotionQuery.matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Dialog helper: opens modally and returns focus to the opener on close.
  function openDialog(dialog, opener) {
    if (!dialog || dialog.open) return;
    dialog.showModal();
    dialog.addEventListener("close", () => opener && opener.focus(), { once: true });
  }

  /* Mobile menu ---------------------------------------------------------- */
  const menu = $("#site-menu");
  const menuOpen = $("[data-menu-open]");
  if (menu && menuOpen) {
    menuOpen.addEventListener("click", () => openDialog(menu, menuOpen));
    $("[data-menu-close]", menu).addEventListener("click", () => menu.close());
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) menu.close(); });
    window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => { if (e.matches && menu.open) menu.close(); });
  }

  /* Header over the showreel: becomes solid once the hero scrolls away ---- */
  const header = $("[data-header].over-video");
  const hero = $(".hero");
  if (header && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => header.classList.toggle("is-solid", !entry.isIntersecting), {
      rootMargin: `-${header.offsetHeight}px 0px 0px 0px`,
    }).observe(hero);
  }

  /* Showreel loop: plays only when motion is allowed and the hero is visible */
  const heroVideo = $("[data-hero-video]");
  if (heroVideo) {
    let heroVisible = true;
    const update = () => {
      const shouldPlay = !reduceMotion() && heroVisible && !document.hidden && !$("#reel[open]");
      if (shouldPlay) {
        heroVideo.play().catch(() => {});
      } else {
        heroVideo.pause();
        if (reduceMotion()) heroVideo.classList.remove("is-playing");
      }
    };
    heroVideo.addEventListener("playing", () => heroVideo.classList.add("is-playing"));
    heroVideo.addEventListener("error", () => heroVideo.remove(), true);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; update(); }).observe(heroVideo);
    }
    document.addEventListener("visibilitychange", update);
    reduceMotionQuery.addEventListener("change", update);
    window.__updateHeroVideo = update;
    update();
  }

  /* Full reel modal ------------------------------------------------------ */
  const reel = $("#reel");
  const reelOpen = $("[data-reel-open]");
  if (reel && reelOpen) {
    const player = $("iframe, video", reel);
    reelOpen.addEventListener("click", () => {
      player.src = player.dataset.src;
      openDialog(reel, reelOpen);
      if (player.tagName === "VIDEO") player.play().catch(() => {});
      window.__updateHeroVideo && window.__updateHeroVideo();
    });
    $("[data-reel-close]", reel).addEventListener("click", () => reel.close());
    reel.addEventListener("click", (e) => { if (e.target === reel || e.target.classList.contains("reel-stage")) reel.close(); });
    reel.addEventListener("close", () => {
      if (player.tagName === "VIDEO") player.pause();
      player.removeAttribute("src");
      if (player.tagName === "VIDEO") player.load();
      window.__updateHeroVideo && window.__updateHeroVideo();
    });
  }

  /* Work filter ---------------------------------------------------------- */
  const filters = $("[data-filters]");
  const grid = $("[data-grid]");
  if (filters && grid) {
    filters.hidden = false;
    const items = $$(":scope > li", grid);
    const empty = $("[data-empty]");
    filters.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-filter]");
      if (!chip) return;
      const value = chip.dataset.filter;
      $$("[data-filter]", filters).forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      let shown = 0;
      items.forEach((li) => {
        const match = value === "all" || li.dataset.vertical === value;
        li.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* Hover / focus previews on work tiles --------------------------------- */
  $$("[data-preview]").forEach((video) => {
    const tile = video.closest(".frame");
    const start = () => {
      if (reduceMotion()) return;
      video.play().then(() => video.classList.add("is-playing")).catch(() => {});
    };
    const stop = () => {
      video.classList.remove("is-playing");
      video.pause();
      video.currentTime = 0;
    };
    tile.addEventListener("pointerenter", start);
    tile.addEventListener("pointerleave", stop);
    tile.addEventListener("focus", start);
    tile.addEventListener("blur", stop);
    video.addEventListener("error", () => video.remove());
  });

  /* Lightbox ------------------------------------------------------------- */
  const lightbox = $("#lightbox");
  const galleryButtons = $$("[data-lightbox-index]");
  if (lightbox && galleryButtons.length) {
    const img = $("[data-lightbox-img]", lightbox);
    const count = $("[data-lightbox-count]", lightbox);
    const prevBtn = $("[data-lightbox-prev]", lightbox);
    const nextBtn = $("[data-lightbox-next]", lightbox);
    const stage = $("[data-lightbox-stage]", lightbox);
    const total = galleryButtons.length;
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + total) % total;
      const btn = galleryButtons[index];
      img.src = btn.dataset.full;
      img.alt = btn.dataset.alt;
      count.textContent = `${index + 1} / ${total}`;
      // Warm the neighbours so arrow presses feel instant
      [index - 1, index + 1].forEach((n) => { const b = galleryButtons[(n + total) % total]; new Image().src = b.dataset.full; });
    };
    prevBtn.hidden = nextBtn.hidden = total < 2;

    galleryButtons.forEach((btn) => btn.addEventListener("click", () => {
      opener = btn;
      show(Number(btn.dataset.lightboxIndex));
      lightbox.showModal();
    }));
    lightbox.addEventListener("close", () => opener && opener.focus());
    $("[data-lightbox-close]", lightbox).addEventListener("click", () => lightbox.close());
    prevBtn.addEventListener("click", () => show(index - 1));
    nextBtn.addEventListener("click", () => show(index + 1));
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    });
    // Click on the dark area around the image closes it
    stage.addEventListener("click", (e) => { if (e.target === stage) lightbox.close(); });
    // Swipe
    let startX = null;
    stage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    stage.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50 && total > 1) show(index + (dx < 0 ? 1 : -1));
    });
  }

  /* Brief form ----------------------------------------------------------- */
  const form = $("[data-brief-form]");
  if (form) {
    const status = $("[data-status]", form);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const rules = {
      name: (v) => (v.trim() ? "" : "Add your name."),
      company: (v) => (v.trim() ? "" : "Add your company, or your own name if you work independently."),
      email: (v) => (!v.trim() ? "Add an email address so we can reply." : emailRe.test(v.trim()) ? "" : "Check the email address. It should look like name@company.com."),
      product: (v) => (v.trim() ? "" : "Tell us what we're animating, even in a few words."),
      message: (v) => (v.trim().length >= 20 ? "" : "Add a few sentences about the project (at least 20 characters)."),
      references: (v) => (!v.trim() || /^https?:\/\/\S+\.\S+/.test(v.trim()) ? "" : "Paste the full link, starting with https://"),
    };
    const groupRules = {
      need: (checked) => (checked.length ? "" : "Choose what you need. Pick “Not sure” if you don't know yet."),
      channels: (checked) => (checked.length ? "" : "Choose at least one place the work will run."),
    };
    const labelFor = (name) => {
      const el = form.querySelector(`label[for="${name}"]`) || form.querySelector(`[data-group="${name}"] legend`);
      return el ? el.firstChild.textContent.trim() : name;
    };

    const setError = (wrapper, controls, msg) => {
      wrapper.classList.toggle("has-error", Boolean(msg));
      wrapper.querySelector(".error").textContent = msg;
      controls.forEach((c) => c.setAttribute("aria-invalid", msg ? "true" : "false"));
    };
    const checkField = (name) => {
      const input = form.elements[name];
      const msg = rules[name](input.value);
      setError(input.closest(".field"), [input], msg);
      return msg;
    };
    const checkGroup = (name) => {
      const group = form.querySelector(`[data-group="${name}"]`);
      const inputs = $$("input", group);
      const msg = groupRules[name](inputs.filter((i) => i.checked));
      setError(group, inputs, msg);
      return msg;
    };
    const validateAll = () => {
      const failed = [];
      Object.keys(rules).forEach((n) => { if (checkField(n)) failed.push(n); });
      Object.keys(groupRules).forEach((n) => { if (checkGroup(n)) failed.push(n); });
      return failed;
    };

    // Validate a field when the visitor leaves it, then live once it has shown an error.
    form.addEventListener("focusout", (e) => {
      const name = e.target.name;
      if (rules[name] && e.target.value) checkField(name);
    });
    form.addEventListener("input", (e) => {
      const name = e.target.name;
      if (rules[name] && e.target.closest(".field").classList.contains("has-error")) checkField(name);
    });
    form.addEventListener("change", (e) => {
      const name = e.target.name;
      if (groupRules[name] && e.target.closest(".field").classList.contains("has-error")) checkGroup(name);
    });

    const showStatus = (kind, html) => {
      status.hidden = false;
      status.className = `form-status is-${kind}`;
      status.innerHTML = html;
      status.focus();
    };
    const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const studioEmail = form.dataset.email;
    const succeed = (visitorEmail) => {
      const msg = form.dataset.success.replace("{email}", visitorEmail);
      $$(".field, .form-row, .form-actions, .privacy", form).forEach((el) => { el.hidden = true; });
      showStatus("success", `<strong>Brief sent</strong>${escapeHtml(msg)}`);
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const failed = validateAll();
      if (failed.length) {
        const names = failed.map(labelFor).join(", ");
        showStatus("error", `<strong>${failed.length === 1 ? "One field needs" : `${failed.length} fields need`} attention</strong>Check: ${escapeHtml(names)}.`);
        const first = form.elements[failed[0]];
        (first instanceof RadioNodeList ? first[0] : first).focus();
        return;
      }
      const data = new FormData(form);
      if (data.get("_gotcha")) { succeed(data.get("email")); return; } // honeypot: quietly ignore bots

      const endpoint = form.dataset.endpoint;
      const button = form.querySelector('button[type="submit"]');

      if (!endpoint) {
        // No form service connected yet: hand the brief to the visitor's email app.
        const lines = [
          `Name: ${data.get("name")}`, `Company: ${data.get("company")}`, `Email: ${data.get("email")}`,
          `Product: ${data.get("product")}`, `Need: ${data.get("need")}`, `Where it will run: ${data.getAll("channels").join(", ")}`,
          data.get("deadline") ? `Deadline: ${data.get("deadline")}` : null, data.get("budget") ? `Budget: ${data.get("budget")}` : null,
          data.get("references") ? `References: ${data.get("references")}` : null, "", data.get("message"),
        ].filter((l) => l !== null);
        window.location.href = `mailto:${studioEmail}?subject=${encodeURIComponent(`Brief: ${data.get("product")} (${data.get("company")})`)}&body=${encodeURIComponent(lines.join("\n"))}`;
        showStatus("success", `<strong>Your email app should open now</strong>The brief is filled in and ready to send. If nothing opened, email us at <a href="mailto:${studioEmail}">${studioEmail}</a>.`);
        return;
      }

      button.disabled = true;
      const label = button.textContent;
      button.textContent = "Sending…";
      try {
        const res = endpoint === "netlify"
          ? await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() })
          : await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        succeed(data.get("email"));
      } catch {
        showStatus("error", `<strong>The brief didn't send</strong>Please try again in a moment, or email it to <a href="mailto:${studioEmail}">${studioEmail}</a>.`);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  }
})();
