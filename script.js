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

  // Shared profile asset paths for every portrait use on the site.
  const PROFILE_ASSETS = Object.freeze({
    main: "assets/images/vikash.png",
    background: "assets/images/profile-bg.png",
  });
  document.querySelectorAll("[data-profile-image='main']").forEach((image) => {
    image.src = PROFILE_ASSETS.main;
  });
  document.documentElement.style.setProperty(
    "--profile-background-image",
    `url("${PROFILE_ASSETS.background}")`
  );

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
      maxParticles: isFinePointer ? 90 : 42,
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
     8a. Scroll reveals   â€” elements with .reveal + [data-reveal]
                             animate in once, the first time they
                             cross into the viewport.
     8b. Count-up stats   â€” .stat-card__number[data-count] counts
                             up from 0 once its card is revealed.
     8c. Image tilt       â€” #aboutImageTilt tilts toward the cursor
                             while the pointer is over the image.
     8d. Card tilt        â€” .tilt-card elements (stats/skills/facts)
                             get a subtle rotate-toward-cursor effect.
     All skipped gracefully if reduced motion is requested or the
     elements aren't present (e.g. on a page without an About section).
  -------------------------------------------------------------- */

  /* --- 8a. Scroll reveals --- */
  const revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if (prefersReducedMotion) {
      // No animation loop needed â€” just show everything immediately
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
    const CARD_TILT_MAX = 6; // degrees â€” subtler than the main image

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

/* ================================================================
   FLOATING DOCK NAVIGATION
   A damped spring drives the hover wave; the capsule tracks the current
   section while scroll direction controls the dock visibility.
================================================================ */
(() => {
  "use strict";

  const dock = document.getElementById("dockNav");
  if (!dock) return;

  const list = dock.querySelector(".dock__list");
  const indicator = dock.querySelector(".dock__indicator");
  const links = Array.from(dock.querySelectorAll(".dock__link"));
  const sectionLinks = links.filter((link) => link.dataset.section);
  const sections = sectionLinks
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean)
    .sort((first, second) => first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Keep the capsule under the last dock-linked section reached.
  const updateActiveSection = () => {
    const marker = Math.min(window.innerHeight * 0.44, window.innerHeight - 100);
    let activeId = null;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) activeId = section.id;
    });

    let activeLink = null;
    sectionLinks.forEach((link) => {
      const isActive = link.dataset.section === activeId;
      if (isActive) {
        activeLink = link;
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (!indicator || !list || !activeLink) {
      indicator?.classList.remove("is-visible");
      return;
    }

    const linkRect = activeLink.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const x = linkRect.left - listRect.left + list.scrollLeft + linkRect.width / 2 - indicator.offsetWidth / 2;
    indicator.style.setProperty("--indicator-x", `${x}px`);
    indicator.classList.add("is-visible");
  };

  let scrollFrame = 0;
  let previousScrollY = window.scrollY;
  let scrollIntent = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      const currentY = window.scrollY;
      const delta = currentY - previousScrollY;
      scrollIntent += delta;

      if (currentY <= 24) {
        dock.classList.remove("is-hidden");
        scrollIntent = 0;
      } else if (scrollIntent < -4) {
        dock.classList.remove("is-hidden");
        scrollIntent = 0;
      } else if (scrollIntent > 4) {
        dock.classList.add("is-hidden");
        scrollIntent = 0;
      }

      previousScrollY = currentY;
      updateActiveSection();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateActiveSection, { passive: true });
  updateActiveSection();

  if (reducedMotion) return;

  // Cursor proximity sets spring targets; animation frames only write transforms.
  const states = links.map(() => ({ scale: 1, velocity: 0 }));
  let pointerX = null;
  let tapResetTimer = 0;
  let magnifyFrame = 0;
  let previousFrameTime = 0;

  const proximityScale = (distance) => {
    if (distance <= 18) return 1.7;
    if (distance <= 62) return 1.7 - ((distance - 18) / 44) * 0.3;
    if (distance <= 118) return 1.4 - ((distance - 62) / 56) * 0.2;
    if (distance <= 158) return 1.2 - ((distance - 118) / 40) * 0.2;
    return 1;
  };

  const animateDock = (time) => {
    magnifyFrame = 0;
    const deltaTime = previousFrameTime
      ? Math.min((time - previousFrameTime) / 1000, 0.032)
      : 1 / 60;
    previousFrameTime = time;
    let stillMoving = false;

    links.forEach((link, index) => {
      const rect = link.getBoundingClientRect();
      const target = pointerX === null
        ? 1
        : proximityScale(Math.abs(pointerX - (rect.left + rect.width / 2)));
      const state = states[index];
      const difference = target - state.scale;
      state.velocity += (150 * difference - 20 * state.velocity) * deltaTime;
      state.scale += state.velocity * deltaTime;

      if (Math.abs(difference) > 0.002 || Math.abs(state.velocity) > 0.015) {
        stillMoving = true;
      } else {
        state.scale = target;
        state.velocity = 0;
      }

      link.style.setProperty("--dock-scale", state.scale.toFixed(3));
      link.style.setProperty("--dock-lift", `${(-16 * (state.scale - 1) / 0.7).toFixed(2)}px`);
      link.classList.toggle("is-magnified", state.scale > 1.04);
    });

    if (stillMoving) magnifyFrame = window.requestAnimationFrame(animateDock);
  };

  const scheduleMagnification = () => {
    if (!magnifyFrame) magnifyFrame = window.requestAnimationFrame(animateDock);
  };

  dock.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pointerX = event.clientX;
    scheduleMagnification();
  }, { passive: true });

  dock.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    pointerX = event.clientX;
    window.clearTimeout(tapResetTimer);
    scheduleMagnification();
    tapResetTimer = window.setTimeout(() => {
      pointerX = null;
      scheduleMagnification();
    }, 280);
  });

  dock.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    pointerX = null;
    scheduleMagnification();
  });
})();
/* ================================================================
   9. PROJECT CAROUSEL + SCREENSHOT PREVIEW
   Project details live in one array; the existing card is reused.
================================================================ */
(() => {
  // This carousel has its own IIFE, so it must read reduced-motion locally.
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const projects = [
    {
      code: "PS-227", title: "Satellite Change Intelligence Dashboard", subtitle: "Featured Â· Flagship Project",
      heroImage: "assets/images/projects/dashboard-main.png", heroAlt: "Satellite Change Intelligence Dashboard main interface",
      description: "An AI-powered satellite intelligence dashboard for semantic search, multi-temporal change detection, interactive GIS visualization, analytics, and report generation.",
      features: ["Semantic Search", "Satellite Map", "Before/After Analysis", "Timeline", "AI Summary", "Analytics", "Reports"],
      technologies: ["React", "TypeScript", "Tailwind CSS", "Leaflet", "Mapbox", "Chart.js", "Vite"],
      stats: [["8+", "Core Modules"], ["20+", "Interactive Components"], ["100%", "Responsive"], ["AI", "Powered"]],
      github: "https://github.com/tirumeni/satellite-dashboard", liveDemo: "https://satellite-dashboard-ruby.vercel.app/",
      gallery: [
        { src: "assets/images/projects/dashboard-main.png", alt: "Dashboard Overview", thumb: "assets/images/projects/shot-overview.png" },
        ...["map", "before-after", "timeline", "analytics", "ai-summary", "report"].map((name) => ({
          src: `assets/images/projects/shot-${name}.png`, alt: name.replaceAll("-", " "), thumb: `assets/images/projects/shot-${name}.png`
        }))
      ]
    },
    {
      code: "IoT Â· EDGE", title: "Edge Intelligence for Efficient IoT Telemetry", subtitle: "Featured Â· IoT Project",
      heroImage: "assets/images/projects/iot-dashboard.png", heroAlt: "Real-time IoT telemetry dashboard showing edge processing, fleet health, and device activity",
      description: "A real-time IoT telemetry platform that connects ESP32 sensor fleets, processes MQTT data at the edge, and brings live device health, analytics, alerts, and low-latency insights into one dashboard.",
      features: ["Edge Computing", "IoT Telemetry", "MQTT", "Real-time Dashboard", "Analytics", "Low Latency", "ESP32", "Sensor Fusion"],
      technologies: ["HTML", "CSS", "JavaScript", "ESP32", "MQTT", "Node-RED", "Firebase", "Chart.js", "Arduino", "IoT"],
      stats: [["248", "Sensors"], ["36", "Edge Devices"], ["42 ms", "Response Time"], ["98.6%", "Accuracy"]],
      github: "https://github.com/tirumeni/Edge-Intelligence-for-Efficient-IoT-Telemetry", liveDemo: "https://edge-intelligence-for-efficient-io.vercel.app/",
      gallery: [
        { src: "assets/images/projects/iot-dashboard.png", alt: "IoT Telemetry Dashboard", thumb: "assets/images/projects/iot-dashboard.png" },
        { src: "assets/images/projects/iot-huffman.png", alt: "Huffman Telemetry Compression", thumb: "assets/images/projects/iot-huffman.png" },
        { src: "assets/images/projects/iot-algorithm.png", alt: "Edge Algorithm Performance", thumb: "assets/images/projects/iot-algorithm.png" },
        { src: "assets/images/projects/iot-network.png", alt: "IoT Network Topology", thumb: "assets/images/projects/iot-network.png" },
        { src: "assets/images/projects/iot-hardware.png", alt: "ESP32 Sensor Hardware Monitoring", thumb: "assets/images/projects/iot-hardware.png" },
        { src: "assets/images/projects/iot-codebook.png", alt: "MQTT Telemetry and Codebook Analytics", thumb: "assets/images/projects/iot-codebook.png" },
        { src: "assets/images/projects/iot-docs.png", alt: "IoT Platform Documentation and Architecture", thumb: "assets/images/projects/iot-docs.png" }
      ]
    }
  ];

  const $ = (id) => document.getElementById(id);
  const elements = {
    card: $("projectCard"), stage: $("projectStage"), dots: $("projectDots"),
    shot: $("projectShot"), shotImg: $("projectShotImg"), thumbs: $("projectThumbs"),
    modal: $("projectModal"), modalImg: $("projectModalImg"), modalClose: $("projectModalClose"),
    previous: $("projectPrev"), next: $("projectNext"), projectsSection: $("projects"),
    code: $("projectCode"), badge: $("projectTag"), title: $("projectTitleText"),
    description: $("projectDescription"), features: $("projectFeatures"),
    technologies: $("projectStack"), stats: $("projectStats"),
    github: $("projectGithub"), liveDemo: $("projectLive")
  };
  const missingElements = Object.entries(elements).filter(([, element]) => !element).map(([name]) => name);
  if (missingElements.length) {
    console.error(`Project carousel not initialized; missing required elements: ${missingElements.join(", ")}`);
    return;
  }
  const { card, stage, dots, shot, shotImg, thumbs: thumbsWrap, modal, modalImg, modalClose } = elements;
  if (stage.dataset.projectCarouselInitialized === "true") return;
  stage.dataset.projectCarouselInitialized = "true";
  let currentProjectIndex = 0, lastFocus = null, startX = 0, startY = 0, startTime = 0, dragging = false, suppressClick = false;
  let transitionTimer = 0, animationTimer = 0;

  const renderProject = () => {
    const project = projects[currentProjectIndex];
    if (!project || !project.code || !project.subtitle || !project.title || !project.description ||
        !project.heroImage || !project.heroAlt || !project.gallery?.length ||
        !project.gallery.every((item) => item?.src && item?.thumb && item?.alt) ||
        !Array.isArray(project.features) || !Array.isArray(project.technologies) ||
        !Array.isArray(project.stats) || !project.github || !project.liveDemo) {
      console.error(`Project carousel cannot render project at index ${currentProjectIndex}; project data is incomplete.`);
      return;
    }
    elements.code.textContent = project.code;
    elements.title.textContent = project.title;
    elements.badge.textContent = project.subtitle;
    elements.description.textContent = project.description;
    const fill = (list, items) => list.replaceChildren(...items.map((item) => { const li = document.createElement("li"); li.textContent = item; return li; }));
    fill(elements.features, project.features);
    fill(elements.technologies, project.technologies);
    elements.stats.replaceChildren(...project.stats.map(([value, label]) => { const li = document.createElement("li"), strong = document.createElement("strong"), span = document.createElement("span"); strong.textContent = value; span.textContent = label; li.append(strong, span); return li; }));
    elements.liveDemo.href = project.liveDemo;
    elements.github.href = project.github;
    thumbsWrap.replaceChildren(...project.gallery.map((item, i) => {
      const button = document.createElement("button"); button.type = "button"; button.className = `project-thumb${i === 0 ? " is-active" : ""}`; button.setAttribute("role", "tab"); button.setAttribute("aria-selected", String(i === 0)); button.setAttribute("aria-label", item.alt); button.dataset.src = item.src; button.dataset.alt = item.alt;
      const frame = document.createElement("span"); frame.className = "project-thumb__img"; const img = document.createElement("img"); img.src = item.thumb; img.alt = ""; img.loading = "lazy"; img.decoding = "async"; frame.append(img); const label = document.createElement("span"); label.className = "project-thumb__label"; label.textContent = item.alt; button.append(frame, label);
      button.addEventListener("click", () => selectImage(button)); return button;
    }));
    dots.replaceChildren(...projects.map((item, i) => { const button = document.createElement("button"); button.type = "button"; button.className = `project-dot${i === currentProjectIndex ? " is-active" : ""}`; button.setAttribute("aria-label", `Show ${item.title}`); button.setAttribute("aria-current", String(i === currentProjectIndex)); button.addEventListener("click", () => navigateToProject(i, i > currentProjectIndex ? 1 : -1)); return button; }));
    shotImg.src = project.heroImage; shotImg.alt = project.heroAlt; shot.classList.remove("is-missing");
  };
  const navigateToProject = (index, direction) => {
    const count = projects.length;
    if (!count) return;
    const nextIndex = Number.isFinite(index) ? ((index % count) + count) % count : currentProjectIndex;
    if (nextIndex === currentProjectIndex) return;
    if (!projects[nextIndex]) return;
    currentProjectIndex = nextIndex;
    window.clearTimeout(transitionTimer);
    window.clearTimeout(animationTimer);
    card.classList.remove("is-exiting-left", "is-exiting-right", "is-entering");
    card.classList.add(direction > 0 ? "is-exiting-left" : "is-exiting-right");
    transitionTimer = window.setTimeout(() => {
      renderProject();
      card.classList.remove("is-exiting-left", "is-exiting-right");
      card.classList.add("is-entering");
      animationTimer = window.setTimeout(() => {
        card.classList.remove("is-entering");
      }, prefersReducedMotion ? 0 : 360);
    }, prefersReducedMotion ? 0 : 220);
  };
  const selectImage = (button) => {
    thumbsWrap.querySelectorAll(".project-thumb").forEach((t) => { t.classList.toggle("is-active", t === button); t.setAttribute("aria-selected", String(t === button)); });
    shot.classList.add("is-swapping"); window.setTimeout(() => { shotImg.src = button.dataset.src; shotImg.alt = button.dataset.alt || ""; shot.classList.remove("is-swapping", "is-missing"); }, prefersReducedMotion ? 0 : 180);
  };
  elements.previous.addEventListener("click", () => navigateToProject(currentProjectIndex - 1, -1));
  elements.next.addEventListener("click", () => navigateToProject(currentProjectIndex + 1, 1));
  document.addEventListener("keydown", (event) => {
    if (!modal.hidden) { if (event.key === "Escape") closeModal(); return; }
    if (!elements.projectsSection.contains(document.activeElement)) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); navigateToProject(currentProjectIndex - 1, -1); }
    if (event.key === "ArrowRight") { event.preventDefault(); navigateToProject(currentProjectIndex + 1, 1); }
  });
  stage.addEventListener("pointerdown", (event) => { if (event.button !== 0 || event.target.closest("a, button, input, select, textarea")) return; startX = event.clientX; startY = event.clientY; startTime = performance.now(); dragging = true; stage.setPointerCapture(event.pointerId); });
  stage.addEventListener("pointerup", (event) => { if (!dragging) return; dragging = false; const dx = event.clientX - startX, dy = event.clientY - startY, elapsed = performance.now() - startTime, swiped = Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2 || Math.abs(dx) > 20 && elapsed < 220 && Math.abs(dx) / elapsed > .35; if (swiped) { suppressClick = true; navigateToProject(currentProjectIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); window.setTimeout(() => { suppressClick = false; }, 0); } });
  stage.addEventListener("pointercancel", () => { dragging = false; });
  stage.addEventListener("wheel", (event) => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.2 && Math.abs(event.deltaX) > 25) navigateToProject(currentProjectIndex + (event.deltaX > 0 ? 1 : -1), event.deltaX > 0 ? 1 : -1); }, { passive: true });
  shotImg.addEventListener("error", () => shot.classList.add("is-missing")); shotImg.addEventListener("load", () => shot.classList.remove("is-missing"));
  const openModal = () => { if (shot.classList.contains("is-missing")) return; lastFocus = document.activeElement; modalImg.src = shotImg.currentSrc || shotImg.src; modalImg.alt = shotImg.alt; modal.hidden = false; document.body.style.overflow = "hidden"; modalClose.focus(); };
  function closeModal() { modal.hidden = true; modalImg.src = ""; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  shot.addEventListener("click", (event) => { if (suppressClick) { event.preventDefault(); return; } openModal(); }); modalClose.addEventListener("click", closeModal); modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  renderProject();
})();
