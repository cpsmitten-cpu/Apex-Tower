// Mobile nav
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

hamburger?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

mobileNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mobileNav.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
}));

// Smooth scroll for same-page anchors only
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Reveal animation
const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduced) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add("show");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".fadeUp").forEach(el => io.observe(el));
} else {
  document.querySelectorAll(".fadeUp").forEach(el => el.classList.add("show"));
}

// Footer year (if present)
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();


// =========================
// Tour Planner (X-factor)
// =========================
(function initTourPlanner(){
  const fab = document.getElementById("tourFab");
  const modal = document.getElementById("tourModal");
  const closeBtn = document.getElementById("tourClose");

  const arrivalEl = document.getElementById("tpArrival");
  const goalEl = document.getElementById("tpGoal");
  const modeEl = document.getElementById("tpMode");
  const confEl = document.getElementById("tpConf");
  const cafeEl = document.getElementById("tpCafe");
  const quietEl = document.getElementById("tpQuiet");

  const genBtn = document.getElementById("tpGenerate");
  const copyBtn = document.getElementById("tpCopy");
  const icsBtn = document.getElementById("tpIcs");
  const out = document.getElementById("tpOutput");
  const status = document.getElementById("tpStatus");

  // If this page doesn't include the planner, do nothing
  if (!fab || !modal || !closeBtn || !genBtn || !out) return;

  function setStatus(msg){
    if (!status) return;
    status.textContent = msg || "";
    if (msg) setTimeout(() => status.textContent = "", 2200);
  }

  function openModal(){
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // focus for accessibility
    closeBtn.focus();
  }

  function closeModal(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    fab.focus();
  }

  fab.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  // click outside to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // escape to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  function formatTimeBlocks(arrivalLabel){
    // We keep it simple and consistent; this is a static site demo.
    if (arrivalLabel.includes("9:00")) {
      return [
        "9:00–9:10  Arrival + lobby concierge check-in",
        "9:10–9:20  Tower overview + wayfinding",
        "9:20–9:40  Amenities pass (hydration stations, quiet zones)",
        "9:40–10:05 Conference room walkthrough",
        "10:05–10:20 Summit Market stop + wrap-up"
      ];
    }
    if (arrivalLabel.includes("12:00")) {
      return [
        "12:00–12:10 Arrival + lobby concierge check-in",
        "12:10–12:25 Tower overview + quick amenities pass",
        "12:25–12:55 Summit Market stop (lunch window)",
        "12:55–1:20  Conference room walkthrough",
        "1:20–1:30   Wrap-up + next steps"
      ];
    }
    return [
      "3:00–3:10  Arrival + lobby concierge check-in",
      "3:10–3:25  Tower overview + wayfinding",
      "3:25–3:50  Conference room walkthrough",
      "3:50–4:10  Quiet zones / phone booth preview",
      "4:10–4:20  Wrap-up (note: doors lock at 6:00 PM)"
    ];
  }

  function buildItinerary(){
    const arrival = arrivalEl?.value || "Morning (9:00 AM)";
    const goal = goalEl?.value || "Tour the building";
    const mode = modeEl?.value || "Driving";
    const wantsConf = !!confEl?.checked;
    const wantsCafe = !!cafeEl?.checked;
    const wantsQuiet = !!quietEl?.checked;

    const base = formatTimeBlocks(arrival);

    // Build a customized list from base blocks
    let blocks = base.filter(line => {
      if (!wantsConf && /Conference room/i.test(line)) return false;
      if (!wantsCafe && /Summit Market/i.test(line)) return false;
      if (!wantsQuiet && /(Quiet zones|phone booth)/i.test(line)) return false;
      return true;
    });

    // Ensure at least 3 items
    if (blocks.length < 3) blocks = base.slice(0,3);

    const notes = [];
    if (mode === "Driving") notes.push("Parking: validate at the front desk before leaving (Main St. Garage).");
    if (mode === "Rideshare") notes.push("Rideshare: use the main entrance for the cleanest arrival experience.");
    if (goal.includes("Client")) notes.push("Tip: start with a conference room preview—first impressions land best early.");
    if (goal.includes("Deep work")) notes.push("Tip: ask concierge to point you to the quietest zone and phone booths.");
    notes.push("Wi-Fi: Apex_Guest · password SummitView2026!");

    const title = `Apex Tower Visit Plan — ${arrival}`;
    const body =
`${title}

Goal: ${goal}
Arrival: ${arrival}
Mode: ${mode}

Itinerary:
- ${blocks.join("\n- ")}

Helpful notes:
- ${notes.join("\n- ")}

(All details are fictional for this demo site.)`;

    return { title, body, blocks };
  }

  genBtn.addEventListener("click", () => {
    const plan = buildItinerary();
    out.value = plan.body;
    setStatus("Itinerary generated.");
  });

  copyBtn?.addEventListener("click", async () => {
    if (!out.value) { setStatus("Generate an itinerary first."); return; }
    try{
      await navigator.clipboard.writeText(out.value);
      setStatus("Copied.");
    } catch {
      out.focus(); out.select();
      document.execCommand("copy");
      setStatus("Copied.");
    }
  });

  function pad2(n){ return String(n).padStart(2, "0"); }
  function toICSDate(dt){
    // UTC format: YYYYMMDDTHHMMSSZ
    return dt.getUTCFullYear()
      + pad2(dt.getUTCMonth()+1)
      + pad2(dt.getUTCDate())
      + "T"
      + pad2(dt.getUTCHours())
      + pad2(dt.getUTCMinutes())
      + "00Z";
  }

  function downloadICS(summary, description, startLocal){
    // startLocal is a Date in local time; we convert to UTC strings
    const start = new Date(startLocal.getTime());
    const end = new Date(startLocal.getTime() + 60*60*1000); // 60 min default
    const now = new Date();

    const uid = `apex-${Math.random().toString(16).slice(2)}@apextower`;
    const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apex Tower//Tour Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${toICSDate(now)}
DTSTART:${toICSDate(start)}
DTEND:${toICSDate(end)}
SUMMARY:${summary.replace(/\n/g, " ")}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
LOCATION:Apex Tower (Fictional)
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "apex-tower-visit.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  icsBtn?.addEventListener("click", () => {
    const plan = buildItinerary();
    out.value = plan.body;

    // Parse arrival time from dropdown label (9:00 AM / 12:00 PM / 3:00 PM)
    const arrivalLabel = arrivalEl?.value || "Morning (9:00 AM)";
    const match = arrivalLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

    const start = new Date();
    start.setSeconds(0); start.setMilliseconds(0);

    if (match){
      let hh = parseInt(match[1], 10);
      const mm = parseInt(match[2], 10);
      const ap = match[3].toUpperCase();
      if (ap === "PM" && hh !== 12) hh += 12;
      if (ap === "AM" && hh === 12) hh = 0;
      start.setHours(hh, mm, 0, 0);
    }

    downloadICS(plan.title, plan.body, start);
    setStatus("Calendar file downloaded.");
  });
})();
