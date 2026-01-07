const ITC = {
  build: "ITC-PUB • rev. 2025.12.29",
  email_support: "support@trading-center.me",
  email_compliance: "compliance@trading-center.me",

  feeds: [
    { name: "Investopedia", url: "https://www.investopedia.com/rss/news.rss" },
    { name: "Investing.com", url: "https://www.investing.com/rss/news.rss" }
  ],

  fallbackHeadlines: [
    { source: "Trading Centre bulletin", title: "Verification holds: overview of review steps and clearance windows", link: "withdrawals.html" },
    { source: "Trading Centre bulletin", title: "Imitation domains and misrepresented contact details (public notice)", link: "bulletins.html" },
    { source: "Trading Centre bulletin", title: "Settlement sequencing controls and withdrawal routing guidance", link: "bulletins.html" }
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
        <div class="title">
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

/* -------- Wallpapers (embedded) -------- */
function svgToDataUri(svg){
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function mountWallpapers(){
  const list = $("#wallList");
  if(!list) return;

  const wpPhone = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#06162c"/>
      <stop offset=".55" stop-color="#0a3a84"/>
      <stop offset="1" stop-color="#eef3fb"/>
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="25%" r="70%">
      <stop offset="0" stop-color="#0c6aa6" stop-opacity=".35"/>
      <stop offset=".6" stop-color="#0c6aa6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#g)"/>
  <rect width="1080" height="1920" fill="url(#r)"/>
  <circle cx="540" cy="770" r="250" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="10"/>
  <path d="M320 770h440" stroke="#fff" stroke-opacity=".8" stroke-width="10"/>
  <path d="M540 520c85 70 85 760 0 500" stroke="#fff" stroke-opacity=".8" stroke-width="10" fill="none"/>
  <text x="540" y="1120" font-size="44" text-anchor="middle" fill="#ffffff" fill-opacity=".92"
        font-family="system-ui,Segoe UI,Roboto,Helvetica,Arial">TRADING CENTRE</text>
  <text x="540" y="1175" font-size="26" text-anchor="middle" fill="#ffffff" fill-opacity=".75"
        font-family="ui-monospace,Menlo,Consolas,monospace">OVERSIGHT • CLEARANCE • COMPLIANCE</text>
</svg>`;

  const wpDesk = `
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="#06162c"/>
  <g opacity=".18" stroke="#8db6ff" stroke-width="1">
    ${Array.from({length: 45}, (_,i)=>`<line x1="${i*44}" y1="0" x2="${i*44}" y2="1080"/>`).join("")}
    ${Array.from({length: 26}, (_,i)=>`<line x1="0" y1="${i*44}" x2="1920" y2="${i*44}"/>`).join("")}
  </g>
  <rect x="70" y="70" width="1780" height="940" rx="22" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="2"/>
  <circle cx="1680" cy="200" r="96" fill="none" stroke="#ffffff" stroke-opacity=".65" stroke-width="8"/>
  <path d="M1584 200h192" stroke="#fff" stroke-opacity=".7" stroke-width="8"/>
  <path d="M1680 110c32 30 32 260 0 180" stroke="#fff" stroke-opacity=".7" stroke-width="8" fill="none"/>
  <text x="120" y="165" font-size="34" fill="#ffffff" fill-opacity=".92" font-family="system-ui,Segoe UI,Roboto,Helvetica,Arial">
    TRADING CENTRE — COMPLIANCE INFORMATION SERVICE
  </text>
  <text x="120" y="215" font-size="22" fill="#ffffff" fill-opacity=".70" font-family="ui-monospace,Menlo,Consolas,monospace">
    Monitoring • Transaction Security • Settlement Clearance • Withdrawal Controls
  </text>
</svg>`;

  const items = [
    {name:"Phone wallpaper (1080×1920)", file:"TradingCentre_Wallpaper_Phone.svg", svg:wpPhone},
    {name:"Desktop wallpaper (1920×1080)", file:"TradingCentre_Wallpaper_Desktop.svg", svg:wpDesk}
  ];

  list.innerHTML = "";
  items.forEach(it => {
    const uri = svgToDataUri(it.svg);
    list.insertAdjacentHTML("beforeend", `
      <div class="wallrow">
        <div class="thumb"><img alt="" src="${uri}"/></div>
        <div>
          <div style="font-weight:900">${esc(it.name)}</div>
          <div class="small">Downloadable SVG • generated locally in-browser</div>
          <div style="margin-top:8px"><a href="${uri}" download="${esc(it.file)}">Download</a></div>
        </div>
      </div>
    `);
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  mountHeaderBits();
  mountAutoNews("#newsList");
  mountWallpapers();
});
