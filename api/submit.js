// POST /api/submit
// Saves a form submission (or an access checkmark) as a new row in the Notion database.
const { notion, textChunks, FORM_NAMES, ACCESS_NAMES, findClient } = require("./_notion");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { client: slug, token, form, answers, item } = body;

  const client = findClient(slug, token);
  if (!client) return res.status(403).json({ error: "Unknown client" });
  if (!FORM_NAMES[form]) return res.status(400).json({ error: "Unknown form" });
  if (form === "access" && !ACCESS_NAMES[item]) return res.status(400).json({ error: "Unknown access item" });

  const formName = FORM_NAMES[form];
  const title = form === "access"
    ? client.name + ": " + ACCESS_NAMES[item] + " ✓"
    : client.name + ": " + formName;

  // Each question becomes a heading with the answer underneath.
  const children = [];
  (Array.isArray(answers) ? answers : []).slice(0, 40).forEach(({ q, a }) => {
    children.push({ object: "block", type: "heading_3", heading_3: { rich_text: textChunks(q).slice(0, 1) } });
    children.push({ object: "block", type: "paragraph", paragraph: { rich_text: textChunks(a) } });
  });

  const properties = {
    "Name": { title: [{ type: "text", text: { content: title.slice(0, 200) } }] },
    "Client": { select: { name: client.name } },
    "Form": { select: { name: formName } },
    "Submitted": { date: { start: new Date().toISOString() } },
    "Status": { select: { name: "New" } }
  };
  if (form === "access") properties["Item"] = { select: { name: ACCESS_NAMES[item] } };

  try {
    await notion("/pages", {
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties,
      children
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not save" });
  }
};
