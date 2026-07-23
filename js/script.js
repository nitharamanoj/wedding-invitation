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
  let autoScrollRAF;          // requestAnimationFrame ID
  let autoScrollActive = false;
  let autoScrollPaused = false; // paused by user interaction

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
    injectAutoScrollBtn();
    initVideoPlayer();
  });

  /* -------------------------------------------------------------
     Journey Together Video — Autoplay on Scroll
     ------------------------------------------------------------- */
  function initVideoPlayer() {
    const video = document.getElementById("journeyVideo");
    if (!video) return;

    // Use IntersectionObserver to play video only when it's in viewport.
    // This bypasses strict iOS Safari autoplay restrictions which block
    // videos from playing if they are off-screen when the page loads.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(err => console.warn("Autoplay prevented by browser:", err));
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(video);
    } else {
      // Fallback for older browsers
      video.play().catch(err => console.warn("Autoplay prevented by browser:", err));
    }
    
    // Tap to pause/play (optional convenience for user)
    video.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch(err => console.warn("Play prevented:", err));
      } else {
        video.pause();
      }
    });
  }

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

          // Begin auto-scroll after a short pause so the hero animation settles
          setTimeout(() => startAutoScroll(), 3500);
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

    const symbols = ["❀", "✿", "✦", "✧", "✨", "✺"]; // Shining stars and flowers
    const colors = ["#C4A47C", "#DAB88C", "#E8DCC4", "#FDFBF7", "#FFFFFF"]; // Theme-matching gold and white hues

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
     Music Player — uses new Audio() for maximum browser compatibility
     ------------------------------------------------------------- */
  let bgAudio = null;

  function getBgAudio() {
    if (!bgAudio) {
      bgAudio = new Audio("assets/music/song.mp4");
      bgAudio.loop   = true;
      bgAudio.volume = 1.0;
      bgAudio.preload = "auto";
      bgAudio.addEventListener("ended", () => setMusicButtonState(false));
      bgAudio.addEventListener("error", (e) => {
        console.error("Audio load error:", e);
        showToast("Could not load music file.");
      });
    }
    return bgAudio;
  }

  function initMusic() {
    const button = document.querySelector(selectors.musicToggle);
    if (!button) return;

    button.addEventListener("click", () => {
      const audio = getBgAudio();
      if (audio.paused) {
        startAudioPlayback();
      } else {
        pauseAudioPlayback();
      }
    });
  }

  function startAudioPlayback() {
    const audio = getBgAudio();
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setMusicButtonState(true);
        })
        .catch((err) => {
          console.error("Audio play failed:", err);
          showToast("Tap the music button to play.");
        });
    }
  }

  function pauseAudioPlayback() {
    if (bgAudio) {
      bgAudio.pause();
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


  /* -------------------------------------------------------------
     Guest Wishes Backend & UI Logic
     ------------------------------------------------------------- */
  function initWishes() {
    const form = document.querySelector(selectors.wishesForm);
    const successState = document.querySelector(selectors.wishesSuccess);
    const wandBtn = document.querySelector(selectors.wishesWandBtn);
    const wishesDisplay = document.getElementById("wishesDisplay");
    const loadMoreBtn = document.getElementById("loadMoreWishesBtn");
    const loadMoreContainer = document.getElementById("loadMoreContainer");

    const PAGE_SIZE = 5;
    let allWishes = [];
    let displayedCount = 0;
    let previousTotalWishes = 0;

    // ----- FIREBASE / MOCK BACKEND LOGIC -----
    // Replace with your real Firebase config object
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY_HERE",
      projectId: "your-project",
      // ...
    };

    // We use a mock backend backed by localStorage if the API key isn't set
    const isMock = firebaseConfig.apiKey === "YOUR_API_KEY_HERE";
    
    // For live top-stacking, we trigger an event when data changes locally
    const WISHES_STORAGE_KEY = "wedding-wishes-db";

    function fetchWishesFromDB() {
      if (isMock) {
        return JSON.parse(localStorage.getItem(WISHES_STORAGE_KEY) || "[]");
      }
      // Real firebase query would go here
      return [];
    }

    function saveWishToDB(wish) {
      if (isMock) {
        const wishes = fetchWishesFromDB();
        wishes.unshift(wish); // newest first
        localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
        // Trigger a storage event manually for the current tab, 
        // real storage events only trigger on OTHER tabs
        window.dispatchEvent(new Event('mock-snapshot'));
      }
      // Real Firebase addDoc would go here
    }

    function listenToWishes(callback) {
      if (isMock) {
        const handler = () => {
          callback(fetchWishesFromDB());
        };
        // Listen to changes from this tab
        window.addEventListener('mock-snapshot', handler);
        // Listen to changes from other tabs
        window.addEventListener('storage', (e) => {
          if (e.key === WISHES_STORAGE_KEY) handler();
        });
        
        // Initial fetch
        handler();
      }
      // Real Firebase onSnapshot would go here
    }

    // ----- UI RENDER LOGIC -----
    
    function createWishHTML(wish, isNew = false) {
      const escapedName = wish.name.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t));
      const escapedMsg = wish.message.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t));
      const d = new Date(wish.sentAt);
      const dateStr = isNaN(d) ? "" : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      
      const newClass = isNew ? " new-wish" : "";
      
      return `<div class="wish-item${newClass}">
        <div class="wish-item-header">
          <span class="wish-item-name">${escapedName}</span>
          <span class="wish-item-date">${dateStr}</span>
        </div>
        <div class="wish-item-message">${escapedMsg}</div>
      </div>`;
    }

    function renderWishes(wishesList, reset = false) {
      if (!wishesDisplay) return;
      
      allWishes = wishesList;
      
      if (reset) {
        displayedCount = Math.min(PAGE_SIZE, allWishes.length);
        wishesDisplay.innerHTML = allWishes.slice(0, displayedCount)
          .map(wish => createWishHTML(wish)).join("");
      } else {
        // If a new wish came in (live top-stacking)
        // We find the difference and prepend it
        const newWishesCount = allWishes.length - previousTotalWishes;
        if (newWishesCount > 0) {
          const newWishes = allWishes.slice(0, newWishesCount);
          const newWishesHTML = newWishes.map(wish => createWishHTML(wish, true)).join("");
          wishesDisplay.insertAdjacentHTML('afterbegin', newWishesHTML);
          displayedCount += newWishesCount;
        }
      }
      
      previousTotalWishes = allWishes.length;
      
      // Update Load More button visibility
      if (loadMoreContainer) {
        if (displayedCount < allWishes.length) {
          loadMoreContainer.style.display = "block";
        } else {
          loadMoreContainer.style.display = "none";
        }
      }
    }

    // Initialize Real-time listener
    listenToWishes((wishes) => {
      // If wishesDisplay is empty, do a reset render. 
      // Otherwise it's a live update, prepend new ones.
      const isInitialRender = displayedCount === 0 && wishes.length > 0;
      renderWishes(wishes, isInitialRender);
    });

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        const nextCount = Math.min(displayedCount + PAGE_SIZE, allWishes.length);
        const nextBatch = allWishes.slice(displayedCount, nextCount);
        const batchHTML = nextBatch.map(wish => createWishHTML(wish)).join("");
        wishesDisplay.insertAdjacentHTML('beforeend', batchHTML);
        displayedCount = nextCount;
        
        if (displayedCount >= allWishes.length && loadMoreContainer) {
          loadMoreContainer.style.display = "none";
        }
      });
    }

    if (!form || !successState) return;

    // Wand button sparkle animation
    if (wandBtn) {
      wandBtn.addEventListener("click", () => {
        wandBtn.classList.remove("sparkle-animate");
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
      const sendBtn = document.getElementById("wishesSendBtn");

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

      // Show loading state
      if (sendBtn) {
        const originalText = sendBtn.innerText;
        sendBtn.innerText = "Sending...";
        sendBtn.disabled = true;
      }

      // Simulate network delay for effect
      setTimeout(() => {
        saveWishToDB({
          name,
          message,
          sentAt: new Date().toISOString()
        });

        // Transition to success state
        form.style.opacity = "0";
        setTimeout(() => {
          form.style.display = "none";
          successState.style.display = "flex";
          // We don't call renderWishes() manually here because the real-time listener (onSnapshot) handles it!
        }, 500);

        showToast(`Thank you, ${name}! Your wish has been sent. 💚`);
      }, 600);
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
     Auto-Scroll
     ------------------------------------------------------------- */
  function injectAutoScrollBtn() {
    const btn = document.createElement("button");
    btn.id = "autoScrollBtn";
    btn.className = "auto-scroll-btn";
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-label", "Pause auto scroll");
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `<i class="fa-solid fa-angles-down"></i>`;
    btn.style.display = "none"; // hidden until scroll starts
    document.getElementById("cardFrame")?.appendChild(btn);

    btn.addEventListener("click", () => {
      if (autoScrollPaused) {
        resumeAutoScroll();
      } else {
        pauseAutoScroll(true); // manual pause
      }
    });
  }

  function startAutoScroll() {
    const cardFrame = document.querySelector(selectors.cardFrame);
    if (!cardFrame) return;

    // Make button visible
    const btn = document.getElementById("autoScrollBtn");
    if (btn) btn.style.display = "flex";

    autoScrollActive = true;
    autoScrollPaused = false;
    updateAutoScrollBtn();

    // Pause on any user gesture inside the card
    const pauseEvents = ["wheel", "touchstart", "mousedown", "keydown"];
    pauseEvents.forEach(ev =>
      cardFrame.addEventListener(ev, onUserInteraction, { passive: true })
    );

    tickAutoScroll(cardFrame);
  }

  function tickAutoScroll(cardFrame) {
    if (!autoScrollActive || autoScrollPaused) return;

    const speed = 0.6; // px per frame — tweak for faster/slower
    const maxScroll = cardFrame.scrollHeight - cardFrame.clientHeight;

    if (cardFrame.scrollTop >= maxScroll - 1) {
      // Reached the bottom — stop
      stopAutoScroll();
      return;
    }

    cardFrame.scrollTop += speed;
    autoScrollRAF = requestAnimationFrame(() => tickAutoScroll(cardFrame));
  }

  function pauseAutoScroll(manual = false) {
    autoScrollPaused = true;
    cancelAnimationFrame(autoScrollRAF);
    updateAutoScrollBtn();

    if (manual) return; // keep paused until user resumes

    // If paused by touch/wheel, auto-resume after 4 s of inactivity
    clearTimeout(window._autoScrollResumeTimer);
    window._autoScrollResumeTimer = setTimeout(() => {
      if (autoScrollActive && autoScrollPaused) resumeAutoScroll();
    }, 4000);
  }

  function resumeAutoScroll() {
    const cardFrame = document.querySelector(selectors.cardFrame);
    if (!cardFrame || !autoScrollActive) return;
    autoScrollPaused = false;
    updateAutoScrollBtn();
    tickAutoScroll(cardFrame);
  }

  function stopAutoScroll() {
    autoScrollActive = false;
    autoScrollPaused = false;
    cancelAnimationFrame(autoScrollRAF);
    const btn = document.getElementById("autoScrollBtn");
    if (btn) btn.style.display = "none";
  }

  function onUserInteraction() {
    if (autoScrollActive && !autoScrollPaused) {
      pauseAutoScroll(false); // will auto-resume after 4 s
    }
  }

  function updateAutoScrollBtn() {
    const btn = document.getElementById("autoScrollBtn");
    if (!btn) return;
    if (autoScrollPaused) {
      btn.innerHTML = `<i class="fa-solid fa-play"></i>`;
      btn.setAttribute("aria-label", "Resume auto scroll");
      btn.setAttribute("aria-pressed", "true");
      btn.classList.add("is-paused");
    } else {
      btn.innerHTML = `<i class="fa-solid fa-angles-down"></i>`;
      btn.setAttribute("aria-label", "Pause auto scroll");
      btn.setAttribute("aria-pressed", "false");
      btn.classList.remove("is-paused");
    }
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
