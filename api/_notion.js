// Small helper for talking to the Notion API. No packages needed.
const NOTION_VERSION = "2022-06-28";

async function notion(path, body, method = "POST") {
  const res = await fetch("https://api.notion.com/v1" + path, {
    method,
    headers: {
      "Authorization": "Bearer " + process.env.NOTION_TOKEN,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Notion " + res.status + ": " + (data.message || "unknown error"));
  return data;
}

// Notion caps each text chunk at 2,000 characters.
function textChunks(str) {
  const s = String(str || "");
  const out = [];
  for (let i = 0; i < s.length; i += 1900) out.push({ type: "text", text: { content: s.slice(i, i + 1900) } });
  return out.length ? out : [{ type: "text", text: { content: "(left blank)" } }];
}

const FORM_NAMES = {
  ack: "Schedule acknowledgement",
  direction: "Lead magnet direction",
  lmemail: "Lead magnet & email feedback",
  edits: "Funnel edits",
  access: "Access checklist"
};

const ACCESS_NAMES = {
  email: "Email software access",
  web: "Website access",
  fb: "Facebook access",
  zap: "Zapier access"
};

function findClient(slug, token) {
  const clients = require("../clients.json");
  const c = clients[slug];
  if (!c || !token || c.token !== token) return null;
  return c;
}

module.exports = { notion, textChunks, FORM_NAMES, ACCESS_NAMES, findClient };
