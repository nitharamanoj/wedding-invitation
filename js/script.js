(() => {
  "use strict";

  const wedding = {
    title: "Arun & Joycy's Wedding",
    dateTime: "2026-10-31T11:00:00+05:30",
    endTime: "2026-10-31T18:00:00+05:30",
    venue: "St. Mary's Church, Muruckasserry, Idukki, Kerala",
    description: "Please celebrate the wedding of Arun George & Joycy Joychan with us."
  };

  const selectors = {
    luxuryGate: "#luxuryGate",
    ribbonBow: "#ribbonBow",
    openInviteBtn: "#openInviteBtn",
    luxuryParticles: "#luxuryParticles",
    cardFrame: "#cardFrame",
    petalField: "#petalField",
    siteHeader: "#siteHeader",
    musicToggle: "#musicToggle",
    bgMusic: "#bgMusic",
    days: "#days",
    hours: "#hours",
    minutes: "#minutes",
    seconds: "#seconds",
    wishesForm: "#wishesForm",
    wishesSuccess: "#wishesSuccess",
    wishesWandBtn: "#wishesWandBtn",
    toast: "#toast",
    lightbox: "#lightbox"
  };

  let countdownTimer;
  let toastTimer;
  let synthPlayer;

  // Prevent scroll restoration by browser
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Force container scroll reset on load
    const frame = document.querySelector(selectors.cardFrame);
    if (frame) {
      frame.scrollTop = 0;
      frame.classList.add("is-locked");
    }

    initLuxuryGate();
    initCountdown();
    initCeremonyCountdown();
    initReceptionCountdown();
    initCardScroll();
    initMusic();
    initPetals();
    initWishes();
    initGallery();
    initLightbox();
  });

  /* -------------------------------------------------------------
     Luxury Ribbon Reveal Sequence
     ------------------------------------------------------------- */
  function initLuxuryGate() {
    const ribbonBow = document.querySelector(selectors.ribbonBow);
    const openInviteBtn = document.querySelector(selectors.openInviteBtn);
    const luxuryGate = document.querySelector(selectors.luxuryGate);
    const cardFrame = document.querySelector(selectors.cardFrame);
    const particlesContainer = document.querySelector(selectors.luxuryParticles);

    if (!ribbonBow || !luxuryGate || !cardFrame) return;

    let particlesInterval;

    // Hover effect: spawn sparkles
    ribbonBow.addEventListener("mouseenter", () => {
      particlesInterval = setInterval(() => {
        spawnSparkle(particlesContainer, ribbonBow);
      }, 100);
    });

    ribbonBow.addEventListener("mouseleave", () => {
      clearInterval(particlesInterval);
    });

    // Phase 1: Click the ribbon to untie and reveal the card
    ribbonBow.addEventListener("click", () => {
      clearInterval(particlesInterval);
      
      showToast("Opening the envelope...");

      // Trigger the GSAP animation from animations.js
      if (window.animateRibbonOpening) {
        window.animateRibbonOpening(() => {
          luxuryGate.classList.add("is-parted");
          cardFrame.classList.remove("is-locked");
          
          // Try to start background music after user gesture
          startAudioPlayback();
          
          showToast("Welcome to our Wedding Invitation.");
          
          // Trigger GSAP entry animations if available
          if (window.animateHero) {
            window.animateHero();
          }
        });
      }
    }, { once: true }); // Ensure it only fires once
  }

  function spawnSparkle(container, relativeTo) {
    if (!container || !relativeTo) return;
    const rect = relativeTo.getBoundingClientRect();
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;

    const sparkle = document.createElement("div");
    sparkle.className = "luxury-sparkle";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    container.appendChild(sparkle);

    // Simple animation: float up and fade out
    sparkle.animate([
      { transform: 'translateY(0) scale(1)', opacity: 1 },
      { transform: 'translateY(-30px) scale(0)', opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 500,
      easing: 'ease-out'
    }).onfinish = () => sparkle.remove();
  }

  /* -------------------------------------------------------------
     Countdown Timer
     ------------------------------------------------------------- */
  function initCountdown() {
    const target = new Date(wedding.dateTime).getTime();
    const elements = {
      days: document.querySelector(selectors.days),
      hours: document.querySelector(selectors.hours),
      minutes: document.querySelector(selectors.minutes),
      seconds: document.querySelector(selectors.seconds)
    };

    if (!elements.days) return;

    const update = () => {
      const remaining = Math.max(target - Date.now(), 0);
      
      const dayMs = 1000 * 60 * 60 * 24;
      const hourMs = 1000 * 60 * 60;
      const minuteMs = 1000 * 60;

      const days = Math.floor(remaining / dayMs);
      const hours = Math.floor((remaining % dayMs) / hourMs);
      const minutes = Math.floor((remaining % hourMs) / minuteMs);
      const seconds = Math.floor((remaining % minuteMs) / 1000);

      updateText(elements.days, String(days).padStart(2, "0"));
      updateText(elements.hours, String(hours).padStart(2, "0"));
      updateText(elements.minutes, String(minutes).padStart(2, "0"));
      updateText(elements.seconds, String(seconds).padStart(2, "0"));

      if (remaining <= 0 && countdownTimer) {
        clearInterval(countdownTimer);
      }
    };

    update();
    countdownTimer = setInterval(update, 1000);
  }

  function updateText(element, value) {
    if (element && element.textContent !== value) {
      element.textContent = value;
    }
  }

  /* -------------------------------------------------------------
     Ceremony Countdown Timer (Oct 31, 2026 — 11:00 IST)
     ------------------------------------------------------------- */
  function initCeremonyCountdown() {
    const ceremonyTarget = new Date("2026-10-31T11:00:00+05:30").getTime();
    const el = document.getElementById("ceremonyCountdown");
    if (!el) return;

    const tick = () => {
      const remaining = Math.max(ceremonyTarget - Date.now(), 0);

      if (remaining === 0) {
        el.textContent = "The ceremony has begun!";
        return;
      }

      const dayMs    = 1000 * 60 * 60 * 24;
      const hourMs   = 1000 * 60 * 60;
      const minuteMs = 1000 * 60;

      const d = Math.floor(remaining / dayMs);
      const h = Math.floor((remaining % dayMs) / hourMs);
      const m = Math.floor((remaining % hourMs) / minuteMs);
      const s = Math.floor((remaining % minuteMs) / 1000);

      el.textContent = `${d} days ${h} hours ${m} min ${s} sec`;
    };

    tick();
    setInterval(tick, 1000);
  }

  /* -------------------------------------------------------------
     Reception Countdown Timer (Oct 31, 2026 — 11:00 IST)
     ------------------------------------------------------------- */
  function initReceptionCountdown() {
    const receptionTarget = new Date("2026-10-31T11:00:00+05:30").getTime();
    const el = document.getElementById("receptionCountdown");
    if (!el) return;

    const tick = () => {
      const remaining = Math.max(receptionTarget - Date.now(), 0);

      if (remaining === 0) {
        el.textContent = "The celebration has begun!";
        return;
      }

      const dayMs    = 1000 * 60 * 60 * 24;
      const hourMs   = 1000 * 60 * 60;
      const minuteMs = 1000 * 60;

      const d = Math.floor(remaining / dayMs);
      const h = Math.floor((remaining % dayMs) / hourMs);
      const m = Math.floor((remaining % hourMs) / minuteMs);
      const s = Math.floor((remaining % minuteMs) / 1000);

      el.textContent = `${d} days ${h} hours ${m} min ${s} sec`;
    };

    tick();
    setInterval(tick, 1000);
  }

  /* -------------------------------------------------------------
     Card Frame Internal Scrolling
     ------------------------------------------------------------- */
  function initCardScroll() {
    const cardFrame = document.querySelector(selectors.cardFrame);
    const header = document.querySelector(selectors.siteHeader);
    
    if (!cardFrame || !header) return;

    cardFrame.addEventListener("scroll", () => {
      // Toggle scrolled class when scrolling inside the card frame
      header.classList.toggle("is-scrolled", cardFrame.scrollTop > 30);
    }, { passive: true });

    // Smooth navigation clicks within the card frame
    document.querySelectorAll(".site-nav a, .scroll-indicator").forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetSection = cardFrame.querySelector(href);
          if (targetSection) {
            cardFrame.scrollTo({
              top: targetSection.offsetTop - header.offsetHeight,
              behavior: "smooth"
            });
          }
        }
      });
    });
  }

  /* -------------------------------------------------------------
     Ambient Falling Petals
     ------------------------------------------------------------- */
  function initPetals() {
    const field = document.querySelector(selectors.petalField);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (!field || prefersReducedMotion) return;

    const symbols = ["❀", "✿", "✦", "✧", "🌿"];
    const colors = ["#A9B7A0", "#7A8B68", "#C89B3C", "#D8B365", "#FAF8F4"];

    const createPetal = () => {
      // Limit simultaneous petals to avoid performance lag
      if (document.visibilityState !== "visible" || field.children.length > 80) return;

      const petal = document.createElement("span");
      petal.className = "petal";
      petal.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      
      const size = 0.4 + Math.random() * 0.8; // Rem size
      const duration = 6 + Math.random() * 7; // Seconds
      
      // Drift leftwards (negative value) to match the diagonal flow of the starry sky image
      const drift = -80 - Math.random() * 120; // Pixels
      
      // Start slightly more to the right to offset the leftward drift
      petal.style.left = `${15 + Math.random() * 95}%`;
      petal.style.fontSize = `${size}rem`;
      petal.style.color = colors[Math.floor(Math.random() * colors.length)];
      petal.style.setProperty("--petal-drift", `${drift}px`);
      petal.style.animationDuration = `${duration}s`;
      
      field.appendChild(petal);
      
      // Cleanup DOM
      setTimeout(() => petal.remove(), duration * 1000);
    };

    // Pre-populate some petals on startup
    for (let i = 0; i < 25; i++) {
      setTimeout(createPetal, i * 100);
    }
    
    // Spawn loops
    setInterval(createPetal, 200);
  }

  /* -------------------------------------------------------------
     Music Player & Fallback Web Audio Synthesizer
     ------------------------------------------------------------- */
  function initMusic() {
    const button = document.querySelector(selectors.musicToggle);
    const audio = document.querySelector(selectors.bgMusic);
    
    if (!button || !audio) return;

    button.addEventListener("click", () => {
      const isSynthPlaying = synthPlayer && synthPlayer.isPlaying;
      
      if (audio.paused && !isSynthPlaying) {
        startAudioPlayback();
      } else {
        pauseAudioPlayback();
      }
    });

    audio.addEventListener("ended", () => {
      setMusicButtonState(false);
    });
  }

  function startAudioPlayback() {
    const button = document.querySelector(selectors.musicToggle);
    const audio = document.querySelector(selectors.bgMusic);
    if (!button || !audio) return;

    audio.play().then(() => {
      setMusicButtonState(true);
    }).catch(() => {
      // Fallback to synthesised player if audio file is missing
      try {
        if (!synthPlayer) {
          synthPlayer = createSynthPlayer();
        }
        synthPlayer.play();
        setMusicButtonState(true);
        showToast("Playing ambient wedding melody loop.");
      } catch (err) {
        showToast("Audio playback not supported.");
      }
    });
  }

  function pauseAudioPlayback() {
    const button = document.querySelector(selectors.musicToggle);
    const audio = document.querySelector(selectors.bgMusic);
    if (!button || !audio) return;

    audio.pause();
    if (synthPlayer) {
      synthPlayer.pause();
    }
    setMusicButtonState(false);
  }

  function setMusicButtonState(isPlaying) {
    const button = document.querySelector(selectors.musicToggle);
    if (!button) return;
    
    button.classList.toggle("is-playing", isPlaying);
    button.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
    button.innerHTML = isPlaying 
      ? `<i class="fa-solid fa-volume-high"></i>`
      : `<i class="fa-solid fa-music"></i>`;
  }

  // Synthesizes a very soft, ambient, chordal loop (E-major pentatonic)
  function createSynthPlayer() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;

    const context = new AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = 0.045; // ultra soft volume
    masterGain.connect(context.destination);

    // E-major pentatonic luxury romantic notes: E, F#, G#, B, C#
    const notes = [164.81, 185.00, 207.65, 246.94, 277.18, 329.63, 369.99, 415.30];
    let index = 0;
    let timerId = null;

    const playStep = () => {
      const now = context.currentTime;
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.type = "sine";
      // Arpeggiate
      osc.frequency.setValueAtTime(notes[index % notes.length], now);
      
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + 2.5);
      
      index++;
      // Alternate tempo slightly for organic feel
      const nextDelay = index % 3 === 0 ? 1200 : 750;
      timerId = setTimeout(playStep, nextDelay);
    };

    return {
      isPlaying: false,
      play() {
        if (context.state === "suspended") {
          context.resume();
        }
        playStep();
        this.isPlaying = true;
      },
      pause() {
        if (timerId) clearTimeout(timerId);
        this.isPlaying = false;
      }
    };
  }

  /* -------------------------------------------------------------
     Guest Wishes Form Logic
     ------------------------------------------------------------- */
  function initWishes() {
    const form = document.querySelector(selectors.wishesForm);
    const successState = document.querySelector(selectors.wishesSuccess);
    const wandBtn = document.querySelector(selectors.wishesWandBtn);
    const wishesDisplay = document.getElementById("wishesDisplay");

    function renderWishes() {
      if (!wishesDisplay) return;
      
      const wishes = JSON.parse(localStorage.getItem("wedding-wishes") || "[]");
      
      if (wishes.length === 0) {
        wishesDisplay.innerHTML = "";
        return;
      }
      
      // Get the last 5 wishes, newest first
      const latestWishes = wishes.slice(-5).reverse();
      
      wishesDisplay.innerHTML = latestWishes.map(wish => {
        const escapedName = wish.name.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t));
        const escapedMsg = wish.message.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t));
        const d = new Date(wish.sentAt);
        const dateStr = isNaN(d) ? "" : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        
        return `<div class="wish-item">
          <div class="wish-item-header">
            <span class="wish-item-name">${escapedName}</span>
            <span class="wish-item-date">${dateStr}</span>
          </div>
          <div class="wish-item-message">${escapedMsg}</div>
        </div>`;
      }).join("");
    }

    renderWishes();

    if (!form || !successState) return;

    // Wand button sparkle animation
    if (wandBtn) {
      wandBtn.addEventListener("click", () => {
        wandBtn.classList.remove("sparkle-animate");
        // Force reflow to restart animation
        void wandBtn.offsetWidth;
        wandBtn.classList.add("sparkle-animate");
        wandBtn.addEventListener("animationend", () => {
          wandBtn.classList.remove("sparkle-animate");
        }, { once: true });
        showToast("✨ Sending some magic your way!");
      });
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.wishName.value.trim();
      const message = form.wishMessage.value.trim();

      if (!name || name.length < 2) {
        showToast("Please enter your name.");
        document.getElementById("wishName").focus();
        return;
      }

      if (!message || message.length < 5) {
        showToast("Please write a wish for the couple.");
        document.getElementById("wishMessage").focus();
        return;
      }

      // Save wish locally
      const wishes = JSON.parse(localStorage.getItem("wedding-wishes") || "[]");
      wishes.push({ name, message, sentAt: new Date().toISOString() });
      localStorage.setItem("wedding-wishes", JSON.stringify(wishes));

      // Transition to success state
      form.style.opacity = "0";
      setTimeout(() => {
        form.style.display = "none";
        successState.style.display = "flex";
        renderWishes();
      }, 500);

      showToast(`Thank you, ${name}! Your wish has been sent. 💚`);
    });
  }

  /* -------------------------------------------------------------
     Gallery Carousel Swiper Initialization
     ------------------------------------------------------------- */
  function initGallery() {
    if (!window.Swiper) return;

    new Swiper(".gallery-swiper", {
      loop: true,
      grabCursor: true,
      spaceBetween: 16,
      slidesPerView: 1,
      speed: 700,
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      navigation: {
        nextEl: ".gallery-next",
        prevEl: ".gallery-prev"
      }
    });
  }

  /* -------------------------------------------------------------
     Lightbox Preview Modal
     ------------------------------------------------------------- */
  function initLightbox() {
    const lightbox = document.querySelector(selectors.lightbox);
    if (!lightbox) return;

    const img = lightbox.querySelector("img");
    const closeBtn = lightbox.querySelector(".lightbox-close");

    // Open lightbox when clicking photos (in case they have img)
    document.querySelectorAll(".photo-frame img").forEach(photo => {
      photo.addEventListener("click", () => {
        img.src = photo.src;
        img.alt = photo.alt;
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
      });
    });

    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        img.src = "";
        img.alt = "";
      }, 400);
    };

    closeBtn?.addEventListener("click", close);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
  }

  /* -------------------------------------------------------------
     Toast Messages
     ------------------------------------------------------------- */
  function showToast(msg) {
    const toast = document.querySelector(selectors.toast);
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.add("is-visible");
    
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3000);
  }
})();
