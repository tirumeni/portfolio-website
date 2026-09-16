/* ================================================================
   PORTFOLIO SCRIPT
   Navigation Bar + Hero Section + About Section

   Contents
   --------
   1. Shared helpers / reduced-motion check
   2. Page-load fade-in trigger
   3. Navbar scroll state + mobile menu toggle
   4. Scroll-down indicator visibility
   5. Typing animation (terminal widget)
   6. Cursor-following glow
   7. Background particle network (canvas)
   8. About section: scroll reveals, count-up stats, tilt interactions
   ================================================================ */

(() => {
  "use strict";

  /* --------------------------------------------------------------
     1. SHARED HELPERS
  -------------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isFinePointer = window.matchMedia("(pointer: fine)").matches;


  /* --------------------------------------------------------------
     2. PAGE-LOAD FADE-IN
     Adding this class kicks off the staggered entrance animations
     defined in style.css (.js-fade-in / body.is-loaded rules).
  -------------------------------------------------------------- */
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-loaded");
  });


  /* --------------------------------------------------------------
     3. NAVBAR SCROLL STATE + MOBILE MENU
  -------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navEl = navMenu ? navMenu.closest(".nav") : null;

  // Toggle a stronger glass background once the page scrolls
  const SCROLL_THRESHOLD = 24;

  const updateNavbarOnScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
  };

  updateNavbarOnScroll();
  window.addEventListener("scroll", updateNavbarOnScroll, { passive: true });

  // Mobile menu open/close
  const closeMobileMenu = () => {
    if (!navToggle || !navEl) return;
    navToggle.setAttribute("aria-expanded", "false");
    navEl.classList.remove("is-open");
  };

  const openMobileMenu = () => {
    if (!navToggle || !navEl) return;
    navToggle.setAttribute("aria-expanded", "true");
    navEl.classList.add("is-open");
  };

  if (navToggle && navEl) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    // Close the menu whenever a link is chosen
    navMenu.addEventListener("click", (event) => {
      if (event.target.matches(".nav__link")) closeMobileMenu();
    });

    // Close on outside click
    document.addEventListener("click", (event) => {
      const clickedInsideNav = navEl.contains(event.target) || navToggle.contains(event.target);
      if (!clickedInsideNav) closeMobileMenu();
    });

    // Close on Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMobileMenu();
    });
  }


  /* --------------------------------------------------------------
     4. SCROLL-DOWN INDICATOR
     Fades the indicator out once the visitor starts scrolling.
  -------------------------------------------------------------- */
  const scrollIndicator = document.getElementById("scrollIndicator");

  if (scrollIndicator) {
    const hideOnScroll = () => {
      scrollIndicator.classList.toggle("is-hidden", window.scrollY > 80);
    };
    window.addEventListener("scroll", hideOnScroll, { passive: true });
  }


  /* --------------------------------------------------------------
     5. TYPING ANIMATION
     Reads the phrase list straight from the element's data-roles
     attribute, so the copy can be edited without touching JS.
  -------------------------------------------------------------- */
  const typedEl = document.getElementById("typedText");

  const runTypewriter = (el) => {
    const phrases = el.dataset.roles
      .split(",")
      .map((phrase) => phrase.trim())
      .filter(Boolean);

    if (!phrases.length) return;

    // Reduced motion: just show the first phrase, no animation loop
    if (prefersReducedMotion) {
      el.textContent = phrases[0];
      return;
    }

    const TYPE_SPEED = 55;      // ms per character while typing
    const DELETE_SPEED = 30;    // ms per character while deleting
    const HOLD_TIME = 1600;     // pause once a phrase is fully typed
    const NEXT_DELAY = 400;     // pause once a phrase is fully deleted

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
      const currentPhrase = phrases[phraseIndex];

      if (!isDeleting) {
        charIndex += 1;
        el.textContent = currentPhrase.slice(0, charIndex);

        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          setTimeout(tick, HOLD_TIME);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex -= 1;
        el.textContent = currentPhrase.slice(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, NEXT_DELAY);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    };

    tick();
  };

  if (typedEl) runTypewriter(typedEl);


  /* --------------------------------------------------------------
     6. CURSOR-FOLLOWING GLOW
     Skipped entirely on touch devices and when reduced motion is
     requested. Position is lerped for a smooth, premium trail.
  -------------------------------------------------------------- */
  const mouseGlow = document.getElementById("mouseGlow");

  if (mouseGlow && isFinePointer && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = null;

    const animateGlow = () => {
      // Simple lerp toward the pointer position for a soft trailing feel
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      mouseGlow.style.setProperty("--mx", `${currentX}px`);
      mouseGlow.style.setProperty("--my", `${currentY}px`);

      rafId = requestAnimationFrame(animateGlow);
    };

    window.addEventListener(
      "mousemove",
      (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        mouseGlow.classList.add("is-active");
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      mouseGlow.classList.remove("is-active");
    });

    rafId = requestAnimationFrame(animateGlow);

    // Pause the loop when the tab isn't visible to save cycles
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(animateGlow);
      }
    });
  }


  /* --------------------------------------------------------------
     7. BACKGROUND PARTICLE NETWORK
     Lightweight canvas animation: floating nodes that draw a
     faint connecting line to nearby neighbours. Density scales
     with viewport size and the loop pauses off-screen / off-tab.
  -------------------------------------------------------------- */
  const canvas = document.getElementById("particleCanvas");

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let width, height, particles, animationId;

    const CONFIG = {
      density: 14000,     // lower = more particles (px^2 per particle)
      maxParticles: 90,
      linkDistance: 130,
      speed: 0.25,
      colors: ["rgba(91,140,255,", "rgba(34,226,245,", "rgba(157,92,255,"],
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * CONFIG.speed;
        this.vy = (Math.random() - 0.5) * CONFIG.speed;
        this.radius = Math.random() * 1.6 + 0.6;
        this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      }
      step() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges for a seamless drifting field
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}0.7)`;
        ctx.fill();
      }
    }

    const resize = () => {
      const heroSection = document.getElementById("home");
      width = canvas.width = window.innerWidth;
      height = canvas.height = heroSection ? heroSection.offsetHeight : window.innerHeight;

      const count = Math.min(
        CONFIG.maxParticles,
        Math.floor((width * height) / CONFIG.density)
      );

      particles = Array.from({ length: count }, () => new Particle());
    };

    const drawLinks = () => {
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.linkDistance) {
            const opacity = 0.14 * (1 - dist / CONFIG.linkDistance);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120,160,255,${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.step();
        p.draw();
      });
      drawLinks();
      animationId = requestAnimationFrame(frame);
    };

    resize();
    frame();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    // Pause the render loop when the tab is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animationId = requestAnimationFrame(frame);
      }
    });
  }


  /* --------------------------------------------------------------
     8. ABOUT SECTION
     8a. Scroll reveals   — elements with .reveal + [data-reveal]
                             animate in once, the first time they
                             cross into the viewport.
     8b. Count-up stats   — .stat-card__number[data-count] counts
                             up from 0 once its card is revealed.
     8c. Image tilt       — #aboutImageTilt tilts toward the cursor
                             while the pointer is over the image.
     8d. Card tilt        — .tilt-card elements (stats/skills/facts)
                             get a subtle rotate-toward-cursor effect.
     All skipped gracefully if reduced motion is requested or the
     elements aren't present (e.g. on a page without an About section).
  -------------------------------------------------------------- */

  /* --- 8a. Scroll reveals --- */
  const revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if (prefersReducedMotion) {
      // No animation loop needed — just show everything immediately
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target); // animate once only
            }
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
      );

      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  /* --- 8b. Count-up stats --- */
  const statNumbers = document.querySelectorAll(".stat-card__number[data-count]");

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;

    if (prefersReducedMotion || target === 0) {
      el.textContent = target;
      return;
    }

    const DURATION = 1200; // ms
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / DURATION, 1);
      // Ease-out so the count settles smoothly instead of ticking linearly
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (statNumbers.length) {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    statNumbers.forEach((el) => countObserver.observe(el));
  }

  /* --- 8c. About image tilt (mirrors the Hero tilt concept, but
     this is the first place either section actually wires up the
     mousemove listener that makes a "__tilt" wrapper respond) --- */
  const aboutImageTilt = document.getElementById("aboutImageTilt");

  if (aboutImageTilt && isFinePointer && !prefersReducedMotion) {
    const TILT_MAX = 10; // degrees

    aboutImageTilt.addEventListener("mousemove", (event) => {
      const rect = aboutImageTilt.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;  // -0.5..0.5
      const relY = (event.clientY - rect.top) / rect.height - 0.5;

      const rotateY = relX * TILT_MAX * 2;
      const rotateX = relY * -TILT_MAX * 2;

      aboutImageTilt.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    aboutImageTilt.addEventListener("mouseleave", () => {
      aboutImageTilt.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  /* --- 8d. Generic tilt for stat/skill/fact cards ---
     Sets --rx/--ry custom properties that the .tilt-card CSS rule
     already reads, so hover lift + rotation combine smoothly. */
  const tiltCards = document.querySelectorAll(".tilt-card");

  if (tiltCards.length && isFinePointer && !prefersReducedMotion) {
    const CARD_TILT_MAX = 6; // degrees — subtler than the main image

    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.setProperty("--ry", `${relX * CARD_TILT_MAX * 2}deg`);
        card.style.setProperty("--rx", `${relY * -CARD_TILT_MAX * 2}deg`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

})();