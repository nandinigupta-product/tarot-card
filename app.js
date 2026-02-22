/* app.js (v2) */

(function () {
  const $ = (sel) => document.querySelector(sel);

  const startBtn = $("#startBtn");
  const nameInput = $("#nameInput");

  const howBtn = $("#howBtn");
  const howDialog = $("#howDialog");
  const closeHowBtn = $("#closeHowBtn");

  const readyToast = $("#readyToast");

  const cardRow = $("#cardRow");
  const readingList = $("#readingList");
  const summaryBox = $("#summaryBox");
  const summaryText = $("#summaryText");
  const copyBtn = $("#copyBtn");
  const newBtn = $("#newBtn");

  const deck = window.TAROT_DECK || [];

  // ---------- seeded RNG ----------
  function xfnv1a(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffledCopy(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getDeviceId() {
    const key = "tarot_device_id";
    let v = localStorage.getItem(key);
    if (!v) {
      v = (crypto?.randomUUID?.() || String(Math.random()).slice(2)) + "_" + Date.now();
      localStorage.setItem(key, v);
    }
    return v;
  }
  function todayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  let currentDraw = null;
  let revealed = [false, false, false];

  const POSITIONS = [
    { label: "Theme" },
    { label: "Gentle Advice" },
    { label: "Outcome" },
  ];

  function setStage(stage) {
    document.body.className = `stage-${stage}`;
  }

  function makeDailyDraw() {
    const name = (nameInput.value || "").trim();
    const deviceId = getDeviceId();
    const day = todayKey();
    const seedStr = `daily|${day}|${name.toLowerCase()}|${deviceId}`;

    const rng = mulberry32(xfnv1a(seedStr));
    const pool = shuffledCopy(deck, rng);

    const picked = pool.slice(0, 3).map((card, idx) => {
      const upright = rng() > 0.3; // gentle skew to upright
      return { card, upright, position: POSITIONS[idx] };
    });

    const payload = { day, name, seedStr, picked, createdAt: Date.now() };
    localStorage.setItem(`tarot_daily_${day}`, JSON.stringify(payload));
    return payload;
  }

  function getOrCreateDailyDraw() {
    const day = todayKey();
    const cached = localStorage.getItem(`tarot_daily_${day}`);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    return makeDailyDraw();
  }

  function renderFaceDownCards() {
    cardRow.innerHTML = "";
    readingList.innerHTML = "";
    summaryBox.hidden = true;
    summaryText.innerHTML = "";
    revealed = [false, false, false];

    currentDraw.picked.forEach((pick, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tarot-card";
      btn.dataset.index = String(idx);
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-label", `Card ${idx + 1} face down`);

      btn.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-back"></div>
          <div class="card-face card-front">
            <img class="front-img" alt="" />
            <div class="card-front-fallback">
              <div>
                <div class="fallback-title"></div>
                <div class="fallback-sub">Image not found — add your deck art in /assets/cards</div>
              </div>
            </div>
          </div>
        </div>
      `;

      btn.addEventListener("click", () => revealCard(idx, btn));
      cardRow.appendChild(btn);
    });
  }

  function setFrontImage(btn, pick) {
    const img = btn.querySelector(".front-img");
    const title = btn.querySelector(".fallback-title");
    title.textContent = pick.card.name;

    img.src = pick.card.image || "";
    img.onerror = () => { img.style.display = "none"; };
    img.onload = () => {
      img.style.display = "block";
      const fb = btn.querySelector(".card-front-fallback");
      if (fb) fb.style.display = "none";
    };
  }

  function positionLine(idx) {
    return `${idx + 1}. ${POSITIONS[idx].label}`;
  }

  function showReadyToast() {
    readyToast.hidden = false;
  }
  function hideReadyToast() {
    readyToast.hidden = true;
  }

  function revealCard(idx, btn) {
    if (!currentDraw) return;
    if (revealed[idx]) return;

    revealed[idx] = true;

    const pick = currentDraw.picked[idx];
    setFrontImage(btn, pick);

    btn.classList.add("is-revealed");
    btn.setAttribute("aria-label", `Card ${idx + 1} revealed: ${pick.card.name}`);

    const item = document.createElement("div");
    item.className = "reading-item";

    const orientation = pick.upright ? "Upright" : "Reversed (gentle)";
    const msg = pick.upright ? pick.card.lightUpright : pick.card.lightReversed;

    item.innerHTML = `
      <h3>${positionLine(idx)} — ${escapeHtml(pick.card.name)}</h3>
      <div class="meta">${orientation} • ${(pick.card.keywords || []).slice(0,4).join(" · ")}</div>
      <p>${escapeHtml(msg)}</p>
    `;
    readingList.appendChild(item);

    if (revealed.every(Boolean)) {
      showSummary();
      showReadyToast();

      // Wait 2 seconds, then show reading page
      window.setTimeout(() => {
        hideReadyToast();
        setStage("reading");
      }, 2000);
    }
  }

  function showSummary() {
    const [a, b, c] = currentDraw.picked;

    const theme = a.upright ? a.card.lightUpright : a.card.lightReversed;
    const advice = b.upright ? b.card.lightUpright : b.card.lightReversed;
    const outcome = c.upright ? c.card.lightUpright : c.card.lightReversed;

    const name = (currentDraw.name || "").trim();
    const hello = name
      ? `<p><strong>${escapeHtml(name)}</strong>, here’s your gentle storyline for today:</p>`
      : `<p><strong>Here’s your gentle storyline for today:</strong></p>`;

    summaryText.innerHTML = `
      ${hello}
      <p><strong>Theme:</strong> ${escapeHtml(shorten(theme))}</p>
      <p><strong>Gentle advice:</strong> ${escapeHtml(shorten(advice))}</p>
      <p><strong>Outcome:</strong> ${escapeHtml(shorten(outcome))}</p>
      <p class="tiny">Tiny intention: pick <strong>one</strong> kind action that matches your Theme, and do it within the next 24 hours.</p>
    `;

    summaryBox.hidden = false;
  }

  function shorten(t) {
    const s = String(t || "").trim();
    if (s.length <= 180) return s;
    return s.slice(0, 177) + "…";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
  }

  // Flow
  function startFlow() {
    setStage("shuffle");
    currentDraw = getOrCreateDailyDraw();

    window.setTimeout(() => {
      setStage("draw");
      renderFaceDownCards();
    }, 2400);
  }

  startBtn.addEventListener("click", startFlow);

  newBtn.addEventListener("click", () => {
    // New reading = just clear today's cache and regenerate
    localStorage.removeItem(`tarot_daily_${todayKey()}`);
    currentDraw = getOrCreateDailyDraw();
    setStage("draw");
    renderFaceDownCards();
  });

  copyBtn.addEventListener("click", async () => {
    if (!currentDraw) return;
    const day = currentDraw.day || todayKey();
    const cards = currentDraw.picked.map(p => p.card.name).join(" | ");
    const plain =
      `Daily Light Tarot (${day})\n` +
      `Cards: ${cards}\n\n` +
      stripHtml(summaryText.innerHTML);

    try {
      await navigator.clipboard.writeText(plain);
      copyBtn.textContent = "Copied ✨";
      setTimeout(() => (copyBtn.textContent = "Copy to share"), 1200);
    } catch {
      alert("Copy failed (browser permission).");
    }
  });

  // How modal
  howBtn.addEventListener("click", () => howDialog.showModal());
  closeHowBtn.addEventListener("click", () => howDialog.close());
  howDialog.addEventListener("click", (e) => {
    const rect = howDialog.getBoundingClientRect();
    const inBox = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inBox) howDialog.close();
  });

  setStage("landing");
})();
