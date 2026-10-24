---
provenance: "Unvetted Synthetic"
---

# Demo seed manifest

**Ten fictional Emma history entries are saved, currently at revision 2.** The backend owner performed the user-authorized direct replacement and subsequent cosmetic updates. The latest returned full Journal readback contains **11 records: ten seeds plus one later unattributed record**. No data mutation was performed by this documentation worker.

Current readback time: `2026-10-24T14:40:25.733Z`. Durable cosmetic receipt and database evidence: `2026-10-24T14:42:28.969Z`. These timestamps are UTC. Add two hours for Europe/Copenhagen.

The records are manually seeded, AI-composed fictional presentation artifacts. They do not demonstrate application-agent execution, live voice, patient use, clinical patterns, adherence or clinical benefit. Every seed title ends with `(demo)` and every first paragraph reads exactly `Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.`

## Ownership and archived baseline

[Backend owner](t3-thread://v1/dac033a2-a1c4-48ee-a7cb-39cb86afe1a7) was the sole live database writer. The previous seed worker's API and database continuation authority was revoked; this thread prepared the sanitized handoff and documents returned evidence only. No Stop, Start, provider action, runtime restart, deployment or Git operation was performed by this thread.

The previous canonical context manifest is preserved verbatim in [demo-case-history-2026-10-24.md](demo-case-history-2026-10-24.md#context-manifest-before-ten-entry-journal-replacement), SHA-256 `ba7f223a04f0f1a30a4a494cf8792797531587b4d1e2bfcbae8c11300fbde10a`. The entire pre-existing history prefix was preserved, SHA-256 `e5a775a9bcbb0460bb0f8ebad8fa6909f1ca1bff928bbcd046ec70fc03091993`. Its earlier Journal-zero checks and revision-1 seed observations remain historical, rather than claims about current data.

Accepted original preparation: `/tmp/pink-hack-emma-journal-ten-prepared.json`, SHA-256 `0861a79f4a15b8a9ce3734fdfce4cf815674795137b1213c98691d30f02d7361`. Sanitized direct handoff: `/tmp/pink-hack-emma-journal-ten-direct.json`, SHA-256 `660ab155490e5cf7defa896892e8e740f90e18a663a9938eec7a3bdfbdb5aeaa`. The original file remains unchanged. Sanitation removed only each `payload.original_text`; native blocks, IDs, dates, titles, properties and creation operation IDs were unchanged. Neither input used a properties-date workaround or a request source override.

## Original atomic replacement

The backend's private before snapshot was captured at `2026-10-24T14:35:45.770Z`; the after snapshot at `2026-10-24T14:35:56.679Z`; the result summary at `2026-10-24T14:36:03.691Z`. One atomic transaction removed **3** current `demo-user` Journal records and inserted **10** dated October 14–23. Immediately after that transaction the demo Journal contained exactly ten seeds at revision 1. The net transaction count change was **+7**, from three to ten. This exact-ten state is historical.

| Removed ID | Prior revision | Prior creation operation ID |
| --- | --- | --- |
| `d674033d-c2ce-4ada-9c00-300550e747bc` | 1 | `69e77157-266b-4211-9b29-b831263473d2` |
| `6de24801-f382-484b-8cf9-a30afb2f9b30` | 1 | `8a4ae34b-1fe4-4c6f-b5ca-e6bc2a64145e` |
| `49401299-5cb1-471b-8f85-22522cef8261` | 1 | `65e34838-bdbc-4e98-b7fe-51cde87f0ca9` |

All removed records are preserved in the backend's private before snapshot. The third ID above comes from the actual transaction evidence; the replacement was not limited to the two earlier known transcript records. No later row is part of this removal list.

The backend returned `atomic_commit: true`, `unrelated_tables_preserved_in_transaction: true`, `legacy_demo_owner_count: 0`, and full database/HTTP readback confirmation. All ten initial entries deeply matched the sanitized native inputs, with `source: app`, empty `original_text`, revision 1 and no voice/session linkage. Seven other-owner canonical Journal rows were present and preserved in the before/after snapshots; legacy Journal rows and other-owner data were retained. No demo-user legacy rows could lazily repopulate the replaced Journal.

Transaction preservation is the backend's returned in-transaction verification. The outer snapshots span several seconds and differ in a device lease expiry and an existing conversation's state/timestamp, so this document does not claim those complete outer snapshots are byte-identical. It does not attribute those concurrent state changes to any actor. Pages and profiles are deeply identical across the returned snapshots. The backend reported zero provider and runtime actions for replacement.

## Cosmetic updates and current state

A later user request, "This is not pretty please resolve", authorized the backend to clean visible properties. It applied ten normal revision-checked PATCHes with `expected_revision: 1`, returning revision 2. It removed `demo_seed`, `provenance`, `demo_case` and `demo_origin` from current entry properties. On the four explicitly medication-reporting days, it replaced `medication_name`, `medication_dose_mg` and `medication_time` with one matching `medication` string. Native bodies, block IDs, titles, dates, numerical ratings and visible fictional labels are unchanged. The internal properties are historical inputs only and must not be restored. Provenance remains in this durable manifest.

Each creation operation ID below is immutable creation metadata. The separate cosmetic operation ID identifies the later PATCH. Its pattern is `demo-journal-tidy-props-<entryUUID>-v1`.

| Date | Title | Canonical ID | Current revision | Creation operation ID | Cosmetic PATCH operation ID |
| --- | --- | --- | --- | --- | --- |
| 2026-10-14 | 2026-10-14 A quiet morning (demo) | `f5f6e0c2-b1f4-46c1-8406-d4c24ee63c26` | 2 | `demo-seed-emma-journal-20261014-v1` | `demo-journal-tidy-props-f5f6e0c2-b1f4-46c1-8406-d4c24ee63c26-v1` |
| 2026-10-15 | 2026-10-15 Shopping with help (demo) | `fb21070c-e173-4f73-a800-fabfe53c2dd6` | 2 | `demo-seed-emma-journal-20261015-v1` | `demo-journal-tidy-props-fb21070c-e173-4f73-a800-fabfe53c2dd6-v1` |
| 2026-10-16 | 2026-10-16 Keeping the day small (demo) | `123e076f-2c11-43ef-b63d-ced654240449` | 2 | `demo-seed-emma-journal-20261016-v1` | `demo-journal-tidy-props-123e076f-2c11-43ef-b63d-ced654240449-v1` |
| 2026-10-17 | 2026-10-17 An optional walk (demo) | `0edd64f2-d321-4560-a274-502e291dd09b` | 2 | `demo-seed-emma-journal-20261017-v1` | `demo-journal-tidy-props-0edd64f2-d321-4560-a274-502e291dd09b-v1` |
| 2026-10-18 | 2026-10-18 Leaving the jars to someone else (demo) | `d3c36f69-5f17-47db-a713-3051042874c8` | 2 | `demo-seed-emma-journal-20261018-v1` | `demo-journal-tidy-props-d3c36f69-5f17-47db-a713-3051042874c8-v1` |
| 2026-10-19 | 2026-10-19 Rest and a sister call (demo) | `9fd60a96-f9e4-44fe-beaa-72c901141805` | 2 | `demo-seed-emma-journal-20261019-v1` | `demo-journal-tidy-props-9fd60a96-f9e4-44fe-beaa-72c901141805-v1` |
| 2026-10-20 | 2026-10-20 A difficult start (demo) | `daf177b7-f56c-4406-87b2-eeea47128246` | 2 | `demo-seed-emma-journal-20261020-v1` | `demo-journal-tidy-props-daf177b7-f56c-4406-87b2-eeea47128246-v1` |
| 2026-10-21 | 2026-10-21 One small task (demo) | `0889cc0a-f912-449c-a5dc-7dcfaac81c33` | 2 | `demo-seed-emma-journal-20261021-v1` | `demo-journal-tidy-props-0889cc0a-f912-449c-a5dc-7dcfaac81c33-v1` |
| 2026-10-22 | 2026-10-22 Keeping a question for follow-up (demo) | `500e8842-6d85-46d3-9304-ae035c0dc598` | 2 | `demo-seed-emma-journal-20261022-v1` | `demo-journal-tidy-props-500e8842-6d85-46d3-9304-ae035c0dc598-v1` |
| 2026-10-23 | 2026-10-23 Getting my notes ready (demo) | `77dc8324-2554-4256-b8d3-b9a6b1f6ddcc` | 2 | `demo-seed-emma-journal-20261023-v1` | `demo-journal-tidy-props-77dc8324-2554-4256-b8d3-b9a6b1f6ddcc-v1` |

Current properties, exactly as returned. Missing optional values remain absent; notably October 19 and 22 have no overall-health rating. Symptom severities use 0–10, higher worse; overall health uses 1–10, higher better; sleep_hours is duration, uncharted. These are explicitly authored fictional observations, not research measurements:

```json
[
  {
    "journal_date": "2026-10-14",
    "entry_id": "f5f6e0c2-b1f4-46c1-8406-d4c24ee63c26",
    "properties": {
      "fatigue": 6,
      "pain": 7,
      "sleep_hours": 5,
      "sleep_difficulty": 6,
      "overall_health": 4,
      "medication": "letrozole 2.5 mg at 09:00"
    }
  },
  {
    "journal_date": "2026-10-15",
    "entry_id": "fb21070c-e173-4f73-a800-fabfe53c2dd6",
    "properties": {
      "fatigue": 5,
      "pain": 4,
      "sleep_hours": 6.5,
      "nausea": 2,
      "appetite_loss": 3,
      "overall_health": 5
    }
  },
  {
    "journal_date": "2026-10-16",
    "entry_id": "123e076f-2c11-43ef-b63d-ced654240449",
    "properties": {
      "fatigue": 7,
      "pain": 6,
      "sleep_hours": 5,
      "sleep_difficulty": 7,
      "overall_health": 3
    }
  },
  {
    "journal_date": "2026-10-17",
    "entry_id": "0edd64f2-d321-4560-a274-502e291dd09b",
    "properties": {
      "fatigue": 4,
      "pain": 5,
      "sleep_hours": 7,
      "overall_health": 6
    }
  },
  {
    "journal_date": "2026-10-18",
    "entry_id": "d3c36f69-5f17-47db-a713-3051042874c8",
    "properties": {
      "fatigue": 6,
      "pain": 8,
      "sleep_hours": 6,
      "appetite_loss": 4,
      "overall_health": 4,
      "medication": "letrozole 2.5 mg at 09:30"
    }
  },
  {
    "journal_date": "2026-10-19",
    "entry_id": "9fd60a96-f9e4-44fe-beaa-72c901141805",
    "properties": {
      "fatigue": 5,
      "pain": 3,
      "sleep_hours": 7,
      "nausea": 1
    }
  },
  {
    "journal_date": "2026-10-20",
    "entry_id": "daf177b7-f56c-4406-87b2-eeea47128246",
    "properties": {
      "fatigue": 7,
      "pain": 7,
      "sleep_hours": 4.5,
      "sleep_difficulty": 8,
      "nausea": 3,
      "overall_health": 3
    }
  },
  {
    "journal_date": "2026-10-21",
    "entry_id": "0889cc0a-f912-449c-a5dc-7dcfaac81c33",
    "properties": {
      "fatigue": 4,
      "pain": 4,
      "sleep_hours": 6.5,
      "appetite_loss": 1,
      "overall_health": 6,
      "medication": "letrozole 2.5 mg at 08:45"
    }
  },
  {
    "journal_date": "2026-10-22",
    "entry_id": "500e8842-6d85-46d3-9304-ae035c0dc598",
    "properties": {
      "fatigue": 6,
      "pain": 5,
      "sleep_hours": 5.5,
      "sleep_difficulty": 5
    }
  },
  {
    "journal_date": "2026-10-23",
    "entry_id": "77dc8324-2554-4256-b8d3-b9a6b1f6ddcc",
    "properties": {
      "fatigue": 5,
      "pain": 6,
      "sleep_hours": 6,
      "appetite_loss": 2,
      "overall_health": 5,
      "medication": "letrozole 2.5 mg at 09:00"
    }
  }
]
```

## Later unattributed row

At the final readback the full Journal had **11** entries. The additional record is preserved completely and excluded from the ten-seed set:

```json
{
  "id": "a13574b3-33f6-4618-a4ae-5e91fd107dc6",
  "title": "Oct 24, 2026, 4:38 PM",
  "journal_date": "2026-10-24",
  "revision": 1,
  "created_at": "2026-10-24T14:38:35.631Z",
  "updated_at": "2026-10-24T14:38:35.631Z"
}
```

Its actor, input method and voice/agent provenance are not established by this manifest. No cleanup, restoration or replacement of this row was performed or authorized by this documentation handoff. Its complete object remains in the backend's private `all_journal` readback.

## Context and profile preservation

| Context page | ID | Revision |
| --- | --- | --- |
| What I want to track | `578460c0-8796-4e86-94b3-424022f6259e` | 4 |
| What helps me | `be00b449-8435-461b-bd33-d28957168fb9` | 3 |
| My breast cancer recovery (demo) | `70a2f3a4-15af-47bb-8923-a9eeaef08373` | 1 |

All three complete page records and profile rows match the backend's before/after snapshots. The fixed demo profile remains unchanged, including its existing consent flag:

```json
{
  "owner_id": "demo-user",
  "timezone": "UTC",
  "allow_medical_voice_context": 0,
  "revision": 0,
  "updated_at": "2026-10-24T11:47:57.857Z"
}
```

Every seed retains mutation-time `context_revisions` for those page IDs at 4/3/1. This stamp is not evidence that an application model used those pages. Earlier full native context payloads and title/intro drift evidence remain in the archived manifest. No context, profile, device or conversation change was requested for the seed.

## Exact current native artifacts

These are the complete canonical seed records from the latest HTTP readback, deeply equal to the backend's final database rows and cosmetic receipt results. All have revision 2, `source: app`, `original_text: ""` and null voice/session links. The capture ID is ordinary record metadata and is not speech proof. These snapshots are documentation, not commands or permission to repeat any write.

### 2026-10-14 A quiet morning (demo)

```json
{
  "id": "f5f6e0c2-b1f4-46c1-8406-d4c24ee63c26",
  "owner_id": "demo-user",
  "journal_date": "2026-10-14",
  "title": "2026-10-14 A quiet morning (demo)",
  "original_text": "",
  "content": [
    {"id":"9c51bcf9-c367-5fb2-b31e-a9b415749f3e","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"2b3eaa5c-ea37-50c4-9578-34f0b3f11c16","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-14. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"3355e0db-0a7c-5189-81e2-88898a8a3b72","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 6 out of 10, where 0 is none and 10 is most severe. My hand pain is 7 out of 10, where 0 is none and 10 is most severe. I slept 5 hours. My sleep difficulty is 6 out of 10, where 0 is none and 10 is most severe. My overall-health rating is 4 out of 10, where 1 is very poor and 10 is very good. My hands feel stiff when I try to open jars. I feel worried about describing the difficult mornings at my next oncology appointment.","styles":{}}],"children":[]},
    {"id":"432b001a-162a-525d-be15-b442988cd0ec","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"In this fictional account, I took my prescribed letrozole 2.5 mg at 09:00. This note records my report and does not recommend a dose or treatment change.","styles":{}}],"children":[]},
    {"id":"e87c59c3-dc7a-50cf-bce0-b55013a4af02","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want to have time to call my sister at three.","styles":{}}],"children":[]},
    {"id":"2c50c45c-f4ec-5428-80c6-803996b1eee1","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"a3b19064-e396-5c27-a5e8-b65c77051f34","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Take a quiet start and a warm shower before the stairs.","styles":{}}],"children":[]},
    {"id":"82fc4a2f-535d-5539-821c-4e3f88695334","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Leave time for rest after lunch and my sister call.","styles":{}}],"children":[]},
    {"id":"687ea760-736e-57e0-a1ee-ec62de130624","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"21694223-836d-53cb-8271-d8c097b4f4e5","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"I want to remember that hand pain and worry both mattered today. How can I bring these short notes into our discussion?","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 6, "pain": 7, "sleep_hours": 5, "sleep_difficulty": 6, "overall_health": 4, "medication": "letrozole 2.5 mg at 09:00"},
  "source": "app",
  "device_id": null,
  "capture_id": "d4f5e82b-c80c-489c-b5f2-1c3d1f5b2f34",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261014-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:58.824Z"
}
```

### 2026-10-15 Shopping with help (demo)

```json
{
  "id": "fb21070c-e173-4f73-a800-fabfe53c2dd6",
  "owner_id": "demo-user",
  "journal_date": "2026-10-15",
  "title": "2026-10-15 Shopping with help (demo)",
  "original_text": "",
  "content": [
    {"id":"ae3ee9d6-a3f1-5db5-b1a2-2f00e58c765c","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"49c8ac15-f6f1-5c4f-ae1e-3539f6cc54b2","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-15. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"3aee6e45-ee20-5e35-847d-a8e1c47b4cef","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 5 out of 10, where 0 is none and 10 is most severe. My hand pain is 4 out of 10, where 0 is none and 10 is most severe. I slept 6.5 hours. My nausea is 2 out of 10, where 0 is none and 10 is most severe. My appetite loss is 3 out of 10, where 0 is none and 10 is most severe. My overall-health rating is 5 out of 10, where 1 is very poor and 10 is very good. My hands still ache, and I do not feel like a large meal. I feel frustrated about needing help with an ordinary errand.","styles":{}}],"children":[]},
    {"id":"101df46f-095b-5153-8c61-863fe7913db5","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want to get the shopping done with my sister's help.","styles":{}}],"children":[]},
    {"id":"72573adc-db5f-5eb6-84f2-0ab596acd2ee","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"d5d94b04-d9f8-5d17-85a7-8731eb6baf3d","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Ask my sister to carry the heavy shopping.","styles":{}}],"children":[]},
    {"id":"0ee54d8a-9db1-5313-bbb0-5ab2d46e66f9","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Rest after lunch without adding another errand.","styles":{}}],"children":[]},
    {"id":"6aa4920f-fab3-5b66-99e8-9cadbcfafe14","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"4fbc58df-26ba-5758-b848-b52687304829","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For my follow-up, remember the low appetite, mild nausea and frustration alongside the pain.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 5, "pain": 4, "sleep_hours": 6.5, "nausea": 2, "appetite_loss": 3, "overall_health": 5},
  "source": "app",
  "device_id": null,
  "capture_id": "cae4d063-98d0-47a9-9ec6-aedca49110f1",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261015-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:57.575Z"
}
```

### 2026-10-16 Keeping the day small (demo)

```json
{
  "id": "123e076f-2c11-43ef-b63d-ced654240449",
  "owner_id": "demo-user",
  "journal_date": "2026-10-16",
  "title": "2026-10-16 Keeping the day small (demo)",
  "original_text": "",
  "content": [
    {"id":"68a9aa69-ddae-5ea2-80bc-61c1e9060a77","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"cc334f06-8c38-58f6-b6b1-7d41a970e848","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-16. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"54e7a4da-d816-53d9-a2fa-8e3069a742c2","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 7 out of 10, where 0 is none and 10 is most severe. My hand pain is 6 out of 10, where 0 is none and 10 is most severe. I slept 5 hours. My sleep difficulty is 7 out of 10, where 0 is none and 10 is most severe. My overall-health rating is 3 out of 10, where 1 is very poor and 10 is very good. I feel tired even after lying down, and my hands make household tasks awkward. I feel low when people expect me to be back to normal after hospital treatment.","styles":{}}],"children":[]},
    {"id":"954d3186-0a65-5f5f-b332-665fbe7f97ab","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want a calm call with my sister at three.","styles":{}}],"children":[]},
    {"id":"1190c2ee-ba4d-5dfa-acb1-574d286422b2","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"b06a900f-d5e7-5592-ab43-89b327b8f26f","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Keep the morning quiet and leave the chores for another day.","styles":{}}],"children":[]},
    {"id":"5263cc06-3f9f-599e-a0a5-5ceef95622b7","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Rest after lunch with time kept for the sister call.","styles":{}}],"children":[]},
    {"id":"9ea3946c-3761-5879-a279-c8d4376e68e5","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"e5853e66-4723-5e00-bc7d-f3ea956ce444","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"I want to ask how to describe fatigue, broken sleep and low mood together at my oncology appointment.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 7, "pain": 6, "sleep_hours": 5, "sleep_difficulty": 7, "overall_health": 3},
  "source": "app",
  "device_id": null,
  "capture_id": "9891bbf0-0b1e-48b7-b27d-ee9578b18706",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261016-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:56.333Z"
}
```

### 2026-10-17 An optional walk (demo)

```json
{
  "id": "0edd64f2-d321-4560-a274-502e291dd09b",
  "owner_id": "demo-user",
  "journal_date": "2026-10-17",
  "title": "2026-10-17 An optional walk (demo)",
  "original_text": "",
  "content": [
    {"id":"58382b2a-eb71-5e84-94de-b7a8e6463cb2","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"de5152b3-f321-51c2-932f-bfd2f5ee2edd","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-17. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"689120a3-d745-5305-a6d0-7cb2149e86b0","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 4 out of 10, where 0 is none and 10 is most severe. My hand pain is 5 out of 10, where 0 is none and 10 is most severe. I slept 7 hours. My overall-health rating is 6 out of 10, where 1 is very poor and 10 is very good. My hands still hurt, though I have room for one small activity. I feel uncertain about how much to put on my list.","styles":{}}],"children":[]},
    {"id":"f525ad3f-45c7-59b9-9cd9-7500c2d956b2","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I would like a short walk before lunch if I feel up to it.","styles":{}}],"children":[]},
    {"id":"64b9337d-1098-540a-a72f-3fe74c9ebfb4","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"b300d4b5-2650-55b9-9047-611d03958c08","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Keep the walk optional and short.","styles":{}}],"children":[]},
    {"id":"536b37c7-54ae-50be-9673-ffd837f1b263","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Leave room for rest after lunch.","styles":{}}],"children":[]},
    {"id":"cbb61e3e-d00d-5e17-a612-14655317f813","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"3f9e58fb-b020-5482-b563-9a8fe6662ae7","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Remember that pain was still present on a day when I chose one small activity. No medicine note was requested for this entry.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 4, "pain": 5, "sleep_hours": 7, "overall_health": 6},
  "source": "app",
  "device_id": null,
  "capture_id": "6489a124-235c-436b-af1a-542216b60aa3",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261017-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:55.149Z"
}
```

### 2026-10-18 Leaving the jars to someone else (demo)

```json
{
  "id": "d3c36f69-5f17-47db-a713-3051042874c8",
  "owner_id": "demo-user",
  "journal_date": "2026-10-18",
  "title": "2026-10-18 Leaving the jars to someone else (demo)",
  "original_text": "",
  "content": [
    {"id":"b7ffccdd-18f1-5726-a78e-6ab866fac75b","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"6a3a466f-b2cd-579a-9586-2ffd3fad9960","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-18. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"38709db4-e1ca-5fc6-b19c-e1844ff13363","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 6 out of 10, where 0 is none and 10 is most severe. My hand pain is 8 out of 10, where 0 is none and 10 is most severe. I slept 6 hours. My appetite loss is 4 out of 10, where 0 is none and 10 is most severe. My overall-health rating is 4 out of 10, where 1 is very poor and 10 is very good. Opening lids feels difficult, and I have little appetite today. I feel irritated about the small things I cannot easily do on my own.","styles":{}}],"children":[]},
    {"id":"27708bdd-da9c-5794-bb27-6bca72151774","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"In this fictional account, I took my prescribed letrozole 2.5 mg at 09:30. This note records my report and does not recommend a dose or treatment change.","styles":{}}],"children":[]},
    {"id":"27025dc1-0204-53aa-8028-4ac5a8c25a82","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want lunch to be simple and manageable.","styles":{}}],"children":[]},
    {"id":"31a2b14b-c46d-5e4b-8d01-300da3a711be","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"d70a8c7a-92ba-5ad3-af00-e9acf7eba142","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Ask my sister for help with jars and lids.","styles":{}}],"children":[]},
    {"id":"49cb7721-2da0-513d-864c-f0c2287a69d1","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Keep only lunch and rest after lunch on my list.","styles":{}}],"children":[]},
    {"id":"20daafe3-f2fa-5338-9931-db80030c5469","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"ae8e8a9b-edf6-585c-9fc6-e41426d0596d","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For my oncology appointment, remember the painful hands, low appetite and irritation. I do not know what caused them.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 6, "pain": 8, "sleep_hours": 6, "appetite_loss": 4, "overall_health": 4, "medication": "letrozole 2.5 mg at 09:30"},
  "source": "app",
  "device_id": null,
  "capture_id": "aa08ccbe-31fc-4205-b2a1-d3349f0cb9a4",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261018-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:54.103Z"
}
```

### 2026-10-19 Rest and a sister call (demo)

```json
{
  "id": "9fd60a96-f9e4-44fe-beaa-72c901141805",
  "owner_id": "demo-user",
  "journal_date": "2026-10-19",
  "title": "2026-10-19 Rest and a sister call (demo)",
  "original_text": "",
  "content": [
    {"id":"e49751ee-d7e8-50c5-a8a7-f3663777b0da","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"5615027c-02ae-543a-9eec-b40b184e2080","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-19. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"776bf329-ae91-59c9-a3cf-dc1cbdab3cdd","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 5 out of 10, where 0 is none and 10 is most severe. My hand pain is 3 out of 10, where 0 is none and 10 is most severe. I slept 7 hours. My nausea is 1 out of 10, where 0 is none and 10 is most severe. My hands ache less severely than on some days, but tiredness is still part of this morning. I feel nervous when I think about my next oncology visit.","styles":{}}],"children":[]},
    {"id":"62872a08-3507-5b66-8e35-2e676ddbf94c","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want to speak with my sister at three.","styles":{}}],"children":[]},
    {"id":"74e2aba4-a314-53a8-a948-400baa941150","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"69cc38ca-5a0e-53a6-945d-83928f2910ca","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Rest after lunch.","styles":{}}],"children":[]},
    {"id":"234683ed-f008-54c9-a3ec-e49d3bbdc101","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Keep the three o'clock call as my one everyday priority.","styles":{}}],"children":[]},
    {"id":"762b7cf1-c1c8-54fd-802d-5412a61ca130","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"4af41ea2-b112-525a-a2a1-9082472ab445","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Remember the worry about follow-up and the fatigue together. I have not given an overall-health rating for this day.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 5, "pain": 3, "sleep_hours": 7, "nausea": 1},
  "source": "app",
  "device_id": null,
  "capture_id": "37f547b6-aa5c-4f30-8fa6-3aa259ee5b76",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261019-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:53.074Z"
}
```

### 2026-10-20 A difficult start (demo)

```json
{
  "id": "daf177b7-f56c-4406-87b2-eeea47128246",
  "owner_id": "demo-user",
  "journal_date": "2026-10-20",
  "title": "2026-10-20 A difficult start (demo)",
  "original_text": "",
  "content": [
    {"id":"e02915fc-1f90-5267-ad22-f7744bae7c88","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"f4522c02-8709-5b46-8b88-c35401af99c9","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-20. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"aff74462-7f25-50b6-b462-44a144b96ab2","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 7 out of 10, where 0 is none and 10 is most severe. My hand pain is 7 out of 10, where 0 is none and 10 is most severe. I slept 4.5 hours. My sleep difficulty is 8 out of 10, where 0 is none and 10 is most severe. My nausea is 3 out of 10, where 0 is none and 10 is most severe. My overall-health rating is 3 out of 10, where 1 is very poor and 10 is very good. It is a difficult morning, and I do not have room for a long task list. I feel worried that I will forget to mention these days at my appointment.","styles":{}}],"children":[]},
    {"id":"eb838fc8-7220-5d74-8a69-f439eba8ed9a","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want to write one question for my oncology team.","styles":{}}],"children":[]},
    {"id":"8f11413f-708b-5a6b-8d68-e3cbf2728142","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"8ce381d3-4b45-540a-b200-5dc31b6155cc","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Take a quiet start with no extra morning errands.","styles":{}}],"children":[]},
    {"id":"1fb18adc-1b15-54aa-9ff7-8ae70b6df0aa","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Leave space for rest after lunch.","styles":{}}],"children":[]},
    {"id":"706814a6-0055-5356-be5e-297db1b6ba57","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"45414ccb-59b3-59d7-b2d5-d161f6a498b3","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My question is how to keep a useful record of fatigue, pain, sleep and worry between appointments. I am not asking to change treatment.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 7, "pain": 7, "sleep_hours": 4.5, "sleep_difficulty": 8, "nausea": 3, "overall_health": 3},
  "source": "app",
  "device_id": null,
  "capture_id": "342f716c-2201-4d1e-9de5-f9047992f70c",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261020-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:52.069Z"
}
```

### 2026-10-21 One small task (demo)

```json
{
  "id": "0889cc0a-f912-449c-a5dc-7dcfaac81c33",
  "owner_id": "demo-user",
  "journal_date": "2026-10-21",
  "title": "2026-10-21 One small task (demo)",
  "original_text": "",
  "content": [
    {"id":"bcb9b2c0-0866-5957-98f1-023fa5238bb8","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"49bc5a4e-5e60-53d6-88c1-569791ac3708","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-21. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"89a0f208-b132-5a6c-84f5-ff87d362b57c","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 4 out of 10, where 0 is none and 10 is most severe. My hand pain is 4 out of 10, where 0 is none and 10 is most severe. I slept 6.5 hours. My appetite loss is 1 out of 10, where 0 is none and 10 is most severe. My overall-health rating is 6 out of 10, where 1 is very poor and 10 is very good. My hands are still sore when I lift shopping bags. I feel relieved to have company, though I still worry about the follow-up.","styles":{}}],"children":[]},
    {"id":"2b75a3a4-b2e6-52e6-9d73-a8c0274d07f0","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"In this fictional account, I took my prescribed letrozole 2.5 mg at 08:45. This note records my report and does not recommend a dose or treatment change.","styles":{}}],"children":[]},
    {"id":"7724b161-8ba4-56b7-8525-4d3ad71f6757","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want to put away the light shopping with my sister.","styles":{}}],"children":[]},
    {"id":"dfb9019c-6281-54e4-8dec-82c4beebef07","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"f39db379-ebdb-5eee-aa65-a789a24d1527","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Ask my sister to handle the heavy bags.","styles":{}}],"children":[]},
    {"id":"cfefaee0-e052-55a9-990e-f82f9046e309","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Keep a short walk before lunch optional.","styles":{}}],"children":[]},
    {"id":"de0db56e-1908-500a-b480-bc45e2690e78","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"0ede3c8f-699c-535e-8596-3c3c78985828","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Remember that the everyday difficulty with bags and my worry were still worth noting on this day.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 4, "pain": 4, "sleep_hours": 6.5, "appetite_loss": 1, "overall_health": 6, "medication": "letrozole 2.5 mg at 08:45"},
  "source": "app",
  "device_id": null,
  "capture_id": "07dd54e3-272c-4133-abac-aad3a0958da5",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261021-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:51.010Z"
}
```

### 2026-10-22 Keeping a question for follow-up (demo)

```json
{
  "id": "500e8842-6d85-46d3-9304-ae035c0dc598",
  "owner_id": "demo-user",
  "journal_date": "2026-10-22",
  "title": "2026-10-22 Keeping a question for follow-up (demo)",
  "original_text": "",
  "content": [
    {"id":"42e5978b-87e7-5f99-ac6f-06aece80190b","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"c4469749-867e-586a-86ee-21d73bb4e1a5","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-22. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"4ae9b6e6-ab1c-5dee-9045-f99f49e3a76d","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 6 out of 10, where 0 is none and 10 is most severe. My hand pain is 5 out of 10, where 0 is none and 10 is most severe. I slept 5.5 hours. My sleep difficulty is 5 out of 10, where 0 is none and 10 is most severe. My hands are stiff, and the fatigue has not disappeared with rest. I feel impatient about the ongoing burden after active hospital treatment.","styles":{}}],"children":[]},
    {"id":"2c27ffed-34f6-5b50-af27-d2a39abc25fb","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want to keep time for my sister's three o'clock call.","styles":{}}],"children":[]},
    {"id":"a653c7d8-1aa8-5ca9-b2a1-e88809cf5ebe","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"8c782808-a6b3-5a91-9695-b2ac6b807114","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Take a warm shower before tackling the stairs.","styles":{}}],"children":[]},
    {"id":"9e4849fd-c23e-5687-9f5b-365c37f3da24","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Rest after lunch and keep the call free of other tasks.","styles":{}}],"children":[]},
    {"id":"42d4f9e7-6dff-5c8a-9482-9cfae5c32538","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"09be3b26-8285-56a1-a838-f64d0fa88ef7","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"I want to ask how to bring the physical symptoms and impatience into the same appointment conversation. No overall-health rating was given.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 6, "pain": 5, "sleep_hours": 5.5, "sleep_difficulty": 5},
  "source": "app",
  "device_id": null,
  "capture_id": "8018f19a-aeb4-47d3-accd-7b53dc51a576",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261022-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:49.941Z"
}
```

### 2026-10-23 Getting my notes ready (demo)

```json
{
  "id": "77dc8324-2554-4256-b8d3-b9a6b1f6ddcc",
  "owner_id": "demo-user",
  "journal_date": "2026-10-23",
  "title": "2026-10-23 Getting my notes ready (demo)",
  "original_text": "",
  "content": [
    {"id":"15ac3670-11af-5987-b1a7-760382b259cd","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fictional demo entry. Emma is a composite; this entry was seeded for the presentation, not recorded through voice.","styles":{}}],"children":[]},
    {"id":"485a9a4b-29b8-519f-9c93-e0fbe814b5ef","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"For 2026-10-23. I am eighteen months into prescribed hormone therapy after active hospital treatment for breast cancer.","styles":{}}],"children":[]},
    {"id":"7a9e8319-23e9-5b6a-9a54-46b96e9c1656","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"My fatigue is 5 out of 10, where 0 is none and 10 is most severe. My hand pain is 6 out of 10, where 0 is none and 10 is most severe. I slept 6 hours. My appetite loss is 2 out of 10, where 0 is none and 10 is most severe. My overall-health rating is 5 out of 10, where 1 is very poor and 10 is very good. My hands make writing a long account tiring, so I want a short record. I feel worried about leaving something important out at my next oncology appointment.","styles":{}}],"children":[]},
    {"id":"03d2c7e5-707b-5787-85e9-e2a572c5964c","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"In this fictional account, I took my prescribed letrozole 2.5 mg at 09:00. This note records my report and does not recommend a dose or treatment change.","styles":{}}],"children":[]},
    {"id":"49b8dc28-bd4c-5b83-b8e8-6556f4defb51","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Today I want to read through these notes and choose one question to take with me.","styles":{}}],"children":[]},
    {"id":"9e9f91d6-0853-511c-824d-c9e71491e2e2","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Day plan","styles":{}}],"children":[]},
    {"id":"9c62bdce-e6b1-5cbf-a486-82d7461dcdad","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Keep the morning quiet while I read the notes.","styles":{}}],"children":[]},
    {"id":"87be7c33-7153-5636-bbfd-4872ee0979d2","type":"checkListItem","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Rest after lunch with room for the sister call at three.","styles":{}}],"children":[]},
    {"id":"4d5e75a5-adcf-5e99-823d-927f4345c541","type":"heading","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"For my oncology appointment","styles":{}}],"children":[]},
    {"id":"ef1d0e8c-7498-5a90-942a-852856ef4a64","type":"paragraph","props":{"backgroundColor":"default","textColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Remember fatigue, hand pain, appetite and worry in my own words. My medicine note records what I reported, not what caused a symptom.","styles":{}}],"children":[]}
  ],
  "properties": {"fatigue": 5, "pain": 6, "sleep_hours": 6, "appetite_loss": 2, "overall_health": 5, "medication": "letrozole 2.5 mg at 09:00"},
  "source": "app",
  "device_id": null,
  "capture_id": "af28b885-504c-4f41-a72c-0a82e82f18f5",
  "voice_conversation_id": null,
  "session_id": null,
  "operation_id": "demo-seed-emma-journal-20261023-v1",
  "context_revisions": {"578460c0-8796-4e86-94b3-424022f6259e": 4, "be00b449-8435-461b-bd33-d28957168fb9": 3, "70a2f3a4-15af-47bb-8923-a9eeaef08373": 1},
  "revision": 2,
  "created_at": "2026-10-24T14:35:45.772Z",
  "updated_at": "2026-10-24T14:37:48.755Z"
}
```

## Historical direct inputs and exact cosmetic payloads

The original direct insertion inputs had the same title, native content array, journal_date and creation operation ID as the current canonical records above. Their exact original properties are recorded below; together with the full unchanged native artifacts, this reproduces each original sanitized input object `{title,content,properties,operation_id,journal_date}`. No original_text or source field was supplied. The backend set source app and empty original_text. These internal properties are historical only:

```json
[
  {
    "operation_id": "demo-seed-emma-journal-20261014-v1",
    "journal_date": "2026-10-14",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 6,
      "pain": 7,
      "sleep_hours": 5,
      "sleep_difficulty": 6,
      "overall_health": 4,
      "medication_name": "letrozole",
      "medication_dose_mg": 2.5,
      "medication_time": "09:00"
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261015-v1",
    "journal_date": "2026-10-15",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 5,
      "pain": 4,
      "sleep_hours": 6.5,
      "nausea": 2,
      "appetite_loss": 3,
      "overall_health": 5
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261016-v1",
    "journal_date": "2026-10-16",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 7,
      "pain": 6,
      "sleep_hours": 5,
      "sleep_difficulty": 7,
      "overall_health": 3
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261017-v1",
    "journal_date": "2026-10-17",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 4,
      "pain": 5,
      "sleep_hours": 7,
      "overall_health": 6
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261018-v1",
    "journal_date": "2026-10-18",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 6,
      "pain": 8,
      "sleep_hours": 6,
      "appetite_loss": 4,
      "overall_health": 4,
      "medication_name": "letrozole",
      "medication_dose_mg": 2.5,
      "medication_time": "09:30"
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261019-v1",
    "journal_date": "2026-10-19",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 5,
      "pain": 3,
      "sleep_hours": 7,
      "nausea": 1
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261020-v1",
    "journal_date": "2026-10-20",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 7,
      "pain": 7,
      "sleep_hours": 4.5,
      "sleep_difficulty": 8,
      "nausea": 3,
      "overall_health": 3
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261021-v1",
    "journal_date": "2026-10-21",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 4,
      "pain": 4,
      "sleep_hours": 6.5,
      "appetite_loss": 1,
      "overall_health": 6,
      "medication_name": "letrozole",
      "medication_dose_mg": 2.5,
      "medication_time": "08:45"
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261022-v1",
    "journal_date": "2026-10-22",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 6,
      "pain": 5,
      "sleep_hours": 5.5,
      "sleep_difficulty": 5
    }
  },
  {
    "operation_id": "demo-seed-emma-journal-20261023-v1",
    "journal_date": "2026-10-23",
    "properties": {
      "demo_seed": true,
      "provenance": "Unvetted Synthetic",
      "demo_case": "emma-breast-cancer-history-20261014-20261023-v1",
      "demo_origin": "manual_seed",
      "fatigue": 5,
      "pain": 6,
      "sleep_hours": 6,
      "appetite_loss": 2,
      "overall_health": 5,
      "medication_name": "letrozole",
      "medication_dose_mg": 2.5,
      "medication_time": "09:00"
    }
  }
]
```

Latest cosmetic semantic PATCH payloads and durable request hashes:

```json
[
  {
    "entry_id": "f5f6e0c2-b1f4-46c1-8406-d4c24ee63c26",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-f5f6e0c2-b1f4-46c1-8406-d4c24ee63c26-v1",
      "properties": {
        "fatigue": 6,
        "pain": 7,
        "sleep_hours": 5,
        "sleep_difficulty": 6,
        "overall_health": 4,
        "medication": "letrozole 2.5 mg at 09:00"
      }
    },
    "request_hash": "bdc63aa736f702065f196df1558144f4c8d8563db07472a0f0c36b6cc35e2521",
    "receipt_id": "2253049c-a0e7-4615-94fc-1537e9bc2691"
  },
  {
    "entry_id": "fb21070c-e173-4f73-a800-fabfe53c2dd6",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-fb21070c-e173-4f73-a800-fabfe53c2dd6-v1",
      "properties": {
        "fatigue": 5,
        "pain": 4,
        "sleep_hours": 6.5,
        "nausea": 2,
        "appetite_loss": 3,
        "overall_health": 5
      }
    },
    "request_hash": "25b797aae3258833ebaf1cd6b84d6c1c978acd12fe72565949c9f31edb6aea48",
    "receipt_id": "45e7c77b-8d96-44b9-9d79-bb1245cabb25"
  },
  {
    "entry_id": "123e076f-2c11-43ef-b63d-ced654240449",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-123e076f-2c11-43ef-b63d-ced654240449-v1",
      "properties": {
        "fatigue": 7,
        "pain": 6,
        "sleep_hours": 5,
        "sleep_difficulty": 7,
        "overall_health": 3
      }
    },
    "request_hash": "688a833a845cabfc7736a49153b08312e3778b34170a9a021fd3ba23358e9c92",
    "receipt_id": "26d346b7-9f64-4acf-818c-f355324acdc8"
  },
  {
    "entry_id": "0edd64f2-d321-4560-a274-502e291dd09b",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-0edd64f2-d321-4560-a274-502e291dd09b-v1",
      "properties": {
        "fatigue": 4,
        "pain": 5,
        "sleep_hours": 7,
        "overall_health": 6
      }
    },
    "request_hash": "21442eb84e25c09872da51cab631596286e3a1af2f867a0f59d1cb2ea07f8510",
    "receipt_id": "dcac642a-63b6-4509-9763-73b1d2c94415"
  },
  {
    "entry_id": "d3c36f69-5f17-47db-a713-3051042874c8",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-d3c36f69-5f17-47db-a713-3051042874c8-v1",
      "properties": {
        "fatigue": 6,
        "pain": 8,
        "sleep_hours": 6,
        "appetite_loss": 4,
        "overall_health": 4,
        "medication": "letrozole 2.5 mg at 09:30"
      }
    },
    "request_hash": "a4066419b53c338a5d5396d008d7e06d050ccb15c6c7d694beb7cb099f8daaca",
    "receipt_id": "8dcb0450-6420-4e0f-9ce7-8c666fdbb8aa"
  },
  {
    "entry_id": "9fd60a96-f9e4-44fe-beaa-72c901141805",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-9fd60a96-f9e4-44fe-beaa-72c901141805-v1",
      "properties": {
        "fatigue": 5,
        "pain": 3,
        "sleep_hours": 7,
        "nausea": 1
      }
    },
    "request_hash": "736f92b477b79de7b8cf55f991c88cf3c4d288d9e84fa5a4211fc2bed3ac6ab7",
    "receipt_id": "527149a8-54b2-4ecc-91e1-111451a951a9"
  },
  {
    "entry_id": "daf177b7-f56c-4406-87b2-eeea47128246",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-daf177b7-f56c-4406-87b2-eeea47128246-v1",
      "properties": {
        "fatigue": 7,
        "pain": 7,
        "sleep_hours": 4.5,
        "sleep_difficulty": 8,
        "nausea": 3,
        "overall_health": 3
      }
    },
    "request_hash": "717da3618cbfd8fb0e978f85e4e01fac463b9af9f2be865862da6e6dc6ea900a",
    "receipt_id": "2a4b0163-e13c-4f04-a9de-d8d41b63fc61"
  },
  {
    "entry_id": "0889cc0a-f912-449c-a5dc-7dcfaac81c33",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-0889cc0a-f912-449c-a5dc-7dcfaac81c33-v1",
      "properties": {
        "fatigue": 4,
        "pain": 4,
        "sleep_hours": 6.5,
        "appetite_loss": 1,
        "overall_health": 6,
        "medication": "letrozole 2.5 mg at 08:45"
      }
    },
    "request_hash": "ab8eb48766613b4b658f6dc9e33d622941a6762340596db033881c4c59977e4a",
    "receipt_id": "6c3b8bc3-b24e-4a2e-b9eb-a4ac23eb3b7e"
  },
  {
    "entry_id": "500e8842-6d85-46d3-9304-ae035c0dc598",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-500e8842-6d85-46d3-9304-ae035c0dc598-v1",
      "properties": {
        "fatigue": 6,
        "pain": 5,
        "sleep_hours": 5.5,
        "sleep_difficulty": 5
      }
    },
    "request_hash": "1645d3a821fe081fa0fa675318fadfea5037e947769e31e28d7c2302b18942df",
    "receipt_id": "63595630-1afc-4137-92c4-aa336a54d0c7"
  },
  {
    "entry_id": "77dc8324-2554-4256-b8d3-b9a6b1f6ddcc",
    "payload": {
      "expected_revision": 1,
      "operation_id": "demo-journal-tidy-props-77dc8324-2554-4256-b8d3-b9a6b1f6ddcc-v1",
      "properties": {
        "fatigue": 5,
        "pain": 6,
        "sleep_hours": 6,
        "appetite_loss": 2,
        "overall_health": 5,
        "medication": "letrozole 2.5 mg at 09:00"
      }
    },
    "request_hash": "d660f27fb56b503f14a72fc6bde11dbe4adfb4f099b0bd9e88ed3a98c594d1a9",
    "receipt_id": "46ea7444-d00f-45f7-a4f2-0714e8c97bdd"
  }
]
```

At `2026-10-24T14:42:28.969Z`, each stored request hash matches the canonical fingerprint of `{kind:"journal_patch",entry_id,input:{expected_revision:1,operation_id,properties}}`. Each durable receipt result deeply equals its current complete HTTP and database entry at revision 2. The semantic payloads were recovered from preserved before/results and cryptographically checked against stored request hashes. **Raw HTTP request bytes were not retained.** This documentation worker performed no mutation replay or new API/database operation.

## Evidence files and handoff

- Original atomic evidence: `backend/.deploy/demo-journal-replacement-1792852542129/{before,planned,after,http-readback,summary}.json`.
- Cosmetic before/results: `backend/.deploy/demo-journal-tidy/{before,results}.json`.
- Final full seed and Journal readback: `backend/.deploy/demo-journal-final-rev2/http-readback.json`, captured `2026-10-24T14:40:25.733Z`.
- IDs, creation/cosmetic operation mapping and removed IDs: `backend/.deploy/demo-journal-final-rev2/metadata.json`.
- Semantic payloads, durable receipts/request hashes and full database rows: `backend/.deploy/demo-journal-final-rev2/cas-receipts-db-readback.json`, captured `2026-10-24T14:42:28.969Z`.

The private database snapshots include unrelated tables and are referenced rather than copied into this manifest. The current full fictional native artifacts, properties and operation mappings above are the durable demo manifest. The earlier prepared and sanitized hashes remain historical evidence.

The user may refresh [Kindalong Journal](https://pink-hack-journal.lovable.app/app) to inspect October 14–23. Ten fictional seeded artifacts are saved; the latest snapshot includes the later eleventh row. Today's genuine voice request remains distinct from this history. Application-agent/voice success, chart implementation, patient validation and clinical benefit are not established by these seeds. No further data write, internal-property restoration or automatic cleanup is part of this completion.
