/* ============================================================
   Gian-Portfolio — script.js
   Plain JavaScript for the four required interactive features:
     1. Hamburger menu (slide-in navigation drawer)
     2. Smooth scrolling for anchor links
     3. Dark/light mode toggle (with saved preference)
     4. Contact form validation
   Everything runs after the HTML has finished loading.
   ============================================================ */

// Wait for the DOM to be ready before touching any elements.
document.addEventListener("DOMContentLoaded", function () {
  /* ------------------------------------------------------------
     THEME HANDLING
     The page starts in dark mode (like the original site). We
     then apply the visitor's saved choice, or fall back to the
     operating system's color-scheme preference.
     ------------------------------------------------------------ */

  // The <html> element; the theme is controlled via data-theme.
  var root = document.documentElement;

  // The key used to remember the choice between visits.
  var THEME_STORAGE_KEY = "portfolio-theme";

  // Read the saved theme from localStorage.
  // Wrapped in try/catch because some browsers block storage
  // (for example in strict privacy modes).
  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
      return null; // Storage unavailable: ignore and use defaults.
    }
  }

  // Save the chosen theme to localStorage, ignoring errors.
  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      // Storage unavailable: the choice just won't persist.
    }
  }

  // Ask the operating system which theme the user prefers.
  function getSystemTheme() {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }

  // Apply a theme ("light" or "dark") to the page and the toggle button.
  function applyTheme(theme) {
    // Switch the CSS variables by swapping data-theme on <html>.
    root.setAttribute("data-theme", theme);

    // Grab the toggle button and update it to match the theme.
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      // aria-pressed=true means "dark is currently active".
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");

      // The label always describes what clicking will do next.
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  // Decide the starting theme: saved choice first, then system.
  var startingTheme = getSavedTheme() || getSystemTheme();
  applyTheme(startingTheme);

  // Flip between light and dark when the toggle button is clicked.
  function handleThemeToggle() {
    // Read the current theme straight from <html>.
    var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";

    // The next theme is simply the opposite of the current one.
    var next = current === "dark" ? "light" : "dark";

    applyTheme(next); // Update the page and the button.
    saveTheme(next); // Remember the choice for next visit.
  }

  // Wire up the toggle button click.
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", handleThemeToggle);
  }

  /* ------------------------------------------------------------
     1. HAMBURGER MENU
     The nav is a slide-in drawer on the right side of the screen.
     Clicking the hamburger opens it; clicking a link, the close
     button, the overlay, or pressing Escape closes it.
     ------------------------------------------------------------ */

  // Element references for the drawer and its controls.
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var navOverlay = document.getElementById("nav-overlay");
  var navClose = document.getElementById("nav-close");

  // Open the navigation drawer.
  function openNav() {
    siteNav.classList.add("open");
    navOverlay.classList.add("show");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
  }

  // Close the navigation drawer.
  function closeNav() {
    siteNav.classList.remove("open");
    navOverlay.classList.remove("show");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  }

  // Toggle the drawer when the hamburger is clicked.
  navToggle.addEventListener("click", function () {
    // If the drawer is open, close it; otherwise open it.
    if (siteNav.classList.contains("open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  // The X button inside the drawer closes it.
  navClose.addEventListener("click", closeNav);

  // Clicking the dimmed overlay outside the drawer closes it.
  navOverlay.addEventListener("click", closeNav);

  // Pressing Escape also closes the drawer (keyboard support).
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && siteNav.classList.contains("open")) {
      closeNav();
    }
  });

  /* ------------------------------------------------------------
     2. SMOOTH SCROLLING
     Every link with data-scroll-link scrolls smoothly to its
     target section instead of jumping. A small offset is added
     so the section title is never flush against the top of the
     viewport where the fixed buttons sit.
     ------------------------------------------------------------ */

  // Breathing room between the viewport top and the section.
  var SCROLL_OFFSET = 16;

  // Animate the scroll ourselves with requestAnimationFrame.
  // This is only used as a fallback for environments (embedded
  // browsers, kiosk modes) that ignore native smooth scrolling.
  function animateScroll(startY, distance) {
    var duration = 600; // total animation time in milliseconds
    var startTime = null;

    // Ease-in-out curve so the motion starts and ends gently.
    function ease(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Move the page a little closer to the target every frame.
    function step(now) {
      if (startTime === null) {
        startTime = now;
      }
      var progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * ease(progress));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  // Scroll smoothly to a Y position, with a manual fallback.
  function smoothScrollTo(top) {
    var startY = window.pageYOffset;

    // First try the browser's built-in smooth scrolling.
    window.scrollTo({ top: top, behavior: "smooth" });

    // If the page has not moved at all shortly after, the
    // browser ignored the smooth option: animate it manually.
    window.setTimeout(function () {
      if (Math.abs(window.pageYOffset - startY) < 1) {
        animateScroll(startY, top - startY);
      }
    }, 80);
  }

  // Smoothly scroll to the section an anchor points at.
  function scrollToSection(anchor) {
    // href="#about" -> section id "about".
    var targetId = anchor.getAttribute("href").slice(1);
    var target = document.getElementById(targetId);

    if (target) {
      // Distance from the top of the page to the section,
      // minus our small offset.
      var top = target.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;

      smoothScrollTo(top);

      // Update the URL hash without causing a jump.
      if (history.pushState) {
        history.pushState(null, "", "#" + targetId);
      }
    }
  }

  // Attach the smooth-scroll behavior to every matching link.
  var scrollLinks = document.querySelectorAll("[data-scroll-link]");
  scrollLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      // Stop the browser's instant jump.
      event.preventDefault();

      scrollToSection(link);

      // If the drawer is open (mobile navigation), close it.
      closeNav();
    });
  });

  /* ------------------------------------------------------------
     4. CONTACT FORM VALIDATION
     The form never actually submits anywhere. On submit we
     check the required fields and the email format, show inline
     error messages next to invalid fields, and show a success
     message only when everything is valid.
     ------------------------------------------------------------ */

  // Grab the form and the fields we validate.
  var form = document.getElementById("contact-form");
  var nameInput = document.getElementById("contact-name");
  var emailInput = document.getElementById("contact-email");
  var messageInput = document.getElementById("contact-message");
  var successMessage = document.getElementById("form-success");

  // Simple email pattern: text@text.text with no spaces.
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Show an error message below a field and mark it invalid.
  function showFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    errorElement.hidden = false;
    input.classList.add("invalid");
  }

  // Clear a field's error state (used when a field becomes valid).
  function clearFieldError(input, errorElement) {
    errorElement.textContent = "";
    errorElement.hidden = true;
    input.classList.remove("invalid");
  }

  // Validate every field; returns true when the form is valid.
  function validateForm() {
    var isValid = true; // Assume valid until a check fails.

    // Name: required (trimmed so spaces don't count).
    if (nameInput.value.trim() === "") {
      showFieldError(
        nameInput,
        document.getElementById("name-error"),
        "Please enter your name."
      );
      isValid = false;
    } else {
      clearFieldError(nameInput, document.getElementById("name-error"));
    }

    // Email: required and must match the email pattern.
    if (emailInput.value.trim() === "") {
      showFieldError(
        emailInput,
        document.getElementById("email-error"),
        "Please enter your email."
      );
      isValid = false;
    } else if (!EMAIL_PATTERN.test(emailInput.value.trim())) {
      showFieldError(
        emailInput,
        document.getElementById("email-error"),
        "Please enter a valid email address (for example, you@example.com)."
      );
      isValid = false;
    } else {
      clearFieldError(emailInput, document.getElementById("email-error"));
    }

    // Message: required.
    if (messageInput.value.trim() === "") {
      showFieldError(
        messageInput,
        document.getElementById("message-error"),
        "Please enter a message."
      );
      isValid = false;
    } else {
      clearFieldError(messageInput, document.getElementById("message-error"));
    }

    return isValid;
  }

  // Handle the submit event of the contact form.
  form.addEventListener("submit", function (event) {
    // Stop the browser from reloading or sending the form.
    event.preventDefault();

    // Always hide the old success message before re-checking.
    successMessage.hidden = true;

    if (validateForm()) {
      // Everything is valid: show the success note and reset.
      successMessage.hidden = false;
      form.reset();
    } else {
      // Focus the first invalid field to help keyboard users.
      var firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  });

  // Clear a field's error as soon as the user starts fixing it.
  nameInput.addEventListener("input", function () {
    clearFieldError(nameInput, document.getElementById("name-error"));
  });
  emailInput.addEventListener("input", function () {
    clearFieldError(emailInput, document.getElementById("email-error"));
  });
  messageInput.addEventListener("input", function () {
    clearFieldError(messageInput, document.getElementById("message-error"));
  });
});
