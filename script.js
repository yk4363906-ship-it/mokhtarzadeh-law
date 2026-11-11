 
  // جست‌وجو و نمایش نتایج زیر کادر جست‌وجو
  const searchForm = document.getElementById("siteSearchForm");
  const searchInput = document.getElementById("siteSearch");
  const searchMessage = document.getElementById("searchMessage");

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/\u200c/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ساخت محل نمایش نتایج زیر جست‌وجو
  let searchResults = document.getElementById("searchResults");

  if (!searchResults && searchForm) {
    searchResults = document.createElement("div");
    searchResults.id = "searchResults";
    searchResults.style.cssText = `
      width: 100%;
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    if (searchMessage) {
      searchMessage.insertAdjacentElement("afterend", searchResults);
    } else {
      searchForm.insertAdjacentElement("afterend", searchResults);
    }
  }

  // ظاهر نتایج
  if (!document.getElementById("search-results-style")) {
    const style = document.createElement("style");
    style.id = "search-results-style";
    style.textContent = `
      #searchResults .search-result-item {
        display: block;
        width: 100%;
        padding: 14px;
        border: 1px solid #d8c39a;
        border-radius: 10px;
        background: #fff;
        color: #202b3c;
        text-align: right;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        font-family: inherit;
        line-height: 1.9;
      }

      #searchResults .search-result-item:hover {
        background: #f8f2e8;
        border-color: #b18a45;
      }

      #searchResults .search-result-title {
        display: block;
        font-weight: bold;
        color: #a47c37;
        margin-bottom: 5px;
      }

      #searchResults .search-result-text {
        display: block;
        font-size: 13px;
        color: #555;
      }
    `;
    document.head.appendChild(style);
  }

  function performSearch() {
    if (!searchInput || !searchResults) return;

    const query = normalizeText(searchInput.value);

    searchResults.replaceChildren();

    if (searchMessage) {
      searchMessage.textContent = "";
    }

    if (!query) return;

    const sections = Array.from(
      document.querySelectorAll("main section[id]")
    ).filter(function (section) {
      return section.id !== "search-section";
    });

    const matches = sections.filter(function (section) {
      return normalizeText(section.innerText).includes(query);
    });

    if (matches.length === 0) {
      if (searchMessage) {
        searchMessage.textContent = "مطلبی با این عبارت پیدا نشد.";
      }
      return;
    }

    matches.forEach(function (section) {
      const heading = section.querySelector("h1, h2, h3, h4");

      const title = heading
        ? heading.innerText.trim()
        : "مطالب سایت";

      // پیدا کردن پاراگراف مرتبط
      const paragraphs = Array.from(
        section.querySelectorAll("p, li, h3, h4")
      );

      const matchedParagraph = paragraphs.find(function (paragraph) {
        return normalizeText(paragraph.innerText).includes(query);
      });

      const excerpt = matchedParagraph
        ? matchedParagraph.innerText.trim()
        : section.innerText.trim();

      const result = document.createElement("button");
      result.type = "button";
      result.className = "search-result-item";

      const titleElement = document.createElement("span");
      titleElement.className = "search-result-title";
      titleElement.textContent = title;

      const textElement = document.createElement("span");
      textElement.className = "search-result-text";
      textElement.textContent =
        excerpt.length > 220
          ? excerpt.substring(0, 220) + "..."
          : excerpt;

      result.append(titleElement, textElement);

      // رفتن به بخش کامل مطلب با کلیک روی نتیجه
      result.addEventListener("click", function () {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        // بستن منوی موبایل در صورت باز بودن
        if (mainNav && menuToggle) {
          mainNav.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.textContent = "☰";
        }
      });

      searchResults.appendChild(result);
    });

    if (searchMessage) {
      searchMessage.textContent =
        matches.length + " بخش مرتبط پیدا شد. برای خواندن مطلب کامل کلیک کنید.";
    }
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      performSearch();
    });

    searchInput.addEventListener("input", performSearch);
  }
