document.addEventListener("DOMContentLoaded", () => {
  const supportWidgetMarkup = `
    <button class="wa-float-widget" id="waOpenFormBtn" type="button" aria-label="Open support form">
      <div class="wa-float-text"><span>Talk to us</span></div>
      <div class="wa-float-avatar">
        <img src="https://cdn.shopify.com/s/files/1/0639/3515/2267/files/Screenshot_2026-04-20_214112.png?v=1776701501" alt="Friendly support person">
      </div>
    </button>
    <div class="wa-modal-backdrop" id="waModalBackdrop" aria-hidden="true">
      <div class="wa-modal" role="dialog" aria-modal="true" aria-labelledby="waModalTitle">
        <button class="wa-modal-close" type="button" aria-label="Close contact form">×</button>
        <div class="wa-modal-header">
          <div class="wa-modal-eyebrow">Quick Contact</div>
          <h2 class="wa-modal-title" id="waModalTitle">Send us a message</h2>
          <p class="wa-modal-copy">Share your name, email, mobile number and a short message.</p>
        </div>
        <form id="waContactForm" class="wa-contact-form" novalidate>
          <label class="wa-field">
            <span>Name</span>
            <input type="text" id="waName" name="name" required>
          </label>
          <label class="wa-field">
            <span>Email</span>
            <input type="email" id="waEmail" name="email" required>
          </label>
          <label class="wa-field">
            <span>Mobile</span>
            <input type="tel" id="waMobile" name="mobile" required>
          </label>
          <label class="wa-field">
            <span>Message</span>
            <textarea id="waMessage" name="message" rows="4" required></textarea>
          </label>
          <button class="wa-contact-submit" id="waSubmitBtn" type="submit">Send Message</button>
          <div class="wa-contact-status" id="waContactStatus" aria-live="polite"></div>
        </form>
      </div>
    </div>
  `;

  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  const navLinks = document.querySelectorAll("#header nav ul li a, .mobile-nav-links a");

  const servicePages = new Set([
    "shopify-development-agency-india.html",
    "seo-services-india.html",
    "website-development-company.html",
    "performance-marketing-agency.html"
  ]);

  const resolveActiveTarget = () => {
    const currentHash = window.location.hash;

    if (currentPath === "index.html") {
      if (currentHash === "#services") return "index.html#services";
      if (currentHash === "#projects") return "index.html#projects";
      if (currentHash === "#reviews") return "index.html#reviews";
      if (currentHash === "#contact") return "index.html#contact";
      return "index.html";
    }

    if (currentPath === "about.html") return "about.html";
    if (currentPath === "blog.html" || currentPath.startsWith("blog-")) return "blog.html";
    if (servicePages.has(currentPath)) return "index.html#services";

    return currentPath + currentHash;
  };

  const normalizeLinkTarget = (href) => {
    const url = new URL(href, window.location.href);
    const path = url.pathname.split("/").pop() || "index.html";
    return `${path}${url.hash}`;
  };

  const syncActiveLinks = () => {
    const activeTarget = resolveActiveTarget();
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", normalizeLinkTarget(href) === activeTarget);
    });
  };

  syncActiveLinks();
  window.addEventListener("hashchange", syncActiveLinks);

  // Automatically close mobile menu when clicking a link
  document.querySelectorAll('.mobile-nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      const toggle = document.getElementById('menu-toggle');
      if (toggle) toggle.checked = false;
    });
  });

  if (!document.getElementById("waOpenFormBtn")) {
    document.body.insertAdjacentHTML("beforeend", supportWidgetMarkup);
  }

  const getSupportRefs = () => ({
    wa: document.querySelector(".wa-float-widget"),
    contactSection: document.querySelector(".lt-root"),
    waOpenBtn: document.getElementById("waOpenFormBtn"),
    waModal: document.getElementById("waModalBackdrop"),
    waCloseBtn: document.querySelector(".wa-modal-close"),
    waForm: document.getElementById("waContactForm"),
    waStatus: document.getElementById("waContactStatus")
  });

  const { wa, contactSection, waForm } = getSupportRefs();

  if (wa && !wa.dataset.bound) {
    wa.dataset.bound = "true";

    wa.addEventListener("focusin", () => wa.classList.add("is-active"));
    wa.addEventListener("focusout", () => wa.classList.remove("is-active"));

    if (contactSection && "IntersectionObserver" in window) {
      const avoidForm = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            wa.classList.add("wa-avoid-form");
          } else {
            wa.classList.remove("wa-avoid-form");
          }
        });
      }, { threshold: 0.2 });

      avoidForm.observe(contactSection);
    }
  }

  function toggleWaModal(open) {
    const { waModal, waStatus } = getSupportRefs();
    if (!waModal) return;
    waModal.classList.toggle("open", open);
    waModal.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";

    if (!open && waStatus) {
      waStatus.textContent = "";
      waStatus.classList.remove("error");
    }
  }

  if (!document.body.dataset.waClickBound) {
    document.body.dataset.waClickBound = "true";
    document.addEventListener("click", (event) => {
      const openBtn = event.target.closest("#waOpenFormBtn, .wa-float-widget");
      const closeBtn = event.target.closest(".wa-modal-close");
      const { waModal } = getSupportRefs();

      if (openBtn) {
        toggleWaModal(true);
        return;
      }

      if (closeBtn) {
        toggleWaModal(false);
        return;
      }

      if (waModal && event.target === waModal) {
        toggleWaModal(false);
      }
    });
  }

  if (!document.body.dataset.waEscapeBound) {
    document.body.dataset.waEscapeBound = "true";
    document.addEventListener("keydown", (event) => {
      const { waModal } = getSupportRefs();
      if (event.key === "Escape" && waModal && waModal.classList.contains("open")) {
        toggleWaModal(false);
      }
    });
  }

  async function handleWaSubmit(event) {
    event.preventDefault();

    const { waStatus } = getSupportRefs();

    const name = document.getElementById("waName").value.trim();
    const email = document.getElementById("waEmail").value.trim();
    const mobile = document.getElementById("waMobile").value.trim();
    const message = document.getElementById("waMessage").value.trim();
    const mobileDigits = mobile.replace(/\D/g, "");

    if (!name || !email || !mobile || !message) {
      if (waStatus) {
        waStatus.textContent = "Please fill all required fields.";
        waStatus.classList.add("error");
      }
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (waStatus) {
        waStatus.textContent = "Please enter a valid email address.";
        waStatus.classList.add("error");
      }
      return;
    }

    if (mobileDigits.length < 10) {
      if (waStatus) {
        waStatus.textContent = "Please enter a valid mobile number.";
        waStatus.classList.add("error");
      }
      return;
    }

    const submitButton = document.getElementById("waSubmitBtn");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch("https://formspree.io/f/mzzypedk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          message,
          _subject: "WhatsApp contact form submission"
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const err = data && data.errors && data.errors[0] ? data.errors[0].message : "Unable to submit right now.";
        throw new Error(err);
      }

      if (waStatus) {
        waStatus.textContent = "Message sent! We'll get back to you shortly.";
        waStatus.classList.remove("error");
      }

      const { waForm: currentWaForm } = getSupportRefs();
      if (currentWaForm) currentWaForm.reset();
      setTimeout(() => toggleWaModal(false), 2200);
    } catch (error) {
      if (waStatus) {
        waStatus.textContent = error.message || "Submission failed. Please try again.";
        waStatus.classList.add("error");
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }
  }

  if (waForm && !waForm.dataset.bound) {
    waForm.dataset.bound = "true";
    waForm.addEventListener("submit", handleWaSubmit);
  }
});
