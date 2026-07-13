(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!window.gsap || !window.ScrollTrigger) {
      // Fallback for static display if GSAP fails to load
      revealAllStatic();
      return;
    }

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // Set ScrollTrigger default container to our custom 9:16 card frame
    ScrollTrigger.defaults({
      scroller: "#cardFrame"
    });

    if (reduceMotion) {
      revealAllStatic();
      return;
    }

    // Set up scroll reveals for sections and cards
    initScrollReveals(gsap, ScrollTrigger);
    
    // Canvas scrolling animation removed, playing regular video instead
  });

  // Expose hero animator globally so script.js can trigger it when envelope is opened
  window.animateHero = () => {
    if (!window.gsap) return;
    
    const { gsap } = window;
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Initial state resets
    gsap.set(".hero-content .eyebrow, .hero-content h1, .hero-content .hairline-divider, .hero-content .hero-date, .hero-content .hero-tagline", {
      opacity: 0,
      y: 20
    });

    timeline
      .to(".hero-content .eyebrow", { y: 0, opacity: 1, duration: 0.8, delay: 0.3 })
      .to(".hero-content h1", { y: 0, opacity: 1, duration: 1.1 }, "-=0.5")
      .to(".hero-content .hairline-divider", { y: 0, opacity: 1, duration: 0.6 }, "-=0.6")
      .to(".hero-content .hero-date", { y: 0, opacity: 1, duration: 0.8 }, "-=0.4")
      .to(".hero-content .hero-tagline", { y: 0, opacity: 1, duration: 0.8 }, "-=0.5");
  };

  // Luxury Ribbon untying sequence (standalone)
  window.animateRibbonOpening = (onCompleteCallback) => {
    if (!window.gsap) {
      if (onCompleteCallback) onCompleteCallback();
      return;
    }
    
    const { gsap } = window;
    
    const tl = gsap.timeline({ 
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        if (onCompleteCallback) onCompleteCallback();
      }
    });

    // Hide instruction text
    tl.to("#instructionText", { opacity: 0, duration: 0.3 })
      
      // Phase 1: Open the Envelope (Letter animation)
      // Flip the letter around to simulate opening
      .to(".envelope-item", { rotationY: 180, duration: 0.8, ease: "power2.inOut" }, "+=0.1")
      // Zoom into the letter and fade out to reveal the site
      .to(".envelope-item", { scale: 4, opacity: 0, duration: 0.8, ease: "power2.in" }, "-=0.2")
      
      // Phase 2: Fade Out Gate completely to Reveal Website
      .to(".monogram-wrapper-standalone", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.in"
      }, "-=0.4")
      .to("#luxuryGate", {
        opacity: 0,
        duration: 1.0,
        ease: "power2.inOut"
      }, "-=0.4");
  };

  function initScrollReveals(gsap, ScrollTrigger) {
    // Reveal main section titles and general `.reveal` containers
    gsap.utils.toArray(".reveal").forEach((element) => {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          y: 35 
        }, 
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    // Reveal specific detail cards in a staggered fashion
    gsap.utils.toArray(".detail-card").forEach((card, index) => {
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }

  // Canvas functions removed

  function revealAllStatic() {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll(".detail-card").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    const heroElements = document.querySelectorAll(".hero-content .eyebrow, .hero-content h1, .hero-content .hairline-divider, .hero-content .hero-date, .hero-content .hero-tagline");
    heroElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    
    // Image sequence fallback removed
  }
})();
