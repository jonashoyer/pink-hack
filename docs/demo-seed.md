---
provenance: "Unvetted Synthetic"
---

# Breast cancer demo seed manifest

Updated exactly **2** owned context pages and created exactly **1** new synthetic context page through `https://pink-hack.vercel.app/api/v1`. All **3** pages are retained for presentation. Reused records **0**; duplicate pages **0**. Two exact PATCH retries returned the original revision-2 results without another state change. There was one recovery-page POST. Journal remains unchanged at **0 entries**.

This is the user-authorized replacement of the earlier two-page Anna case. The original manifest is preserved verbatim in [demo-case-history-2026-10-24.md](demo-case-history-2026-10-24.md#original-demo-seedmd). Historical records describe the old case and do not define current page content.

Sole seed worker ID: `thread:delegated-task:command%3Amcp%3A64d40d89-4cc6-4c2a-a95a-c8eb2b97daa1%3Adelegate-task%3Aseed-notion-demo-context-20261024-1`.

## Current case and sources

Emma is a fictional composite grounded in the [current Notion breast cancer research](https://app.notion.com/p/403e7bbddae88073929cf47b41a161d8), "Emma, The Compounding Burden". She has finished active hospital treatment and is eighteen months into ongoing prescribed hormone therapy. The pages keep physical symptoms, feelings and everyday difficulties together for her oncology follow-up.

Letrozole 2.5 mg once daily is an explicitly fictional existing-prescription detail chosen for this scenario. It is not a treatment recommendation, a real patient regimen, a symptom-causation claim or evidence of clinical benefit. The content asks the companion to record only reported medication, avoid diagnosis or recurrence assessment, and preserve unrelated journal content during corrections.

- [Current Notion Demo](https://app.notion.com/p/403e7bbddae8803389eee54a3da0250f), fetched snapshot and last edit `2026-10-24T12:40:41.719Z`.
- [Current Notion outline](https://app.notion.com/p/403e7bbddae88134886dda233feb1c32), fetched snapshot and last edit `2026-10-24T12:40:42.655Z`.
- Exact final paragraphs and spoken request come from [demo-script.md](demo-script.md). Source SHA-256 at extraction: `bcc9227e028ccbb9efa999ccf41b1752b99be0ab19a96f12db81a1e128c668f6`. The paragraphs match the current Notion Demo and the user-supplied final copy.

This worker read the updated sources but edited only this manifest in the checkout. No Notion changes, provider sessions, Journal writes, deployment, schema migration, device provisioning, firmware changes or frontend changes were performed. The API uses the server-owned `demo-user`, with no login, cookies, credentials or client-supplied owner selectors.

## Canonical saved pages

| Page | Canonical ID | Prior revision | Current revision | Latest operation ID | Created at, UTC | Updated at, UTC |
| --- | --- | --- | --- | --- | --- | --- |
| What I want to track (demo) | `578460c0-8796-4e86-94b3-424022f6259e` | 1 | 2 | `demo-seed-emma-track-breast-cancer-v2` | `2026-10-24T12:19:52.954Z` | `2026-10-24T12:44:35.534Z` |
| What helps me (demo) | `be00b449-8435-461b-bd33-d28957168fb9` | 1 | 2 | `demo-seed-emma-helps-breast-cancer-v2` | `2026-10-24T12:19:54.076Z` | `2026-10-24T12:44:38.505Z` |
| My breast cancer recovery (demo) | `70a2f3a4-15af-47bb-8923-a9eeaef08373` | new | 1 | `demo-seed-emma-breast-cancer-recovery-v1` | `2026-10-24T12:44:41.781Z` | `2026-10-24T12:44:41.781Z` |

The two PATCH requests kept their original titles and canonical page IDs and required `expected_revision: 1`. Their original creation operation IDs remain `demo-seed-anna-track-20261024-v1` and `demo-seed-anna-helps-20261024-v1`; the new operation IDs above identify the updates. The recovery operation ID identifies its creation.

Page GET responses omit operation IDs. The PATCH mappings were verified by exact request replays that returned identical IDs, content, timestamps and revision 2. The recovery mapping comes from its successful POST request/response and canonical GET readback, not an exposed GET operation field. No recovery POST retry was needed.

## Prior baseline and preservation

Before any mutation, all accessible pages, context, profile and Journal were snapshotted. The historical manifest was confirmed present verbatim. Its SHA-256 was `5a5712245c515b0a6f0c540baa94309e0baa8947ba59728eb28c70c25ac19a9d`; the history file SHA-256 was `a380d49cff74dfb5e16d3592c43db2d7984ec28deb2b5434e50edd455684ab35`. The historical document was left untouched.

The initial canonical pages were both at revision 1, with full native content deeply equal to the original manifest. The individual GETs also matched the complete page objects in the page list and context. No human or visitor changes were found, and no recovery-page title existed.

| Baseline page | ID | Revision | Native-content SHA-256 |
| --- | --- | --- | --- |
| What helps me (demo) | `be00b449-8435-461b-bd33-d28957168fb9` | 1 | `7a75436673837d066dddf435485fc4611d96acdbaad74bbc3c959b7424782dfe` |
| What I want to track (demo) | `578460c0-8796-4e86-94b3-424022f6259e` | 1 | `dc81dbe50558505f251ff658fbd9b001c7625904610283a4a724ab81763ffd97` |

The complete Journal baseline was `{"entries":[],"next_cursor":null}` and remained deeply unchanged. There were zero unrelated live context pages. No page was deleted or archived. All original page IDs and creation timestamps were preserved. Existing records outside these two owned pages were not mutated.

The complete before and after profile was deeply equal, including the existing consent flag:

```json
{"owner_id":"demo-user","timezone":"UTC","allow_medical_voice_context":false,"revision":0,"updated_at":"2026-10-24T11:47:57.857Z"}
```

No health-profile consent change was requested or made. Flexible-page context still returned every saved page. The snapshots cover every record exposed by the fixed-user page and Journal APIs; legacy-owner records remain outside their read scope and were not accessed or modified.

## Exact native requests

These are the exact request bodies used. Each paragraph is a native BlockNote paragraph with deterministic block ID, default paragraph props, inline text and empty children. Fresh GETs returned content deeply equal to these full arrays, without wording changes.

### PATCH /pages/578460c0-8796-4e86-94b3-424022f6259e

Canonical saved ID `578460c0-8796-4e86-94b3-424022f6259e`, revision 2.

```json
{
  "title": "What I want to track (demo)",
  "content": [
    {"id":"afa2d830-32a4-5a01-8f39-dfaecae7598a","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Synthetic demo page. This journal follows Emma's life after breast cancer treatment.","styles":{}}],"children":[]},
    {"id":"d09d509b-2bcc-5cc7-9fb0-76ac4b09309d","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Let me describe fatigue and hand or joint pain from 0 to 10, where 0 means none and 10 means most severe; how long I slept; and any worry or mood changes in my own words.","styles":{}}],"children":[]},
    {"id":"03c19dcf-be7a-5608-94b1-1fbc001eb42a","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"If I mention medication, record the name, dose and time exactly as I report them. Do not assume that I took it or that it caused a symptom.","styles":{}}],"children":[]},
    {"id":"3b5c9c09-44b2-52af-8bd1-6de832213927","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Keep one thing that matters to me today alongside the symptoms. Make a short note I can revisit before my oncology follow-up. Use my words and keep physical and emotional experiences together.","styles":{}}],"children":[]}
  ],
  "operation_id": "demo-seed-emma-track-breast-cancer-v2",
  "expected_revision": 1
}
```

### PATCH /pages/be00b449-8435-461b-bd33-d28957168fb9

Canonical saved ID `be00b449-8435-461b-bd33-d28957168fb9`, revision 2.

```json
{
  "title": "What helps me (demo)",
  "content": [
    {"id":"b3a6c732-b2bc-5d45-98d0-c559eb5b43f9","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Synthetic demo page. These are Emma's personal coping preferences during breast cancer recovery, not medical advice.","styles":{}}],"children":[]},
    {"id":"bbba99d8-d145-51cd-868f-fda46efa1967","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"I prefer a quiet start and a warm shower before tackling the stairs. On a difficult morning, keep tasks short and leave room for rest.","styles":{}}],"children":[]},
    {"id":"31da50db-5d87-5f73-8313-1d186a0ae088","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"I ask my sister for help with jars and heavy shopping rather than pushing through painful hands. A short walk is optional when I feel up to it, not a task I have to complete.","styles":{}}],"children":[]},
    {"id":"d6802cd5-91db-5eb5-83e3-7a30ef70d15e","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"I like a rest after lunch and time to call my sister at three. When I feel worried, I want to note the feeling and any question for my oncology team, rather than try to solve it by changing medication.","styles":{}}],"children":[]},
    {"id":"691b31b1-e4b9-5286-b0fd-d6f5d75874cb","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Keep today's plan to one or two priorities drawn from these preferences, and leave the rest of my journal entry intact when I make a correction.","styles":{}}],"children":[]}
  ],
  "operation_id": "demo-seed-emma-helps-breast-cancer-v2",
  "expected_revision": 1
}
```

### POST /pages

Canonical saved ID `70a2f3a4-15af-47bb-8923-a9eeaef08373`, revision 1.

```json
{
  "title": "My breast cancer recovery (demo)",
  "content": [
    {"id":"06317e7c-fcc8-5a3f-b4eb-b930d4f2e31d","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Synthetic demo page. Emma is a fictional composite, not a real patient.","styles":{}}],"children":[]},
    {"id":"2f4a5a9e-ac1a-5af3-89b9-dd3aa03918a7","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"I have finished active hospital treatment for breast cancer. I am eighteen months into ongoing hormone therapy prescribed by my oncology team.","styles":{}}],"children":[]},
    {"id":"201603e1-4701-5064-b060-852c0855c7ab","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For this fictional demo, my existing prescription is letrozole 2.5 mg once daily. Record only what I report taking; do not recommend a dose or a treatment change.","styles":{}}],"children":[]},
    {"id":"a47e3503-2aaa-5dbf-b3f1-7c43b74c4046","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Joint pain, fatigue and worry affect each other. A full night's rest does not always make the fatigue go away, and people often assume I am back to normal now that hospital treatment has ended.","styles":{}}],"children":[]},
    {"id":"9d49706f-8632-5dad-b99f-4faa22f4413b","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"I want a short record of physical symptoms, feelings and everyday difficulties to read before my next oncology appointment. I do not want the companion to diagnose me or assess whether cancer has returned.","styles":{}}],"children":[]}
  ],
  "operation_id": "demo-seed-emma-breast-cancer-recovery-v1"
}
```

For safe reuse, GET the three canonical IDs and compare the complete saved title, content and current revision. Matching current pages require no writes. Retry only an uncertain or failed response to one of these same operations, with its exact body and stable operation ID. A PATCH retry keeps `expected_revision: 1`; a successful receipt returns revision 2 before checking a new update. Never change payload or operation ID to bypass a conflict. If a page is missing, archived, changed, or its title/operation conflicts, stop and report rather than recreate, overwrite, delete or silently duplicate it. An old receipt does not establish current live content; recheck GET and context.

## Fresh HTTP evidence

All timestamps below are UTC on 2026-10-24. Add two hours for Europe/Copenhagen. Every listed response was HTTP 200 with `Cache-Control: no-store`.

| Request | Observed at, UTC | Result |
| --- | --- | --- |
| Before GET /context | `2026-10-24T12:43:52.356941+00:00` | Two complete original pages; owner demo-user |
| Before GET /pages?limit=100 | `2026-10-24T12:43:53.293648+00:00` | Two pages; next_cursor null |
| Before GET /journal?limit=100 | `2026-10-24T12:43:53.862102+00:00` | Zero entries; next_cursor null |
| Before tracking GET | `2026-10-24T12:43:54.244240+00:00` | Full original content and revision 1 match |
| Before helps GET | `2026-10-24T12:43:54.613588+00:00` | Full original content and revision 1 match |
| PATCH /pages/578460c0-8796-4e86-94b3-424022f6259e | `2026-10-24T12:44:35.894788+00:00` | Saved canonical revision 2 and exact native content |
| PATCH /pages/be00b449-8435-461b-bd33-d28957168fb9 | `2026-10-24T12:44:38.836196+00:00` | Saved canonical revision 2 and exact native content |
| POST /pages | `2026-10-24T12:44:42.183743+00:00` | Saved canonical revision 1 and exact native content |
| Exact tracking PATCH replay | `2026-10-24T12:45:12.501853+00:00` | Identical complete revision-2 page |
| After tracking GET | `2026-10-24T12:45:12.860595+00:00` | Deeply equal to saved response and target payload |
| Exact helps PATCH replay | `2026-10-24T12:45:13.335417+00:00` | Identical complete revision-2 page |
| After helps GET | `2026-10-24T12:45:13.681550+00:00` | Deeply equal to saved response and target payload |
| Recovery GET | `2026-10-24T12:45:14.038145+00:00` | Deeply equal to saved response and target payload |
| After GET /pages?limit=100 | `2026-10-24T12:45:14.365070+00:00` | Exactly three canonical pages; next_cursor null |
| After GET /journal?limit=100 | `2026-10-24T12:45:15.014861+00:00` | Zero entries; full Journal baseline unchanged |
| Public GET /context | `2026-10-24T12:45:15.645700+00:00` | Exactly three complete canonical pages at revisions 2, 2, 1; profile unchanged |

Post-write requests used public `Origin: https://pink-hack-journal.lovable.app`, with no credentials. GET context returned `Access-Control-Allow-Origin: https://pink-hack-journal.lovable.app` and no `Access-Control-Allow-Credentials`. Its Vercel request identifier was `arn1::iad1::8m9j2-1792845915157-1b435be5e685`.

All three pages in public context were deeply equal to their complete canonical individual GET results, including IDs, titles, full native content, revisions and timestamps. Each page explicitly includes breast cancer framing. Native-content SHA-256 uses sorted object keys, UTF-8 JSON, literal Unicode and no separator whitespace:

- What I want to track (demo): `59b350a6f8e95c40988d34d20dc96da349b4647845f12d356a10fad8e48f2f68`.
- What helps me (demo): `e2ca87ba9e80900d37ee007659221bca9f68e958c7e8dc7a8871104d3d813c26`.
- My breast cancer recovery (demo): `28b53dd8388b294617b06c76f12fac39e1c2c582c64bc272da4ce224198a4f6c`.

Complete local HTTP snapshots and source payloads are retained for this session in `/tmp/pink-hack-emma-seed-{before,payloads,writes,after}.json`. This manifest and the historical link contain the durable payloads and baseline evidence for safe reuse. No migration or deploy lock was acquired.

## Canonical spoken request and handoff

The following is the original canonical request from the new [demo-script.md](demo-script.md#spoken-request). It is test input, not a saved Journal result:

> "I'm Emma. Since breast cancer treatment ended, the fatigue hasn't gone away. Today it's six out of ten, my hand pain is seven, and I slept five hours. I'm worried about my next oncology appointment. I took my prescribed letrozole, 2.5 milligrams, at nine this morning. I'd like enough energy to call my sister at three. Please save this in my journal and make a manageable plan using my pages."

Inspect the three retained pages by their titles in the sidebar at [the public app](https://pink-hack-journal.lovable.app/app). The mic coordinator may resume exactly one genuine human voice loop after the owners receive this manifest and refresh the baseline. This seed establishes saved pages, retry behavior and public all-page context only. It provides no voice, model-use, browser-rendering, patient-use or clinical-outcome proof. The seed writer started no provider or audio session.

No seed blocker or title/operation conflict remains.
