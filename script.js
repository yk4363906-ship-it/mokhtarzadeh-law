  
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

// =====================================
// مدیریت دیدگاه‌ها با اتصال به Supabase
// =====================================

(function () {
  const SUPABASE_URL = "https://ecwrkmjxlkoxpbarxnev.supabase.co";
  const SUPABASE_KEY = "sb_publishable_PllZ5xkb7ez_ihE0_mVtAA_ydyXKZ7y";

  const commentForm = document.getElementById("commentForm");
  const commentList = document.getElementById("commentList");
  const commentMessage = document.getElementById("commentMessage");

  const nameInput = document.getElementById("commentName");
  const emailInput = document.getElementById("commentEmail");
  const textInput = document.getElementById("commentText");

  if (!commentForm || !commentList || !nameInput || !textInput) {
    console.error("بخش دیدگاه‌ها در HTML پیدا نشد.");
    return;
  }

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };

  function showMessage(message, isError) {
    if (!commentMessage) return;

    commentMessage.textContent = message;
    commentMessage.style.color = isError ? "#c0392b" : "#287a45";
  }

  function displayComments(comments) {
    commentList.replaceChildren();

    if (!comments.length) {
      commentList.textContent = "هنوز دیدگاهی ثبت نشده است.";
      return;
    }

    comments.forEach(function (item) {
      const card = document.createElement("div");
      card.style.cssText =
        "padding:15px;margin:12px 0;border:1px solid #d8c39a;border-radius:10px;background:#fff;";

      const name = document.createElement("strong");
      name.textContent = item.name || "کاربر";
      name.style.display = "block";
      name.style.color = "#a47c37";

      const message = document.createElement("p");
      message.textContent = item.comment || "";
      message.style.cssText = "margin:8px 0;line-height:2;color:#333;";

      const date = document.createElement("small");
      date.textContent = item.created_at
        ? new Date(item.created_at).toLocaleDateString("fa-IR")
        : "";

      card.append(name, message, date);
      commentList.appendChild(card);
    });
  }

  async function loadComments() {
    commentList.textContent = "در حال دریافت دیدگاه‌ها...";

    try {
      const response = await fetch(
        SUPABASE_URL +
          "/rest/v1/comments?select=id,name,comment,created_at&order=created_at.desc",
        {
          method: "GET",
          headers: headers,
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error("خطای دریافت دیدگاه‌ها: " + response.status);
      }

      const comments = await response.json();
      displayComments(comments);

    } catch (error) {
      console.error("خطای دریافت دیدگاه‌ها:", error);
      commentList.textContent =
        "دریافت دیدگاه‌ها با مشکل روبه‌رو شد. لطفاً کمی بعد دوباره تلاش کنید.";
    }
  }

  commentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : "";
    const comment = textInput.value.trim();

    if (!name || !comment) {
      showMessage("لطفاً نام و متن دیدگاه را وارد کنید.", true);
      return;
    }

    const submitButton = commentForm.querySelector(
      'button[type="submit"], button:not([type])'
    );

    if (submitButton) submitButton.disabled = true;

    showMessage("در حال ثبت دیدگاه...", false);

    try {
      const response = await fetch(
        SUPABASE_URL + "/rest/v1/comments",
        {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            name: name,
            email: email,
            comment: comment
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "خطای ثبت: " + response.status);
      }

      commentForm.reset();
      showMessage("دیدگاه شما با موفقیت ثبت شد.", false);
      await loadComments();

    } catch (error) {
      console.error("خطای ثبت دیدگاه:", error);
      showMessage(
        "ثبت دیدگاه انجام نشد. لطفاً دوباره تلاش کنید.",
        true
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  loadComments();
})();
