/* ==========================================================================
   site-common.js
   একটি ইউনিভার্সেল হেডার/ফুটার লোডার।
   ব্যবহার: প্রতিটি নতুন পেজে নিচের দুটি ডিভ + এই স্ক্রিপ্ট ট্যাগ যোগ করলেই
   পেজটি স্বয়ংসম্পূর্ণ হয়ে যাবে — হেডার/ফুটারের HTML কপি-পেস্ট করার দরকার নেই।

     <div id="site-header"></div>
     ...page content...
     <div id="site-footer"></div>
     <script src="site-common.js"></script>

   ফাইল স্ট্রাকচার (সব ফাইল একই ফোল্ডারে, রুটে):
     header.html
     footer.html
     site-common.js
     index.html
     project-id-card.html
     ...

   গুরুত্বপূর্ণ: fetch() ব্যবহার হয় বলে এটি http(s):// দিয়ে সার্ভ করা পেজে
   কাজ করবে (যেমন GitHub Pages, Netlify, বা লোকাল সার্ভার — VS Code এর
   "Live Server" এক্সটেনশন / `python -m http.server`)। সরাসরি ফাইলে
   ডাবল-ক্লিক করে (file://) খুললে ব্রাউজার নিরাপত্তার কারণে fetch ব্লক
   করতে পারে।
   ========================================================================== */
(function () {
  // partials/header.html ও partials/footer.html — যেকোনো ফোল্ডার-গভীরতার
  // পেজ থেকে ঠিকভাবে খুঁজে পেতে বর্তমান স্ক্রিপ্টের অবস্থান থেকে পাথ ধরা হয়েছে।
  const scriptEl = document.currentScript;
  const base = scriptEl ? scriptEl.src.replace(/site-common\.js(\?.*)?$/, "") : "";

  async function includeHTML(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      el.innerHTML = await res.text();
    } catch (err) {
      console.error("Partial লোড করতে ব্যর্থ (" + url + "):", err);
      el.innerHTML =
        '<div class="text-danger small p-2">Header/Footer লোড করা যায়নি। এই পেজটি একটি লোকাল/অনলাইন সার্ভার দিয়ে সার্ভ করা হচ্ছে কিনা যাচাই করুন।</div>';
    }
  }

  function highlightActiveLink() {
    const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("#mainNav .nav-link, #mainNav .dropdown-item").forEach((a) => {
      const href = (a.getAttribute("href") || "").split("#")[0].toLowerCase();
      if (href && href === current) {
        a.classList.add("active");
      }
    });
  }

  function bindNavScrollShrink() {
    const nav = document.getElementById("mainNav");
    if (!nav) return;
    const toggle = () => {
      nav.classList.toggle("py-2", window.scrollY > 30);
      nav.classList.toggle("py-3", window.scrollY <= 30);
    };
    window.addEventListener("scroll", toggle);
    toggle();
  }

  document.addEventListener("DOMContentLoaded", async function () {
    await Promise.all([
      includeHTML("#site-header", base + "header.html"),
      includeHTML("#site-footer", base + "footer.html"),
    ]);

    highlightActiveLink();
    bindNavScrollShrink();

    // পেজ-স্পেসিফিক স্ক্রিপ্টগুলো (যেগুলো হেডার লোড হওয়ার পর চালানো দরকার)
    // এই ইভেন্টটির জন্য অপেক্ষা করতে পারে:
    //   document.addEventListener('partialsLoaded', function(){ ... });
    document.dispatchEvent(new Event("partialsLoaded"));
  });
})();
