 
document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  // اتصال به Supabase
  const SUPABASE_URL = "https://ecwrkmjxlkoxpbarxnev.supabase.co";
  const SUPABASE_KEY = "sb_publishable_PllZ5xkb7ez_ihE0_mVtAA_ydyXKZ7y";

  const commentForm = document.getElementById("commentForm");
  const commentName = document.getElementById("commentName");
  const commentEmail = document.getElementById("commentEmail");
  const commentText = document.getElementById("commentText");
  const commentMessage = document.getElementById("commentMessage");
  const commentList = document.getElementById("commentList");

  // کوچک شدن هدر هنگام اسکرول
  function updateHeader() {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 35);
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // منوی موبایل
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      const opened = mainNav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(opened));
      menuToggle.textContent = opened ? "×" : "☰";
      menuToggle.setAttribute(
        "aria-label",
        opened ? "بستن منو" : "باز کردن منو"
      );
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-label", "باز کردن منو");
      });
    });

    document.addEventListener("click", function (event) {
      if (
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-label", "باز کردن منو");
      }
    });
  }

  // جست‌وجو در محتوای سایت
  const searchForm = document.getElementById("siteSearchForm");
  const searchInput = document.getElementById("siteSearch");
  const searchMessage = document.getElementById("searchMessage");

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clearHighlights() {
    document.querySelectorAll(".search-hit").forEach(function (section) {
      section.classList.remove("search-hit");
    });
  }

  if (searchForm && searchInput && searchMessage) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearHighlights();

      const query = normalizeText(searchInput.value);

      if (!query) {
        searchMessage.textContent = "عبارت موردنظر را وارد کنید.";
        return;
      }

      const sections = Array.from(
        document.querySelectorAll("main section[id]")
      ).filter(function (section) {
        return section.id !== "search-section";
      });

      const matches = sections.filter(function (section) {
        return normalizeText(section.innerText).includes(query);
      });

      if (matches.length > 0) {
        matches.forEach(function (section) {
          section.classList.add("search-hit");
        });

        searchMessage.textContent =
          "عبارت در " + matches.length +
          " بخش پیدا شد. بخش‌های مشخص‌شده را ببینید.";

        matches[0].scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } else {
        searchMessage.textContent =
          "چیزی پیدا نشد؛ عبارت دیگری مثل سوابق، قرارداد یا تماس را امتحان کنید.";
      }
    });

    searchInput.addEventListener("input", function () {
      if (!searchInput.value.trim()) {
        clearHighlights();
        searchMessage.textContent = "";
      }
    });
  }

  // پیام‌های بخش دیدگاه‌ها
  function setCommentMessage(message, isError) {
    if (!commentMessage) return;

    commentMessage.textContent = message;
    commentMessage.classList.toggle("error", Boolean(isError));
  }

  // ساخت درخواست امن به Supabase
  function supabaseHeaders(extraHeaders) {
    return Object.assign(
      {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      },
      extraHeaders || {}
    );
  }

  // دریافت دیدگاه‌ها
  async function loadComments() {
    if (!commentList) return;

    commentList.textContent = "در حال دریافت دیدگاه‌ها...";

    try {
      const response = await fetch(
        SUPABASE_URL +
        "/rest/v1/comments?select=id,name,comment,created_at&order=created_at.desc",
        {
          method: "GET",
          headers: supabaseHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const comments = await response.json();
      renderComments(comments);

    } catch (error) {
      console.error("خطا در دریافت دیدگاه‌ها:", error);
      commentList.textContent =
        "نمایش دیدگاه‌ها در حال حاضر امکان‌پذیر نیست.";
    }
  }

  // نمایش امن دیدگاه‌ها
  function renderComments(comments) {
    if (!commentList) return;

    commentList.replaceChildren();

    if (!Array.isArray(comments) || comments.length === 0) {
      commentList.textContent = "هنوز دیدگاهی ثبت نشده است.";
      return;
    }

    comments.forEach(function (item) {
      const article = document.createElement("article");
      article.className = "comment-item";

      const heading = document.createElement("div");
      heading.className = "comment-heading";

      const name = document.createElement("strong");
      name.textContent = item.name || "بازدیدکننده";

      const date = document.createElement("time");

      if (item.created_at) {
        const parsedDate = new Date(item.created_at);

        if (!Number.isNaN(parsedDate.getTime())) {
          date.dateTime = parsedDate.toISOString();
          date.textContent = parsedDate.toLocaleDateString("fa-IR");
        }
      }

      const text = document.createElement("p");
      text.textContent = item.comment || "";

      heading.append(name, date);
      article.append(heading, text);
      commentList.appendChild(article);
    });
  }

  // بارگذاری دیدگاه‌های قبلی
  loadComments();

  // ثبت دیدگاه جدید
  if (commentForm) {
    commentForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = commentName ? commentName.value.trim() : "";
      const email = commentEmail ? commentEmail.value.trim() : "";
      const comment = commentText ? commentText.value.trim() : "";

      if (!name || !email || !comment) {
        setCommentMessage(
          "لطفاً نام و نام خانوادگی، ایمیل و متن دیدگاه را وارد کنید.",
          true
        );
        return;
      }

      if (!commentEmail.checkValidity()) {
        setCommentMessage("لطفاً یک ایمیل معتبر وارد کنید.", true);
        return;
      }

      const submitButton = commentForm.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      if (submitButton) {
        submitButton.disabled = true;
      }

      setCommentMessage("در حال ثبت دیدگاه...", false);

      try {
        const response = await fetch(
          SUPABASE_URL + "/rest/v1/comments",
          {
            method: "POST",
            headers: supabaseHeaders({
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            }),
            body: JSON.stringify({
              name: name,
              email: email,
              comment: comment
            })
          }
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        commentForm.reset();

        setCommentMessage(
          "دیدگاه شما با موفقیت ثبت شد. سپاس از همراهی شما.",
          false
        );

        await loadComments();

      } catch (error) {
        console.error("خطا در ثبت دیدگاه:", error);

        setCommentMessage(
          "ثبت دیدگاه انجام نشد. تنظیمات دیتابیس و اتصال اینترنت را بررسی کنید.",
          true
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }
});
