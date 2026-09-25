# DFY Funnel Roadmaps

Client roadmap pages for Whitney Bateson Digital Strategy. Each client gets a page at
`your-site.vercel.app/<client>` (for example `/britney`). Form answers and access
checkmarks are saved as rows in a Notion database.

## What's in here

| File | What it does |
|---|---|
| `britney/index.html` | Britney's roadmap page |
| `api/submit.js` | Saves a form or checkmark to Notion |
| `api/status.js` | Tells the page what's already been submitted, so it matches on every device |
| `api/_notion.js` | Shared Notion helper |
| `clients.json` | Each client's name and private key (the key is also in their page) |
| `.env.example` | The two secrets Vercel needs |

## One-time setup

### 1. Notion: the database
Create a full-page database called **Client Feedback** with these properties
(names must match exactly):

| Property | Type |
|---|---|
| Name | Title |
| Client | Select |
| Form | Select |
| Item | Select |
| Submitted | Date |
| Status | Select (add options: New, Reviewed) |

### 2. Notion: the connection
1. Go to https://www.notion.so/profile/integrations and click **New integration**.
2. Name it "DFY Roadmaps", pick your workspace, and save.
3. Copy the **Internal Integration Secret**. That's your `NOTION_TOKEN`.
4. Open the Client Feedback database, click **•••** (top right) → **Connections** →
   add "DFY Roadmaps". Without this step, the page can't write to it.
5. Copy the database link. The 32-character string before `?v=` is your `NOTION_DATABASE_ID`.

### 3. GitHub
1. Create a new **private** repository (for example `dfy-roadmaps`).
2. Click **uploading an existing file** and drag in everything from this folder
   (keep the `api` and `britney` folders as folders).
3. Commit.

### 4. Vercel
1. At vercel.com, click **Add New → Project** and import the GitHub repo.
2. Framework preset: **Other**. No build command needed.
3. Under **Environment Variables**, add `NOTION_TOKEN` and `NOTION_DATABASE_ID`.
4. Deploy. Britney's page is at `https://<your-project>.vercel.app/britney`.
5. Optional: add a custom domain like `roadmap.whitneybateson.com` under
   Settings → Domains.

## Test it
1. Open the Britney page, open the acknowledgement form, check the box and submit.
2. A row called "Britney Lentz: Schedule acknowledgement" should appear in Notion.
3. Open the page on your phone. The form should already show as sent.

## Adding a new client
1. Copy the `britney` folder and rename it (for example `jessica`).
2. In the new `index.html`, update `CLIENT`, `TOKEN`, the name, dates and links.
3. Add the client to `clients.json` with a new random key (any long random string).
4. Commit. Vercel redeploys on its own.

## Notes
- Pages are hidden from search engines (`noindex`), but anyone with the link can open
  one, so keep passwords off the page.
- Screenshots: for now the forms ask clients to email screenshots. Uploads straight
  into Notion can be added later.
- To get notified: in Notion, open the database → **•••** → **Automations** (or turn on
  notifications for new pages) so you hear about each submission.
