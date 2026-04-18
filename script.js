const body = document.body;
const currentPage = body.dataset.page || "home";
const header = document.querySelector("#site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const yearNode = document.querySelector("#current-year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

document.querySelectorAll("[data-nav]").forEach((link) => {
  link.classList.toggle("is-active", link.dataset.nav === currentPage);
});

const handleHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

handleHeaderState();
window.addEventListener("scroll", handleHeaderState, { passive: true });

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open", !expanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = prefersReducedMotion.matches ? 0 : 1600;

    if (!target) {
      counter.textContent = "0";
      return;
    }

    if (duration === 0) {
      counter.textContent = String(target);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.floor(target * eased));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = String(target);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.55 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counters.forEach((counter) => {
    counter.textContent = counter.dataset.target || "0";
  });
}

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".testimonial-card"));
  const prevButton = carousel.querySelector(".carousel-button.prev");
  const nextButton = carousel.querySelector(".carousel-button.next");
  const viewport = carousel.querySelector(".carousel-viewport");
  const dotsHost = carousel.querySelector(".carousel-dots");
  let activeIndex = 0;
  let autoPlayId = null;

  if (!slides.length) {
    return;
  }

  const syncViewportHeight = () => {
    if (!viewport) {
      return;
    }

    const tallest = slides.reduce((height, slide) => {
      return Math.max(height, slide.offsetHeight);
    }, 0);

    if (tallest > 0) {
      viewport.style.minHeight = `${tallest}px`;
    }
  };

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    if (dotsHost) {
      Array.from(dotsHost.children).forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
        dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
      });
    }

    syncViewportHeight();
  };

  const startAutoPlay = () => {
    if (prefersReducedMotion.matches || slides.length < 2) {
      return;
    }

    window.clearInterval(autoPlayId);
    autoPlayId = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5200);
  };

  if (dotsHost) {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
      dot.addEventListener("click", () => {
        showSlide(index);
        startAutoPlay();
      });
      dotsHost.appendChild(dot);
    });
  }

  prevButton?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startAutoPlay();
  });

  nextButton?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startAutoPlay();
  });

  showSlide(0);
  startAutoPlay();
  window.addEventListener("resize", syncViewportHeight);
});

document.querySelectorAll("[data-faq-item]").forEach((item) => {
  const button = item.querySelector("[data-faq-question]");

  button?.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    item.classList.toggle("is-open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
  });
});

document.querySelectorAll("[data-gallery-filter-group]").forEach((group) => {
  const buttons = Array.from(group.querySelectorAll("[data-gallery-filter]"));
  const targetSelector = group.dataset.galleryFilterGroup;
  const cards = Array.from(document.querySelectorAll(targetSelector));

  if (!buttons.length || !cards.length) {
    return;
  }

  const applyFilter = (value) => {
    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.galleryFilter === value);
      button.setAttribute(
        "aria-pressed",
        button.dataset.galleryFilter === value ? "true" : "false"
      );
    });

    cards.forEach((card) => {
      const categories = (card.dataset.category || "")
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean);
      const shouldShow = value === "all" || categories.includes(value);
      card.hidden = !shouldShow;
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.galleryFilter || "all");
    });
  });

  applyFilter("all");
});

const outletsBody = document.querySelector("#outlets-body");

if (outletsBody && Array.isArray(window.OUTLETS_DATA)) {
  const searchInput = document.querySelector("#outlet-search");
  const sizeSelect = document.querySelector("#outlet-size");
  const statusNode = document.querySelector("#outlets-status");
  const paginationNode = document.querySelector("#outlets-pagination");
  let currentPageIndex = 1;
  let perPage = Number(sizeSelect?.value || 16);
  let searchTerm = "";

  const getFilteredRows = () => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return window.OUTLETS_DATA;
    }

    return window.OUTLETS_DATA.filter((row) => {
      return [row.name, row.location, row.contact]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  };

  const renderPagination = (totalPages) => {
    if (!paginationNode) {
      return;
    }

    paginationNode.innerHTML = "";

    if (totalPages <= 1) {
      return;
    }

    const createButton = (label, page, isDisabled = false, isActive = false) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = isDisabled;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-label", `Go to page ${page}`);

      button.addEventListener("click", () => {
        currentPageIndex = page;
        renderOutlets();
      });

      paginationNode.appendChild(button);
    };

    createButton("Prev", Math.max(1, currentPageIndex - 1), currentPageIndex === 1);

    for (let page = 1; page <= totalPages; page += 1) {
      createButton(String(page), page, false, page === currentPageIndex);
    }

    createButton(
      "Next",
      Math.min(totalPages, currentPageIndex + 1),
      currentPageIndex === totalPages
    );
  };

  const renderOutlets = () => {
    const rows = getFilteredRows();
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    currentPageIndex = Math.min(currentPageIndex, totalPages);

    const startIndex = total === 0 ? 0 : (currentPageIndex - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, total);
    const visibleRows = rows.slice(startIndex, endIndex);

    outletsBody.innerHTML = "";

    if (!visibleRows.length) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML =
        '<td colspan="4" class="empty-state">No outlets match your search yet.</td>';
      outletsBody.appendChild(emptyRow);
    } else {
      visibleRows.forEach((row) => {
        const tableRow = document.createElement("tr");
        const phone = row.contact ? row.contact : "-";

        tableRow.innerHTML = `
          <td>${row.id}</td>
          <td>${row.name}</td>
          <td>${row.location}</td>
          <td>${phone}</td>
        `;

        outletsBody.appendChild(tableRow);
      });
    }

    if (statusNode) {
      const showingFrom = total === 0 ? 0 : startIndex + 1;
      statusNode.textContent = `Showing ${showingFrom} to ${endIndex} of ${total} entries`;
    }

    renderPagination(totalPages);
  };

  searchInput?.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    currentPageIndex = 1;
    renderOutlets();
  });

  sizeSelect?.addEventListener("change", (event) => {
    perPage = Number(event.target.value || 16);
    currentPageIndex = 1;
    renderOutlets();
  });

  renderOutlets();
}
