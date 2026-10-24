---
provenance: "Unvetted Synthetic"
---

# Demo seed manifest

Created exactly two synthetic context pages through `https://pink-hack.vercel.app/api/v1` for the server-owned `demo-user`. Seeded **2**, reused **0**, duplicate pages **0**. Both pages remain for presentation. No Journal entries were seeded, and no cleanup is authorized.

Sole seed worker ID: `thread:delegated-task:command%3Amcp%3A64d40d89-4cc6-4c2a-a95a-c8eb2b97daa1%3Adelegate-task%3Aseed-notion-demo-context-20261024-1`.

## Sources and scope

- Actual [Notion research and user story](https://app.notion.com/p/403e7bbddae88073929cf47b41a161d8), under [Hackathon Build for Impact](https://app.notion.com/p/luxed/Hackathon-Build-for-Impact-403e7bbddae88079adbcdc23eb6a92a3). The connector returned the research snapshot at `2026-10-24T11:25:54.613Z`, last edited `2026-10-24T11:25:29.707Z`.
- Current Notion names the first composite **Emma, The Compounding Burden**. The accepted demo uses **Anna** as its alias. This is a composite from published research, not a patient account or observed product use.
- Exact page wording comes from the two accepted quotations in [demo-script.md](demo-script.md). Its SHA-256 at payload extraction was `474e2b9e73ed38c9e454328850b9f6a438f61d9bb5bd1f7f76fbb9a08d228029`. Both pages start with `Synthetic demo page.` and have `(demo)` in their title.

The preferences are synthetic scenario content, not medical advice. No incidence, adherence, clinical outcome, or symptom-pattern claim was copied from Notion. Today's observations and granddaughter visit remain spoken-demo input, not seeded records.

The local API contract was inspected at `0477127d5a9c080b77ed56097d225f03a74442cb`. Verification used the production HTTP API without login, cookies, credentials, or client-supplied owner selectors. No deployment or migration was performed.

## Saved identities

| Page | Canonical page ID | Revision | Creation operation ID | Created and updated at, UTC |
| --- | --- | --- | --- | --- |
| What I want to track (demo) | `578460c0-8796-4e86-94b3-424022f6259e` | 1 | `demo-seed-anna-track-20261024-v1` | `2026-10-24T12:19:52.954Z` |
| What helps me (demo) | `be00b449-8435-461b-bd33-d28957168fb9` | 1 | `demo-seed-anna-helps-20261024-v1` | `2026-10-24T12:19:54.076Z` |

Page GET responses expose IDs, revisions and native content, but omit `operation_id`. Each operation ID above was supplied in its successful creation request and verified by an exact POST retry returning the identical original page, timestamps and revision. It was not read from an exposed GET field. Both receipts returned HTTP 200, with no conflict.

## Canonical source payloads

These are the exact `POST /pages` request bodies. Fresh individual GETs and all-page context returned native `content` deeply equal to these payloads. Stable block IDs, native paragraph props, inline text nodes and empty children are preserved.

```json
{
  "title": "What I want to track (demo)",
  "content": [
    {"id":"0064f998-8a64-5881-be41-3a5b0652b605","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Synthetic demo page.","styles":{}}],"children":[]},
    {"id":"5bfeedc2-c730-592b-b192-11d8e7d8838c","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Each morning I'd like to note: how stiff my hands and knees feel from 0 to 10, my energy (low, okay, good), how I slept, and one thing I want to do today.","styles":{}}],"children":[]},
    {"id":"4a5a4265-2f58-55d2-ae3e-aaf5dc2ccb72","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Keep it short. Use my words.","styles":{}}],"children":[]}
  ],
  "operation_id": "demo-seed-anna-track-20261024-v1"
}
```

```json
{
  "title": "What helps me (demo)",
  "content": [
    {"id":"d597bdf7-ac1c-592d-8e04-fa21b52c0ac3","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Synthetic demo page.","styles":{}}],"children":[]},
    {"id":"16b2ba89-1287-55c8-b40f-62fdce3f6b9f","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"A warm shower before I tackle the stairs. A short walk before lunch rather than later. Resting after lunch. Asking for help with jars and lids instead of pushing through. Keeping only one or two must-dos on a bad day.","styles":{}}],"children":[]}
  ],
  "operation_id": "demo-seed-anna-helps-20261024-v1"
}
```

For a retry of these same creation operations, use the identical payload and operation ID. Never generate a replacement operation ID to bypass a conflict. For later inspection or reuse, GET the canonical IDs first and compare title, revision and full native content. If a page is missing, changed, or conflicts with another title/operation, report it instead of overwriting, deleting, recreating, or silently duplicating it. A receipt replay alone does not prove a page remains active; the fresh GET and context checks below do.

## Fresh readback and preservation evidence

All times are UTC on 2026-10-24, or add two hours for Europe/Copenhagen. All responses below were HTTP 200 with `Cache-Control: no-store`.

| Request | Observed at, UTC | Result |
| --- | --- | --- |
| Before `GET /context` | `12:19:32.295911` | `owner_id: demo-user`, `pages: []` |
| Before `GET /pages?limit=100` | `12:19:32.696725` | `pages: []`, `next_cursor: null` |
| Before `GET /journal?limit=100` | `12:19:33.315337` | `entries: []`, `next_cursor: null` |
| Create tracking page | `12:19:53.322871` | Canonical tracking page, revision 1, exact native payload |
| Create preferences page | `12:19:54.399797` | Canonical preferences page, revision 1, exact native payload |
| Exact tracking operation replay | `12:20:14.357361` | Identical original page, no duplicate or revision change |
| `GET /pages/578460c0-8796-4e86-94b3-424022f6259e` | `12:20:14.716910` | Entire page deeply equal to creation response |
| Exact preferences operation replay | `12:20:15.386277` | Identical original page, no duplicate or revision change |
| `GET /pages/be00b449-8435-461b-bd33-d28957168fb9` | `12:20:15.795356` | Entire page deeply equal to creation response |
| After `GET /pages?limit=100` | `12:20:16.238552` | Exactly the two canonical pages, `next_cursor: null` |
| After `GET /journal?limit=100` | `12:20:16.811475` | `entries: []`, `next_cursor: null`, exactly unchanged |
| After `GET /context` | `12:20:17.426071` | Exactly both canonical pages, full content and revision 1, profile exactly unchanged |

The full before snapshot of reachable shared data was zero pages, zero Journal entries and this profile. The after profile was deeply equal:

```json
{"owner_id":"demo-user","timezone":"UTC","allow_medical_voice_context":false,"revision":0,"updated_at":"2026-10-24T11:47:57.857Z"}
```

The fresh all-page context contained `578460c0-8796-4e86-94b3-424022f6259e` and `be00b449-8435-461b-bd33-d28957168fb9`, with titles, full native content and timestamps equal to the individual page GETs. Its Vercel request identifier was `arn1::iad1::pcjbj-1792844416979-22723e4561df`. This is the all-live-page context returned by the API; the inspected conversation-context service uses the same `readContext` function. No model or provider session was started.

Canonical content SHA-256, using UTF-8 JSON with sorted object keys, no separator whitespace and literal Unicode:

- Tracking page: `dc81dbe50558505f251ff658fbd9b001c7625904610283a4a724ab81763ffd97`.
- Preferences page: `7a75436673837d066dddf435485fc4611d96acdbaad74bbc3c959b7424782dfe`.

The snapshot covers every page and Journal entry exposed by the fixed-user APIs. Legacy-owner records are outside their read scope. The only mutation route called was `POST /pages`, twice for creation and twice for exact receipt replay. There were no PATCH, DELETE, Journal, legacy, schema, provider, device, firmware or frontend mutations. All existing reachable records were preserved; Journal and profile were exactly unchanged. No locks were held outside normal API requests.

Local source payloads and complete HTTP snapshots are also retained in `/tmp/pink-hack-anna-seed-{payloads,before,writes,after}.json` for this session. This manifest contains the durable reproduction data and evidence; those temporary files are not required for later reuse.

Inspect the retained pages in the sidebar at [the public app](https://pink-hack-journal.lovable.app/app), using the two exact titles above. This work verifies production persistence and agent-context retrieval, not browser rendering or a genuine voice-write loop. No seed blocker remains.
