(function () {
  // Shared roadmap engine. Each client's page sets window.ROADMAP (see README), then loads this file.
  const C = window.ROADMAP;
  const CLIENT = C.client;
  const TOKEN = C.token;
  const NAME = C.firstName;
  const BONUS = !!C.bonusWeek;
  const API = "/api";
  // Optional per-client wording: a client's settings can set copy.<key> to replace the default text
  const COPY = C.copy || {};
  const T = (k, d) => (k in COPY ? COPY[k] : d);

  const parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
  const fmt = d => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const short = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dayName = d => d.toLocaleDateString("en-US", { weekday: "long" });
  const ymd = d => d.getFullYear() + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  const iso = d => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  const addDay = d => { const n = new Date(d); n.setDate(n.getDate()+1); return n; };
  const addDays = (d, k) => { const n = new Date(d); n.setDate(n.getDate()+k); return n; };
  const today = new Date(); today.setHours(0,0,0,0);
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  // Dates: everything on the page comes from these
  const D = {};
  Object.keys(C.dates).forEach(k => { D[k] = parse(C.dates[k]); });
  D.bonus = addDays(D.adsOn, 7);
  if (!D.recap) D.recap = addDays(D.adsOn, BONUS ? 14 : 7);  // a client can set dates.recap to override
  const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const weeks = Math.ceil((D.complete - D.access) / 86400000 / 7);

  const EMAIL = "admin@whitneybateson.com";
  const ZAPIER_NOTE = "Don't have a paid plan yet? Hold off on buying one until closer to " + short(D.revisionsDue) + ", so you're not paying for time you won't use. On GoHighLevel? Skip this one.";

  // "got" comes from received in the client's settings (your confirmation)
  const got = C.received || {};
  const access = [
    { id: "email", item: "Email software access", short: "Add " + EMAIL + " as a user on your email platform.", more: "If your plan doesn't allow extra users, share your login through LastPass (or another secure password tool) with " + EMAIL + " instead.", due: C.dates.access, got: !!got.email },
    { id: "web", item: "Website access", short: "Add " + EMAIL + " as a user on your website. Already a WBDS website client? Skip this one, we already have access.", due: C.dates.access, got: !!got.web },
    C.digitalSeroUrl
      ? { id: "fb", item: "Facebook access", short: "Click your DigitalSero link. It only works once, so open it when you're ready to finish.", due: C.dates.access, got: !!got.fb, link: C.digitalSeroUrl, linkText: "Open my DigitalSero link" }
      : { id: "fb", item: "Facebook access", short: "Click the DigitalSero link we email you. It only works once, so open it when you're ready to finish.", due: C.dates.access, got: !!got.fb },
    { id: "ack", item: "Acknowledge your schedule", short: "Read how reviews and ad support work, then submit the short form below.", due: C.dates.access, got: !!got.ack, form: "ack", link: "#ack-form", linkText: "Read it below", internal: true }
  ];
  const step1Hidden = access.every(a => a.got);

  // Things to review. Links come from reviewLinks / commandCenterUrl; until then the page says "Link coming soon".
  const RL = C.reviewLinks || {};
  const reviews = [
    { form: "direction", item: "Your lead magnet direction", ready: C.dates.directionArrives, due: C.dates.directionDue, url: RL.direction || "#", linkText: "Open your direction",
      short: "What we recommend for your freebie: what it is, who it's for, and why your people will want it." },
    { form: "lmemail", item: "Your lead magnet and email sequence", ready: C.dates.lmArrives, due: C.dates.revisionsDue, url: RL.lmemail || "#", linkText: "Open your lead magnet and emails",
      short: "Your finished freebie and the welcome emails that follow it. Send all your changes in one list." },
    { form: "edits", item: "Your pages and ads", ready: C.dates.handoff, due: C.dates.editsDue, url: C.commandCenterUrl || "#", linkText: "Open your Funnel Command Center",
      short: "A quick, high-level look at your opt-in page, thank you page and ads. Flag anything that's wrong or doesn't sound like you." }
  ];
  const zapier = { id: "zap", item: "Zapier access", short: "Share your Zapier login through LastPass (or another secure password tool) with " + EMAIL + ".", more: ZAPIER_NOTE, got: !!got.zap };

  // ---- Page shell ----
  document.body.insertAdjacentHTML("afterbegin", `
  <header class="hero">
  <svg class="hero-map" viewBox="0 0 420 320" aria-hidden="true" preserveAspectRatio="xMaxYMid meet">
    <path d="M330 300 C 400 260, 300 210, 350 160 S 420 110, 370 70 S 380 20, 405 20" fill="none" stroke="#02525D" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 12" opacity=".45"/>
    <g transform="translate(330 300)"><path d="M0-22a11 11 0 0 1 11 11c0 8-11 18-11 18s-11-10-11-18a11 11 0 0 1 11-11z" fill="#02525D"/><circle cy="-11" r="4" fill="#FFFFFF"/></g>
    <g transform="translate(350 160)"><path d="M0-22a11 11 0 0 1 11 11c0 8-11 18-11 18s-11-10-11-18a11 11 0 0 1 11-11z" fill="#FF7F50"/><circle cy="-11" r="4" fill="#FFFFFF"/></g>
    <g transform="translate(405 20)"><path d="M0-22a11 11 0 0 1 11 11c0 8-11 18-11 18s-11-10-11-18a11 11 0 0 1 11-11z" fill="#02525D"/><circle cy="-11" r="4" fill="#DDEEEC"/></g>
  </svg>
  <div class="hero-inner">
    <!-- LOGO: swap this text for <img src="data:image/png;base64,..." alt="Whitney Bateson Digital Strategy"> once the PNG is available -->
    <p class="brand">Whitney Bateson Digital Strategy</p>
    <p class="eyebrow">Hi, ${NAME}!</p>
    <h1>Here's your funnel <span style="white-space:nowrap">roadmap 🗺️</span></h1>
    <p class="lede">${T("intro", "We are SO excited to get building for you. This is every stop between today and your ads going live.")}</p>
    <p class="lede">The coral pins are your stops, the few times we need something from you. Everything else is on us, and each stop gets a stamp once it's done.</p>
    <dl class="glance">
      <div><dt>Funnel handoff</dt><dd>${short(D.handoff)}</dd></div>
      <div><dt>Ads go live</dt><dd>${short(D.adsOn)}</dd></div>
    </dl>
  </div>
  </header>
  <div class="wrap">

  <section class="next" id="next" aria-live="polite"></section>

  <div class="links">
    <p>Bookmark this page. Everything you need for your funnel build lives right here. Questions? Email us at <a class="mail" href="mailto:admin@whitneybateson.com">admin@whitneybateson.com</a></p>
  </div>

  <!-- Step 1 shows until every access item is marked received in the client's settings -->
  <section class="access" id="access" aria-labelledby="access-h"${step1Hidden ? " hidden" : ""}>
    <div class="s1-head">
      <h2 id="access-h">Step 1: Give us access 🔑</h2>
      <div class="s1-progress" aria-live="polite"><span class="s1-count"></span><span class="s1-bar"><i></i></span></div>
    </div>
    <div class="s1-complete" hidden>
      <p><strong>Step 1 is done. Thank you! 🙌</strong> We'll double-check everything on our end and let you know if we need anything else.</p>
      <button type="button" class="s1-toggle" aria-expanded="false">Show details</button>
    </div>
    <div class="s1-body">
      <p class="access-intro">${T("accessIntro", "Before we can start building")}, we need access to a few things. Tick each one off as you finish it.</p>
      <ul id="access-list"></ul>
      <div id="ack-form" class="form-slot" data-form="ack"></div>
      <p class="s1-later"><strong>Coming up later:</strong> Zapier access isn't needed until ${fmt(D.revisionsDue)}. You'll find it on that stop below.</p>
    </div>
  </section>

  <section class="review" id="review" aria-labelledby="review-h"${C.showReview === false ? " hidden" : ""}>
    <h2 id="review-h">Ready for your review 👀</h2>
    <p class="review-intro">Everything we send you to look over lands here. Open it, then send your feedback through the form on that stop.</p>
    <ul id="review-list"></ul>
  </section>

  <div class="phase-head">
    <span class="phase-num">Phase 1</span>
    <h2>${T("phase1Title", "Building your funnel")}</h2>
    <p>${short(D.access)} to ${short(D.complete)}. This is where we need you, just four quick stops.</p>
  </div>

  <div class="legend" aria-hidden="true">
    <span><i class="pin y"></i>Your stop</span>
    <span><i class="pin"></i>We deliver to you</span>
  </div>

  <ol class="route" id="route"></ol>

  <section class="headstart" aria-labelledby="hs-h">
    <span class="phase-num">Anytime now</span>
    <h2 id="hs-h">Get a head start with Ads Made Simple 🎓</h2>
    <p>You don't have to wait for your ads to go live. Your course is ready now, and we recommend starting with the modules on reading your results and making simple edits (you can skip setup, since we handle that part).</p>
    <p>By the time ad support starts, you'll know your way around your ad account and can bring us specific questions about anything in the course or your ads.</p>
    <div class="hs-row">
      <a class="xbtn" href="https://tools.whitneybateson.com/ads/course-login/" target="_blank" rel="noopener">Start the course</a>
      <span class="hs-login">Username: your email address<br>Password: your last name</span>
    </div>
  </section>

  <section class="phase2" aria-labelledby="p2-h">
    <div class="phase-head">
      <span class="phase-num">Phase 2</span>
      <h2 id="p2-h">Your ads go live</h2>
      <p>${short(D.adsOn)} to ${short(D.recap)}. One quick step from you, then we take it from here, watching your ads and your whole funnel to make sure your automations are running, emails are sending and new subscribers are flowing in.</p>
    </div>
    <ol class="p2-track${BONUS ? "" : " two"}">
      <li class="p2-stop yours-p2" data-date="${iso(D.adsOn)}">
        <span class="p2-dot" aria-hidden="true"></span>
        <span class="p2-date">${fmt(D.adsOn)} <span class="tag">Your stop</span></span>
        <h3>Turn on your ads 🚀</h3>
        <p>Watch the video in your Funnel Command Center, turn your ads on, then let us know so we can check everything's running.</p>
      </li>
      ${BONUS ? `<li class="p2-stop bonus" data-date="${iso(D.bonus)}">
        <span class="p2-dot" aria-hidden="true"></span>
        <span class="p2-date">${fmt(D.bonus)}</span>
        <h3>Bonus week kicks in 🎁</h3>
        <p>${T("bonusNote", "You signed up within 24 hours, so you get a second week of us keeping watch and answering questions.")}</p>
      </li>` : ""}
      <li class="p2-stop" data-date="${iso(D.recap)}">
        <span class="p2-dot" aria-hidden="true"></span>
        <span class="p2-date">${fmt(D.recap)}</span>
        <h3>Your recap 📊</h3>
        <p>How your ads are performing, what your email data is showing, and our recommendations for what's next.</p>
      </li>
    </ol>
    <div class="p2-bar${BONUS ? "" : " one"}" aria-hidden="true">
      <span class="w1">${BONUS ? "Week 1 (included)" : "Your ad support week"}</span>
      ${BONUS ? '<span class="w2">Week 2 (bonus)</span>' : ""}
    </div>
    <div class="p2-help">
      <p><strong>Ads on, or have a question during ad support?</strong> Email us at <a class="inline" href="mailto:admin@whitneybateson.com">admin@whitneybateson.com</a></p>
      ${C.pause ? `<p><strong>Heads up:</strong> replies pause on ${fmt(parse(C.pause.date))} for ${esc(C.pause.reason)} and pick back up ${fmt(addDay(parse(C.pause.date)))}. Your ads keep running as usual.</p>` : ""}
    </div>
  </section>

  <section class="extras" aria-labelledby="extras-h">
    <span class="kicker">Included with your funnel</span>
    <h2 id="extras-h">Your extras 🎁</h2>
    <div class="extra-grid">
      <article class="extra">
        <h3>Funnel Command Center</h3>
        <p>Your Notion hub with every file we built and a video walkthrough of each piece, including how to turn on your ads.</p>
        <a class="xbtn handoff-btn" data-href="${esc(C.commandCenterUrl || "")}" data-open="${iso(D.handoff)}" aria-disabled="true">Open Command Center <span>(${short(D.handoff)})</span></a>
      </article>
      <article class="extra">
        <h3>Ads Made Simple course</h3>
        <p>Our step-by-step ads course is yours to keep. Your username is your email address, and your password is your last name.</p>
        <a class="xbtn" href="https://tools.whitneybateson.com/ads/course-login/" target="_blank" rel="noopener">Go to Ads Made Simple</a>
      </article>
    </div>
  </section>

  <div class="reply">
    <p><strong>Something come up?</strong> Life happens. Hit reply to any of our emails and we'll adjust the route with you.</p>
  </div>

  </div>

  <section class="finale">
  <div class="finale-inner">
    <div class="flag" aria-hidden="true">
      <svg viewBox="0 0 64 64"><path d="M16 58V8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M18 10h30l-7 10 7 10H18z" fill="#E3F696" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>
    </div>
    <h2>Final destination: your funnel and ads are live 🎉</h2>
    <p>Once everything's live, ${T("finalNote", "you'll have a strategic lead magnet that points people to the next step of working with you, a welcome sequence that does the nurturing for you, and ads that keep bringing new subscribers in.")}</p>
    <p class="more">After their funnel is live, clients often come back to us for ongoing ad support, another lead magnet funnel, SEO or private coaching.</p>
    <div class="finale-actions">
      <a class="portal" href="mailto:admin@whitneybateson.com?subject=Looking%20for%20more%20support">Need more support down the road? Send us an email</a>
    </div>
  </div>
  <footer class="site-foot" aria-hidden="true"></footer>
  </section>

  `);

  const sign = "\n\nQuestions? Email us at " + EMAIL + " – we're happy to help!\n\nWhitney & Priscilla\nWhitney Bateson Digital Strategy";

  const stops = [
    { date: C.dates.access, yours: true, title: "Send us access and acknowledge your schedule",
      step1: true,
      note: "Everything in Step 1 above.",
      action: { href: "#access", text: "Get started", internal: true },
      calTitle: "Send Whitney's team access for your funnel (Whitney Bateson, " + EMAIL + ")",
      calDetails: "Hi, " + NAME + "! Today's the day to get your funnel build rolling. 🎉\n\n→ Email software: add " + EMAIL + " as a user (or share your login through LastPass with " + EMAIL + ")\n→ Website: add " + EMAIL + " as a user (skip this if you're already a WBDS website client)\n→ Facebook: click the DigitalSero link we sent you (it only works once)\n→ Read and acknowledge your schedule on your roadmap\n\nOnce these are in, we can start building." + sign },
    { date: C.dates.directionArrives, yours: false, title: T("directionArrivesTitle", "Your lead magnet direction arrives"),
      note: T("directionArrivesNote", "The direction we recommend for your freebie: what it is, who it's for, and why your people will want it.") },
    { date: C.dates.directionDue, yours: true, form: "direction", title: T("directionDueTitle", "Approve your direction"),
      note: T("directionDueNote", "Give it the thumbs up, or tell us what to tweak, through the feedback form below."),
      calTitle: "Approve your lead magnet direction (Whitney Bateson, " + EMAIL + ")",
      calDetails: "Hi, " + NAME + "! Your lead magnet direction landed on " + dayName(D.directionArrives) + ", and today's the day we need your feedback.\n\nOpen the feedback form on your roadmap and either:\n→ Give the direction a thumbs up, or\n→ Tell us what you'd like tweaked\n\nOnce it's approved, we start building your lead magnet and welcome emails." + sign },
    { date: C.dates.lmArrives, yours: false, title: T("lmArrivesTitle", "Lead magnet and email sequence arrive"),
      note: T("lmArrivesNote", "Your finished freebie and the welcome emails that follow it.") },
    { date: C.dates.revisionsDue, yours: true, form: "lmemail", extra: "zap", title: "Send your revisions",
      note: "Send one consolidated list of changes for the lead magnet and emails through the feedback form below.",
      calTitle: "Send your lead magnet + email revisions (Whitney Bateson, " + EMAIL + ")",
      calDetails: "Hi, " + NAME + "! Today's the day to send your revisions for your lead magnet and welcome emails.\n\n→ Put all your changes in one list (it helps us move faster!)\n→ Send it through the feedback form on your roadmap\n→ Also due today: your Zapier login, shared through LastPass or another secure password tool (skip this if you're on GoHighLevel)\n\nNext up, we build your pages, ads and automations." + sign },
    { date: C.dates.handoff, yours: false, big: true, title: "🎉 Your funnel is handed off!",
      note: T("handoffNote", "Your Funnel Command Center opens, with your opt-in and thank you pages, ads, automations and a video walkthrough of each piece, all ready for you to look through."),
      after: "Next up for you → a quick look and any edits by <mark>" + fmt(D.editsDue) + "</mark>" },
    { date: C.dates.editsDue, yours: true, form: "edits", title: "Send your funnel edits",
      note: "Take a quick, high-level look at your opt-in page, thank you page and ads, then send anything that looks off through the feedback form below.",
      calTitle: "Send your funnel edits (Whitney Bateson, " + EMAIL + ")",
      calDetails: "Hi, " + NAME + "! Today's the day for a quick, high-level look at your opt-in page, thank you page and ads.\n\n→ Look for anything that's wrong or doesn't sound like you (no need to comb through every word)\n→ Send it in one list through the feedback form on your roadmap" + sign },
    { date: C.dates.complete, yours: false, finish: true, title: "🏁 Your funnel is complete",
      note: "Final edits are in, and your funnel is ready to go. Your opt-in page is ready to share anywhere: your website, newsletter, social bio, even your email signature." }
  ];

  const ADS_ON_MAIL = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("My ads are on! 🎉") + "&body=" + encodeURIComponent("Hi, Whitney & Priscilla! I just turned on my ads. Can you take a look and make sure everything's running?\n\n" + NAME);
  const phase2Yours = [
    { date: C.dates.adsOn, yours: true, adsOn: true, title: "Turn on your ads",
      note: "Watch the video in your Funnel Command Center, turn your ads on, then email us at " + EMAIL + " so we can check everything's running.",
      calTitle: "Turn on your ads (Whitney Bateson, " + EMAIL + ")",
      calDetails: "Hi, " + NAME + "! Today's the day your ads go live. 🚀\n\n→ Open your Funnel Command Center and watch the video on turning on your ads\n→ Turn your ads on\n→ Email us at " + EMAIL + " to let us know, so we can check everything's running\n\nYour ad support starts today and runs through " + short(D.recap) + "." + sign }
  ];

  const tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---- Saved progress (this device only until the forms are connected) ----
  const KEY = "roadmap-" + CLIENT;
  let state = { checks: {}, sent: {} };
  try {
    const old = JSON.parse(localStorage.getItem("britney-roadmap-checks") || "{}");
    state = Object.assign(state, JSON.parse(localStorage.getItem(KEY) || "{}"));
    state.checks = Object.assign({}, old, state.checks || {});
    state.sent = state.sent || {};
  } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  const itemDone = a => a.got || (a.form ? !!state.sent[a.form] : !!state.checks[a.id]);
  const step1Done = () => access.every(itemDone);
  const stopDone = s => {
    if (s.step1) return step1Done();
    if (s.form) return !!state.sent[s.form];
    if (s.adsOn) return !!state.sent.adson || parse(s.date) < today;
    return parse(s.date) < today;
  };

  const FORMS = {
    ack: {
      title: "Your DFY Funnel Build: Project Schedule & Review Process",
      button: "Read and acknowledge",
      fields: [
        { type: "info", html: "<p>Here's your funnel schedule and how revisions will go, so you know exactly what's coming and when. Sticking to the schedule and getting us what we need on time means we launch your funnel ASAP (so you can start building your list ASAP, too!).</p><p>This follows the template project schedule you already agreed to in our terms when you purchased your funnel. This just puts real dates to everything. Four of the dates on this roadmap are for you, and the rest are ours. Hit your four and your funnel goes live on schedule! Your total time on all of this is about an hour, spread across " + WORDS[weeks] + " weeks.</p>" },
        { type: "info", html: "<h5>How reviews work</h5><p>You get one round of revisions on your lead magnet and email sequence. Send all of your changes at once, using the form on this page, so we can work through them in one pass. After the funnel handoff, you have until " + fmt(D.editsDue) + " to request edits to your pages, ad copy and ad creative, also in one form.</p>" },
        { type: "info", html: "<h5>Ad support</h5><p>Ad support runs by email and covers your ad campaign: performance, delivery and spend, audience and budget adjustments, Meta review or disapproval issues, and making sure leads are landing in your email platform. Priscilla replies within one business day. These dates are fixed, so please turn your ads on as soon as Meta approves them and you'll have live data to ask about.</p>" },
        { type: "info", html: "<h5>Three things to know before we start</h5><ul><li><strong>Zapier:</strong> you'll need a paid Zapier plan (unless you're on GoHighLevel) for your funnel to deliver leads to your email platform. It's about $20/month, separate from your build, and we recommend a monthly plan so you can pause it in months you're not running ads.</li><li><strong>Ad spend</strong> is paid directly to Meta. We recommend starting around $5/day. Your build fee doesn't include it.</li><li><strong>Your ads don't run</strong> until Meta approves them and you turn them on. We submit them for review as our final build step.</li></ul>" },
        { type: "textarea", label: "Any dates that won't work?", help: "Let us know within two business days and we'll see what we can do. Once we're underway, the dates are locked, since your build slot is reserved. All good? Leave this blank.", rows: 3 },
        { type: "check", label: "I've read my project schedule and review process, and I'm ready to get started.", required: true }
      ],
      submit: "Submit"
    },
    direction: {
      title: T("directionFormTitle", "Lead Magnet Direction Form"),
      button: "Open the feedback form",
      fields: [
        { type: "info", html: "<p>Here's where you tell us if we're on the right track. You're approving the direction (the idea, the title and who it's for), not the finished wording. That comes next, and you'll get a full review round on it.</p>" },
        { type: "radio", label: "How do you feel about this direction?", required: true, options: ["Love it, go ahead and build it", "Love it, with a few small tweaks", "I'd like to talk through a different direction"] },
        { type: "textarea", label: "What would you like us to tweak?", required: true, help: "The title, the angle, who it's for or what's inside. Something like \"can the title speak to busy moms instead of new moms?\" is perfect. No tweaks? Just write none." },
        { type: "check", label: "I approve this direction (with any tweaks above), and I'm ready for you to start building.", required: true }
      ],
      submit: "Send my feedback"
    },
    lmemail: {
      title: T("lmemailFormTitle", "Lead Magnet & Email Feedback Form"),
      button: "Open the feedback form",
      fields: [
        { type: "note", html: "<strong>Heads up:</strong> this form doesn't save as you go. If you're collecting notes over a few days, write them in a separate document, then paste them here when you're ready." },
        { type: "textarea", label: "Is there anything you would like us to change about your lead magnet?", required: true, help: "Tell us what and where. Something like \"page 3, second bullet, swap 'patients' for 'clients'\" is perfect. No changes? Just write none." },
        { type: "textarea", label: "Is there anything you would like us to change about your emails?", required: true, help: "Give us the email number and where to look. Something like \"email 2, subject line, can we try something softer?\" No changes? Just write none." },
        { type: "textarea", label: "Did we get anything wrong?", required: true, help: "Credentials, program names, pricing, clinical details. Anything that needs to be exactly right.", rows: 3 },
        { type: "textarea", label: "What's your favorite part?", help: "We love hearing it, and it helps us know what's landing.", rows: 3 },
        { type: "textarea", label: "Is there anything else you would like to share with us?", rows: 3 },
        { type: "checks", items: ["I've reviewed my full lead magnet and all emails.", "This is my complete list of changes, and I'm ready for you to get to work."] }
      ],
      submit: "Send my changes"
    },
    edits: {
      title: "Funnel Edits Form",
      button: "Open the feedback form",
      fields: [
        { type: "info", html: "<p>Your opt-in page, thank you page and ads are built from the lead magnet and emails you already approved. We carried that same messaging and your brand voice forward into every piece, so this is a quick, high-level look, not a line-by-line review.</p>" },
        { type: "note", html: "<strong>A note on your ads:</strong> every ad is written to meet Meta's rules for health and wellness ads, and the wording is chosen carefully so it gets approved. For your ads, we're only looking for big things, like a wrong name, credential or link." },
        { type: "textarea", label: "Anything that looks off?", required: true, rows: 6, help: "Tell us which piece and what's wrong. Something like \"the thank you page links to my old website\" is perfect. All good? Just write none." },
        { type: "checks", items: ["I've looked over my opt-in page, thank you page and ads.", "This is my complete list of changes, and I'm ready for you to get to work."] }
      ],
      submit: "Send my edits"
    }
  };

  function renderForm(key) {
    const f = FORMS[key]; let n = 0;
    const req = '<span class="req" aria-hidden="true">*</span>';
    const body = f.fields.map(fl => {
      const id = key + "-" + (n++);
      const help = fl.help ? `<span class="f-help" id="${id}-h">${esc(fl.help)}</span>` : "";
      const desc = fl.help ? ` aria-describedby="${id}-h"` : "";
      if (fl.type === "info") return `<div class="f-info">${fl.html}</div>`;
      if (fl.type === "note") return `<p class="f-note">${fl.html}</p>`;
      if (fl.type === "textarea") return `<div class="f-field"><label for="${id}">${esc(fl.label)} ${fl.required ? req : ""}</label>${help}<textarea id="${id}" data-q="${esc(fl.label)}" rows="${fl.rows || 5}"${fl.required ? " required" : ""}${desc}></textarea></div>`;
      if (fl.type === "radio") return `<fieldset class="f-field"><legend>${esc(fl.label)} ${fl.required ? req : ""}</legend>${fl.options.map((o, k) => `<label class="f-choice"><input type="radio" data-q="${esc(fl.label)}" name="${id}" value="${esc(o)}"${fl.required && k === 0 ? " required" : ""}><span>${esc(o)}</span></label>`).join("")}</fieldset>`;
      if (fl.type === "checks") return `<div class="f-field f-checks">${fl.items.map(t => `<label class="f-check"><input type="checkbox" data-q="${esc(t)}" required><span>${esc(t)} ${req}</span></label>`).join("")}</div>`;
      if (fl.type === "check") return `<label class="f-field f-check"><input type="checkbox" data-q="${esc(fl.label)}"${fl.required ? " required" : ""}><span>${esc(fl.label)} ${fl.required ? req : ""}</span></label>`;
      if (fl.type === "file") return `<p class="f-note"><strong>Have screenshots?</strong> Email them to <a class="inline" href="mailto:${EMAIL}">${EMAIL}</a> after you submit.</p>`;
      if (fl.type === "file-upload") return `<div class="f-field"><span class="f-label">${esc(fl.label)} <em>(optional)</em></span>${help}<label class="f-drop" for="${id}"><input type="file" id="${id}" multiple accept="image/*"><span class="f-drop-t">Choose files to upload</span><span class="f-drop-s">or drag them here</span></label></div>`;
      return "";
    }).join("");
    return `<details class="fwrap"><summary><span class="f-sum">${esc(f.button)}</span><span class="f-sum-t">${esc(f.title)}</span></summary>
      <form class="fbody" novalidate data-key="${key}"><h4 class="f-title">${esc(f.title)}</h4>${body}
        <div class="f-actions"><button type="submit" class="f-submit">${esc(f.submit)}</button><span class="f-req-note">${req} Required</span></div>
        <p class="f-status" role="status"></p>
      </form></details>`;
  }

  function sentCard(key) {
    const when = fmt(parse(state.sent[key]));
    if (key === "ack") return `<div class="f-sent"><span class="f-sent-ic">${tick}</span><p><strong>Acknowledged on ${when}.</strong> Thanks for reading it through!</p></div>`;
    return `<div class="f-sent"><span class="f-sent-ic">${tick}</span><p><strong>Sent on ${when}. Thank you!</strong> We're on it. Forgot something? Email us at <a class="inline" href="mailto:${EMAIL}">${EMAIL}</a> before the due date and we'll add it to your list.</p></div>`;
  }
  function fillForms(root) {
    (root || document).querySelectorAll(".form-slot").forEach(slot => {
      const k = slot.dataset.form;
      slot.innerHTML = state.sent[k] ? sentCard(k) : renderForm(k);
    });
  }

  function calLinks(s) {
    const d = parse(s.date), end = addDay(d);
    const text = encodeURIComponent(s.calTitle || ("Funnel: " + s.title));
    const details = encodeURIComponent(s.calDetails || (s.note + sign));
    const g = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${ymd(d)}/${ymd(end)}&details=${details}`;
    const o = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${text}&body=${details}&startdt=${iso(d)}&enddt=${iso(end)}&allday=true`;
    const act = s.action ? `<a class="act"${s.adsOn ? ' data-adson="1"' : ""} href="${s.action.href}"${s.action.internal ? "" : ' target="_blank" rel="noopener"'}>${s.action.text}</a>` : "";
    return `<div class="cal">${act}<a href="${g}" target="_blank" rel="noopener">Add to Google Calendar</a><a href="${o}" target="_blank" rel="noopener">Add to Outlook</a></div>`;
  }

  function zapRow() {
    const on = zapier.got || !!state.checks.zap;
    return `<div class="zap-row${on ? " on" : ""}">
      <button class="box" type="button" data-id="zap" aria-pressed="${on}" aria-label="Mark Zapier access as done" ${zapier.got ? "disabled" : ""}>${tick}</button>
      <div><strong>Also due ${short(D.revisionsDue)}: ${zapier.item}</strong><span class="how">${zapier.short}</span>
      <details class="acc-more"><summary>More info</summary><p>${zapier.more}</p></details></div>
    </div>`;
  }

  function renderRoute() {
    document.getElementById("route").innerHTML = stops.map(s => {
      const d = parse(s.date);
      const done = stopDone(s);
      const late = s.yours && !done && d < today;
      const cls = ["stop", s.yours ? "yours" : "", s.big ? "big" : "", s.finish ? "finish" : "", done ? "done" : "", late ? "late" : ""].join(" ").trim();
      return `<li class="${cls}">
        <span class="pin" aria-hidden="true"></span>
        <div class="card">
          <span class="pstamp" aria-label="Done"><b>Done</b>${short(d)}</span>
          <div class="date">${fmt(d)}${s.yours ? '<span class="tag">Your stop</span>' : ""}${late ? '<span class="tag late-tag">Still open</span>' : ""}</div>
          <h4>${s.title}</h4>
          <p>${s.note}</p>
          ${s.after ? `<p class="after">${s.after}</p>` : ""}
          ${s.yours && !done ? calLinks(s) : ""}
          ${s.extra === "zap" ? zapRow() : ""}
          ${s.form ? `<div class="form-slot" id="${s.form}-form" data-form="${s.form}"></div>` : ""}
        </div>
      </li>`;
    }).join("");
    fillForms(document.getElementById("route"));
  }

  function renderAccess() {
    document.getElementById("access-list").innerHTML = access.map(a => {
      const d = parse(a.due);
      const days = Math.round((d - today) / 86400000);
      const done = itemDone(a);
      const soon = !done && days <= 3;
      const label = a.got ? "Got it, thanks!" : done ? "Done" : days < 0 ? "Still needed" : "Needed by " + fmt(d);
      const link = a.link && !done ? `<a class="acc-link" href="${a.link}"${a.internal ? "" : ' target="_blank" rel="noopener"'}>${a.linkText} ${a.internal ? "↓" : "→"}</a>` : "";
      const more = a.more ? `<details class="acc-more"><summary>More info</summary><p>${a.more}</p></details>` : "";
      const locked = a.got || a.form;
      return `<li class="${a.got ? "got" : done ? "mine" : ""}">
        <button class="box" type="button" data-id="${a.id}" aria-pressed="${done}" aria-label="Mark ${a.item} as done" ${locked ? 'data-locked="1"' : ""}>${tick}</button>
        <div><strong>${a.item}</strong><span class="how">${a.short}</span>${more}${link}</div>
        <span class="due${soon ? " soon" : ""}">${label}</span>
      </li>`;
    }).join("");
    const n = access.filter(itemDone).length, total = access.length;
    document.querySelector(".s1-count").textContent = n + " of " + total + " done";
    document.querySelector(".s1-bar i").style.width = (n / total * 100) + "%";
    const sec = document.getElementById("access");
    const complete = n === total;
    sec.classList.toggle("complete", complete);
    document.querySelector(".s1-complete").hidden = !complete;
    if (!complete) sec.classList.remove("expanded");
  }

  function renderReview() {
    document.getElementById("review-list").innerHTML = reviews.map(r => {
      const ready = parse(r.ready), due = parse(r.due);
      const sent = !!state.sent[r.form];
      const later = ready > today;
      const days = Math.round((due - today) / 86400000);
      const label = sent ? "Feedback sent" : later ? "Arrives " + fmt(ready) : days < 0 ? "Still open" : "Review by " + fmt(due);
      const soon = !sent && !later && days <= 2;
      const hasLink = r.url && r.url !== "#";
      const acts = later ? "" : `<span class="rv-acts">${hasLink
          ? `<a class="acc-link" href="${r.url}" target="_blank" rel="noopener">${r.linkText} →</a>`
          : `<span class="rv-soon">Link coming soon</span>`}${sent ? "" : `<a class="acc-link" href="#${r.form}-form">Send feedback ↓</a>`}</span>`;
      return `<li class="${sent ? "sent" : later ? "later" : ""}">
        <div><strong>${r.item}</strong><span class="how">${r.short}</span>${acts}</div>
        <span class="due${soon ? " soon" : ""}">${label}</span>
      </li>`;
    }).join("");
  }

  function renderNext() {
    const next = stops.concat(phase2Yours).find(s => s.yours && !stopDone(s));
    const box = document.getElementById("next");
    if (next) {
      const days = Math.round((parse(next.date) - today) / 86400000);
      const big = days < 0 ? "Now" : days === 0 ? "Today" : days;
      const small = days < 0 ? "let's catch up" : days === 0 ? "" : days === 1 ? "day to go" : "days to go";
      box.innerHTML = `
        <div class="stamp-big" aria-hidden="true"><b>${big}</b><small>${small}</small></div>
        <div>
          <h2>Your next stop</h2>
          <h3>${next.title}</h3>
          <p>Due end of day ${fmt(parse(next.date))}.</p>
          ${calLinks(next)}
        </div>`;
    } else {
      box.innerHTML = `
        <div class="stamp-big" aria-hidden="true"><b>🎉</b></div>
        <div>
          <h2>Your next stop</h2>
          <h3>You're all done</h3>
          <p>No more homework for you. We'll handle the rest and keep you posted.</p>
        </div>`;
    }
  }

  function renderAll() {
    renderAccess();
    fillForms(document.getElementById("access"));
    renderRoute();
    renderReview();
    renderNext();
  }
  renderAll();

  // Step 1 checkboxes
  document.getElementById("access-list").addEventListener("click", e => {
    const btn = e.target.closest("button.box"); if (!btn) return;
    if (btn.dataset.locked) {
      if (btn.dataset.id === "ack") document.getElementById("ack-form").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const id = btn.dataset.id;
    state.checks[id] = !state.checks[id]; save();
    logAccess(id, state.checks[id]);
    renderAccess();
    const s1 = document.querySelector("#route .stop"); // access stop
    renderNext();
    if (s1) s1.classList.toggle("done", step1Done());
  });
  document.querySelector(".s1-toggle").addEventListener("click", e => {
    const sec = document.getElementById("access");
    const open = sec.classList.toggle("expanded");
    e.currentTarget.setAttribute("aria-expanded", open);
    e.currentTarget.textContent = open ? "Hide details" : "Show details";
  });

  // Zapier checkbox on the revisions stop
  document.getElementById("route").addEventListener("click", e => {
    const btn = e.target.closest(".zap-row button.box"); if (!btn || btn.disabled) return;
    state.checks.zap = !state.checks.zap; save();
    logAccess("zap", state.checks.zap);
    const row = btn.closest(".zap-row");
    row.classList.toggle("on", !!state.checks.zap);
    btn.setAttribute("aria-pressed", !!state.checks.zap);
  });

  // "My ads are on!" buttons
  const adsBtn = document.getElementById("ads-on-btn"); if (adsBtn) { adsBtn.href = ADS_ON_MAIL; adsBtn.dataset.adson = "1"; }
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-adson]"); if (!a) return;
    state.sent.adson = iso(today); save();
    setTimeout(renderNext, 300);
  });

  // Form submit: sends answers to Notion through the Vercel API
  function collect(form) {
    const out = [];
    form.querySelectorAll("textarea[data-q]").forEach(t => out.push({ q: t.dataset.q, a: t.value.trim() }));
    const radios = {};
    form.querySelectorAll('input[type="radio"][data-q]').forEach(r => { if (r.checked) radios[r.dataset.q] = r.value; });
    Object.keys(radios).forEach(q => out.push({ q, a: radios[q] }));
    form.querySelectorAll('input[type="checkbox"][data-q]').forEach(c => out.push({ q: c.dataset.q, a: c.checked ? "Yes" : "No" }));
    return out;
  }
  document.addEventListener("submit", async e => {
    const form = e.target.closest("form.fbody"); if (!form) return;
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = form.querySelector(".f-submit"), st = form.querySelector(".f-status");
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = "Sending..."; st.textContent = "";
    try {
      const res = await fetch(API + "/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: CLIENT, token: TOKEN, form: form.dataset.key, answers: collect(form) })
      });
      if (!res.ok) throw new Error("status " + res.status);
      state.sent[form.dataset.key] = iso(new Date()); save();
      renderAll();
      const slot = document.querySelector(`.form-slot[data-form="${form.dataset.key}"]`);
      if (slot) slot.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      btn.disabled = false; btn.textContent = label;
      st.textContent = "Something went wrong sending this. Please try again, or email your answers to " + EMAIL + ".";
    }
  });

  // Let us know when an access item is ticked (best effort, never blocks the page)
  function logAccess(id, on) {
    if (!on) return;
    fetch(API + "/submit", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client: CLIENT, token: TOKEN, form: "access", item: id }) }).catch(() => {});
  }

  // Pull what's already been submitted, so it shows on every device
  fetch(API + "/status?client=" + encodeURIComponent(CLIENT) + "&token=" + encodeURIComponent(TOKEN))
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      // Notion is the source of truth: deleting a row there resets it here too
      state.sent = data.sent || {};
      state.checks = Object.assign({}, data.access || {});
      save(); renderAll();
    }).catch(() => {});

  document.addEventListener("change", e => {
    const inp = e.target.closest(".f-drop input"); if (!inp) return;
    const t = inp.parentElement.querySelector(".f-drop-t");
    t.textContent = inp.files.length ? inp.files.length + (inp.files.length === 1 ? " file chosen" : " files chosen") : "Choose files to upload";
  });

  document.querySelectorAll(".p2-stop").forEach(li => { if (parse(li.dataset.date) <= today) li.classList.add("reached"); });
  document.querySelectorAll(".handoff-btn").forEach(b => {
    if (parse(b.dataset.open) <= today && b.dataset.href && b.dataset.href !== "#") {
      b.href = b.dataset.href; b.target = "_blank"; b.rel = "noopener"; b.removeAttribute("aria-disabled");
    }
  });

})();
