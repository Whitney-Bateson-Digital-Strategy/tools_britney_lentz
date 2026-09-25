// GET /api/status?client=britney&token=...
// Tells the page which forms have already been submitted, so it shows the same on every device.
const { notion, FORM_NAMES, ACCESS_NAMES, findClient } = require("./_notion");

module.exports = async (req, res) => {
  const { client: slug, token } = req.query || {};
  const client = findClient(slug, token);
  if (!client) return res.status(403).json({ error: "Unknown client" });

  const formKey = Object.fromEntries(Object.entries(FORM_NAMES).map(([k, v]) => [v, k]));
  const accessKey = Object.fromEntries(Object.entries(ACCESS_NAMES).map(([k, v]) => [v, k]));

  try {
    const data = await notion("/databases/" + process.env.NOTION_DATABASE_ID + "/query", {
      filter: { property: "Client", select: { equals: client.name } },
      page_size: 100
    });
    const sent = {}, access = {};
    data.results.forEach(page => {
      const p = page.properties || {};
      const form = p.Form && p.Form.select && formKey[p.Form.select.name];
      const when = p.Submitted && p.Submitted.date && p.Submitted.date.start;
      if (!form) return;
      if (form === "access") {
        const item = p.Item && p.Item.select && accessKey[p.Item.select.name];
        if (item) access[item] = true;
      } else if (when) {
        const day = when.slice(0, 10);
        if (!sent[form] || day < sent[form]) sent[form] = day;
      }
    });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ sent, access });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not load status" });
  }
};
