/* deck.js
  Default: builds a standard 78-card deck with happy/light copy.
  If you have your own deck, set `window.CUSTOM_DECK = [...]` BEFORE app.js loads.
*/

(function () {
  const slug = (s) =>
    String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const MAJORS = [
    "The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant",
    "The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man",
    "Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"
  ];

  // Gentle, upbeat one-paragraph meanings for majors.
  const MAJOR_LIGHT = {
    "The Fool": {
      up: "A fresh start wants you. Say yes to curiosity, keep it playful, and trust you’ll learn as you go.",
      rev: "Pause before leaping. Choose the smallest brave step and let confidence catch up gently."
    },
    "The Magician": {
      up: "You already have the tools. Focus your energy, keep it simple, and watch momentum build.",
      rev: "Your power is real — it just needs direction. Pick one priority and commit to it kindly."
    },
    "The High Priestess": {
      up: "Your intuition is speaking softly. Create a quiet moment today and you’ll know what to do.",
      rev: "If things feel fuzzy, slow down. More clarity arrives when you stop forcing an answer."
    },
    "The Empress": {
      up: "Nurture brings abundance. Care for your body, your home, and your heart — beauty multiplies.",
      rev: "Give yourself the care you give others. A little rest is productive right now."
    },
    "The Emperor": {
      up: "Structure supports you. Set a clear boundary, a simple plan, and lead with calm confidence.",
      rev: "Loosen the grip. You’ll get better results with flexibility and a softer pace."
    },
    "The Hierophant": {
      up: "Lean on trusted wisdom. A teacher, tradition, or proven method can guide you today.",
      rev: "You’re allowed to do it your way. Keep what works, release what feels outdated."
    },
    "The Lovers": {
      up: "A heart-led choice is here. Choose what aligns with your values and feels mutually uplifting.",
      rev: "Re-align with what you truly want. Honest communication brings sweetness back."
    },
    "The Chariot": {
      up: "You’re moving forward. Steer with focus, keep distractions small, and celebrate progress.",
      rev: "Slow the pace to stay in control. One clear goal beats ten rushed ones."
    },
    "Strength": {
      up: "Gentle courage wins. Meet the day with patience, kindness, and steady self-belief.",
      rev: "Be tender with yourself. Confidence returns when you stop being harsh and start being supportive."
    },
    "The Hermit": {
      up: "Quiet clarity. A short break from noise helps you hear your inner guidance clearly.",
      rev: "You don’t have to do this alone. Reach out to one safe person for support."
    },
    "Wheel of Fortune": {
      up: "Good shifts are in motion. Stay open — a lucky turn comes from saying yes to change.",
      rev: "If things feel stuck, adjust one small habit. The wheel turns with tiny consistent choices."
    },
    "Justice": {
      up: "Balance and fairness. Make the clean decision — the one you’ll feel proud of tomorrow.",
      rev: "Be honest, not punitive. A gentle correction and clear truth will set things right."
    },
    "The Hanged Man": {
      up: "A new perspective helps. Pause, breathe, and let an unexpected insight arrive.",
      rev: "You’ve waited long enough. Take a small action that releases the pressure."
    },
    "Death": {
      up: "A clean ending, a brighter beginning. Release what’s done — you’re making space for better.",
      rev: "Let go gradually. You don’t have to force a big goodbye; soften out of what no longer fits."
    },
    "Temperance": {
      up: "Harmony is your magic. Blend patience with progress, and you’ll feel beautifully steady.",
      rev: "Too much of anything drains you. Return to simple routines that restore your balance."
    },
    "The Devil": {
      up: "Notice what tugs at you. Freedom comes from naming the pattern — then choosing yourself.",
      rev: "You’re breaking free. One brave boundary today loosens an old chain."
    },
    "The Tower": {
      up: "A truth clears the air. What falls away makes room for something more aligned and peaceful.",
      rev: "You can soften the shake-up. Choose honesty now and you’ll avoid bigger disruption later."
    },
    "The Star": {
      up: "Hope is real. Healing and good news arrive when you keep the faith and take gentle steps.",
      rev: "Refill your cup. Rest, nature, and kindness to self bring your sparkle back."
    },
    "The Moon": {
      up: "Trust your inner compass. Not everything is clear yet — follow what feels safe and true.",
      rev: "Fog is lifting. Ask one direct question and you’ll get the clarity you need."
    },
    "The Sun": {
      up: "Joy and warmth. Celebrate a win, be visible, and let good energy meet you halfway.",
      rev: "Let yourself receive. You don’t need to earn happiness — allow it in."
    },
    "Judgement": {
      up: "A renewal moment. Forgive the past, claim the lesson, and step into your next chapter.",
      rev: "Be compassionate with your timeline. You’re not behind — you’re becoming."
    },
    "The World": {
      up: "Completion and reward. You’ve grown — acknowledge it, then open the door to what’s next.",
      rev: "You’re almost there. Finish one meaningful loop, then celebrate properly."
    }
  };

  const SUITS = [
    { suit: "Wands", tone: "spark, confidence, creativity" },
    { suit: "Cups", tone: "feelings, connection, kindness" },
    { suit: "Swords", tone: "clarity, truth, mindset" },
    { suit: "Pentacles", tone: "stability, money, body, home" },
  ];

  const RANKS = [
    { rank: "Ace", light: "A fresh beginning appears. Keep it simple and say yes to the first step." },
    { rank: "Two", light: "Balance and choice. Pick the option that feels calm and aligned." },
    { rank: "Three", light: "Support and expansion. Share, collaborate, and let good things grow." },
    { rank: "Four", light: "Stability and rest. Protect your energy and strengthen your foundation." },
    { rank: "Five", light: "A small challenge brings growth. Be kind to yourself and adjust gently." },
    { rank: "Six", light: "Progress and harmony. Accept help and enjoy smoother momentum." },
    { rank: "Seven", light: "Reflection and intention. Choose the path that matches your values." },
    { rank: "Eight", light: "Movement and mastery. Consistent small actions create big results." },
    { rank: "Nine", light: "Nearly there. Stay steady, celebrate resilience, and keep your boundaries." },
    { rank: "Ten", light: "A cycle completes. Release what’s heavy and keep what’s meaningful." },
    { rank: "Page", light: "Curiosity and learning. Explore lightly — a message or idea arrives." },
    { rank: "Knight", light: "Forward motion. Take confident action, but keep it heart-aware." },
    { rank: "Queen", light: "Warm leadership. Nurture what matters and trust your inner wisdom." },
    { rank: "King", light: "Mature mastery. Lead calmly, make the clear decision, and stay grounded." },
  ];

  const gentleReverse = (text) =>
    "Gentle note: slow down and soften. " + text.replace(/^A|^An|^The/i, "A");

  function buildStandardDeck() {
    const deck = [];

    // Majors (22)
    MAJORS.forEach((name, i) => {
      const n2 = String(i).padStart(2, "0");
      deck.push({
        id: `maj_${n2}_${slug(name)}`,
        name,
        arcana: "Major",
        suit: null,
        rank: null,
        lightUpright: MAJOR_LIGHT[name]?.up || "A meaningful message arrives: trust your path and take a gentle step forward.",
        lightReversed: MAJOR_LIGHT[name]?.rev || "A softer pace helps. Give yourself space to reset and choose again kindly.",
        keywords: (name === "The Sun") ? ["joy","confidence","visibility"]
          : (name === "The Star") ? ["hope","healing","guidance"]
          : (name === "Strength") ? ["courage","patience","kindness"]
          : ["clarity","growth","alignment"],
        // default image path (you can override per card if you want)
        image: `./assets/cards/maj_${n2}_${slug(name)}.webp`,
      });
    });

    // Minors (56)
    SUITS.forEach(({ suit, tone }) => {
      RANKS.forEach(({ rank, light }) => {
        const id = `min_${slug(suit)}_${slug(rank)}`;
        const name = `${rank} of ${suit}`;
        deck.push({
          id,
          name,
          arcana: "Minor",
          suit,
          rank,
          lightUpright: `${light} (${tone}.)`,
          lightReversed: gentleReverse(`${light} (${tone}.)`),
          keywords: tone.split(",").map(s => s.trim()),
          image: `./assets/cards/${id}.webp`,
        });
      });
    });

    return deck;
  }

  // If you want to provide your own full 78 deck:
  // window.CUSTOM_DECK = [{ id, name, lightUpright, lightReversed, keywords:[], image:"./assets/cards/xyz.webp" }, ...]
  window.TAROT_DECK = Array.isArray(window.CUSTOM_DECK) && window.CUSTOM_DECK.length
    ? window.CUSTOM_DECK
    : buildStandardDeck();
})();
