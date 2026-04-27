const ITC = {
  build: "TC-OPS-REL-2409.17",
  email_support: "support@tradingcentre.me",
  email_compliance: "compliance@tradingcentre.me",

  feeds: [
    { name: "Investopedia", url: "https://www.investopedia.com/rss/news.rss" },
    { name: "Investing.com", url: "https://www.investing.com/rss/news.rss" }
  ],

  fallbackHeadlines: [
    { source: "Trading Center bulletin", title: "Verification holds: overview of review steps and clearance windows", link: "withdrawals.html" },
    { source: "Trading Center bulletin", title: "Imitation domains and misrepresented contact details (public notice)", link: "bulletins.html" },
    { source: "Trading Center bulletin", title: "Settlement sequencing controls and withdrawal routing guidance", link: "bulletins.html" }
  ]
};

const $ = (s)=>document.querySelector(s);
const $all = (s)=>Array.from(document.querySelectorAll(s));
const esc = (s)=>String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function mountHeaderBits(){
  $all("[data-build]").forEach(el => el.textContent = ITC.build);
  $all("[data-support-email]").forEach(el => el.textContent = ITC.email_support);
  $all("[data-compliance-email]").forEach(el => el.textContent = ITC.email_compliance);
}

/* -------- Mobile Hamburger Menu (Auto-Injected) -------- */
function initMobileMenu() {
  const header = document.querySelector('header.container');
  const nav = document.querySelector('.nav');
  if(!header || !nav) return;

  // 1. Create the button
  const menuBtn = document.createElement('button');
  menuBtn.className = 'hamburger-menu';
  menuBtn.setAttribute('aria-label', 'Toggle Navigation');
  
  // Default Hamburger Icon (3 lines)
  const iconBars = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
  // Close Icon (X)
  const iconClose = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  menuBtn.innerHTML = iconBars;

  // 2. Add it to the header
  header.appendChild(menuBtn);

  // 3. Add click event to open/close menu and swap icon
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
    if(nav.classList.contains('open')) {
      menuBtn.innerHTML = iconClose;
    } else {
      menuBtn.innerHTML = iconBars;
    }
  });
}

/* -------- RSS news (auto) -------- */
async function fetchTextViaProxy(url){
  const prox = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
  const r = await fetch(prox, { cache: "no-store" });
  if(!r.ok) throw new Error("Proxy fetch failed: " + r.status);
  return await r.text();
}

function parseRss(xmlText){
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const items = Array.from(doc.querySelectorAll("item")).slice(0, 12);
  return items.map(it => ({
    title: it.querySelector("title")?.textContent?.trim() || "Untitled",
    link: it.querySelector("link")?.textContent?.trim() || "#",
    pubDate: it.querySelector("pubDate")?.textContent?.trim() || ""
  }));
}

function renderNotices(targetSel, blocks){
  const wrap = $(targetSel);
  if(!wrap) return;
  wrap.innerHTML = "";
  blocks.forEach(b => {
    wrap.insertAdjacentHTML("beforeend", `
      <div class="notice">
        <div class="date">${esc(b.date || "")}${b.date ? " • " : ""}${esc(b.source || "")}</div>
        <div class="title" style="margin-top:4px;">
          <a href="${esc(b.link)}" target="${b.external ? "_blank" : "_self"}" rel="noreferrer noopener">${esc(b.title)}</a>
        </div>
        <p class="desc">${esc(b.desc || (b.external ? "External headline (opens new tab)." : ""))}</p>
      </div>
    `);
  });
}

async function mountAutoNews(targetSel){
  const status = $("#newsStatus");
  try{
    if(status) status.textContent = "Updating headlines…";
    const merged = [];
    for(const f of ITC.feeds){
      const xml = await fetchTextViaProxy(f.url);
      const items = parseRss(xml);
      items.slice(0,6).forEach(x=>{
        merged.push({
          date: x.pubDate || "",
          source: f.name,
          title: x.title,
          link: x.link,
          external: true,
          desc: "External RSS headline (opens new tab)."
        });
      });
    }
    merged.sort((a,b)=> (b.date||"").localeCompare(a.date||""));
    renderNotices(targetSel, merged.slice(0,12));
    if(status) status.textContent = "Live headlines loaded (RSS).";
  }catch(e){
    renderNotices(targetSel, ITC.fallbackHeadlines.map(h=>({
      date: "Notice",
      source: h.source,
      title: h.title,
      link: h.link,
      external: false,
      desc: "Fallback headlines (RSS blocked or temporarily unavailable)."
    })));
    if(status) status.textContent = "Fallback mode: internal notices shown.";
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  mountHeaderBits();
  mountAutoNews("#newsList");
  initMobileMenu(); /* Trigger the new menu! */
});
