---
provenance: "Unvetted Synthetic"
---

# Kindalong breast cancer demo script

Selected identity: **Kindalong**, with the pink/rose theme and Held mark. Compact entry details are public at source `ef6b46766bc7b2c78d6fba2135ef30b9fddd3132`, deployment `c166ac4c-81c1-4a99-a558-bb5eacb8c06a`, as verified by the sole Lovable writer. Real October 23 captures are available for [focused title/details only](../presentation/assets/kindalong-ef6b4676-entry-details-crop.png), [desktop](../presentation/assets/kindalong-ef6b4676-entry-2026-10-23-desktop.png) and [phone](../presentation/assets/kindalong-ef6b4676-entry-2026-10-23-phone.png). The desktop frame includes lazy body loading and is not full-body-load proof; the phone frame shows loaded native text. These captures came from the first presentation candidate. Later accessibility and rating-label fixes did not change the six displayed values, so they are visual evidence rather than proof of those later controls. The presentation owner selects current app references; earlier captures remain historical.

This publication changes entry-details presentation only: friendly labels, compact read-only ratings/cards/chips and Edit details. Existing full-property-map, expected-revision, captured-operation/retry and native-body Save behavior is retained. The October 23 entry remains revision 2 with its six values unchanged, according to the writer's post-publication readback. The floating bar and raw-transcript fallback removal remain in place; transport, agent, API and stored data are unchanged. The accepted prompt remains offline, and a genuine final-artifact voice save is unverified. The existing Dashboard does not establish the pending chart or daily-rating implementation. Physical phone keyboard and microphone/provider behavior remain unverified.

Draft scenario. The case and seed data are synthetic. A spoken save becomes a demonstrated capability only after the human microphone test and canonical entry readback pass. [Current evidence](demo-validation.md) records that boundary.

## Why this matters

The event's problem is women living with the lasting effects of breast cancer treatment, managing fatigue, symptoms and everyday life between appointments. The demo makes breast cancer explicit in the person, her context, her spoken request and the saved record.

## Emma's story

Emma is a fictional composite grounded in the team's breast-cancer survivorship research, not a real patient. She has finished active hospital treatment for breast cancer and is eighteen months into ongoing prescribed hormone therapy. Joint pain, fatigue and worry compound each other. She wants to record difficult days in her own words for her next oncology appointment, while keeping everyday plans manageable.

The demo follows one morning between appointments. She describes pain and fatigue, the medicine she reports taking, and how she feels about recovery. The agent uses that speech, her saved persona/profile, context pages and tracking preferences to compose a final Journal note with a modest day plan. Speech stays working conversation context by default; the recording control must not POST a raw transcript as the entry or persist it in `original_text` by default. The final note is saved directly and remains editable in Lovable, without a required proposal, review, confirmation or check-in stage.

For this fictional case, her existing prescription is letrozole 2.5 mg once daily. This is an illustrative prescription detail, not a recommendation, an observed patient's regimen, or a claim about what caused her symptoms. The companion records self-reports and is instructed not to diagnose, assess recurrence or change treatment.

Source: [current Notion user research](https://app.notion.com/p/403e7bbddae88073929cf47b41a161d8), composite "Emma, The Compounding Burden". Her name stays Emma throughout. The medicine detail and sister call are synthetic scenario choices. No research prevalence statistic or clinical outcome is used.

## Seeded context pages

[The seed manifest](demo-seed.md) records canonical IDs, revisions, operation IDs and exact native BlockNote content. The revised case has three pages; the earlier two-page restriction is superseded by the user's breast-cancer case correction. The user has now authorized ten fictional Journal entries aligned with those pages and this presentation. This supersedes the earlier restriction reserving every Journal entry for actual app or voice input.

Ten fictional entries are saved, one for each completed UTC day from October 14 through October 23, 2026. Titles and entry text identify them as presentation seeds. They combine Emma's physical and emotional experiences, everyday priorities, modest day plans and appointment memory. Numeric values are authored fictional self-reports, not patient measurements or voice output. Today's canonical spoken request remains a separate genuine test. The backend owner used the user's explicit direct-Turso authorization to snapshot and atomically replace the existing shared demo Journal with these ten artifacts. That bounded operation superseded API-only seeding and the Journal mutation hold; voice/runtime, the three context pages, profile and other owners' records were preserved. The seed worker documents returned results only. Native content is the final artifact; `original_text` is empty. A subsequent user-authorized cosmetic update removed internal seed metadata from visible properties and combined medication fields into a readable string while retaining the fictional labels. The manifest records both original insertion and current revision-2 updates, with synthetic provenance in the document rather than extra UI columns. Exact IDs and update operations come from the backend's actual receipts, not from immutable creation IDs.

### My breast cancer recovery (demo)

> Synthetic demo page. Emma is a fictional composite, not a real patient.
>
> I have finished active hospital treatment for breast cancer. I am eighteen months into ongoing hormone therapy prescribed by my oncology team.
>
> For this fictional demo, my existing prescription is letrozole 2.5 mg once daily. Record only what I report taking; do not recommend a dose or a treatment change.
>
> Joint pain, fatigue and worry affect each other. A full night's rest does not always make the fatigue go away, and people often assume I am back to normal now that hospital treatment has ended.
>
> I want a short record of physical symptoms, feelings and everyday difficulties to read before my next oncology appointment. I do not want the companion to diagnose me or assess whether cancer has returned.

### What I want to track

> This journal follows Emma's life after breast cancer treatment.
>
> Let me describe fatigue and hand or joint pain from 0 to 10, where 0 means none and 10 means most severe; how long I slept; and any worry or mood changes in my own words.
>
> If I mention medication, record the name, dose and time exactly as I report them. Do not assume that I took it or that it caused a symptom.
>
> Keep one thing that matters to me today alongside the symptoms. Make a short note I can revisit before my oncology follow-up. Use my words and keep physical and emotional experiences together.

### What helps me

> These are Emma's personal coping preferences during breast cancer recovery, not medical advice.
>
> I prefer a quiet start and a warm shower before tackling the stairs. On a difficult morning, keep tasks short and leave room for rest.
>
> I ask my sister for help with jars and heavy shopping rather than pushing through painful hands. A short walk is optional when I feel up to it, not a task I have to complete.
>
> I like a rest after lunch and time to call my sister at three. When I feel worried, I want to note the feeling and any question for my oncology team, rather than try to solve it by changing medication.
>
> Keep today's plan to one or two priorities drawn from these preferences, and leave the rest of my journal entry intact when I make a correction.

## Optional chart conventions

The tracking page now names optional explicit numeric keys `fatigue`, `pain`, `nausea`, `appetite_loss` and `sleep_difficulty`, with severity 0 = none to 10 = most severe, higher worse. `overall_health` is a separate explicit daily rating, 1 = very poor to 10 = very good, higher better. `sleep_hours` stays uncharted. Preserve the medication note, emotions and flexible properties. Emma's request below provides fatigue, pain and sleep, and gives no overall-health rating; do not invent one.

Charts select the latest valid explicitly recorded value per key and `journal_date`, with `created_at`/ID ties, full pagination and missing-day gaps. Explicit rating Save uses the latest valid rating source entry, otherwise the latest selected-day entry. Empty today can create an ordinary current-day Daily rating after explicit Save; empty historical days are not created by that flow. The separately authorized ten-entry fictional seed may contain explicitly stated symptom values and overall-health ratings. It does not demonstrate chart implementation or clinical improvement. See [the design source rules](../design/README.md).

## Spoken request

> "I'm Emma. Since breast cancer treatment ended, the fatigue hasn't gone away. Today it's six out of ten, my hand pain is seven, and I slept five hours. I'm worried about my next oncology appointment. I took my prescribed letrozole, 2.5 milligrams, at nine this morning. I'd like enough energy to call my sister at three. Please save this in my journal and make a manageable plan using my pages."

Expected save, to be verified in the human test: one agent-composed native BlockNote entry recording fatigue 6, hand pain 7, sleep 5 hours, worry about the next oncology appointment, and the reported letrozole 2.5 mg at 09:00. Use the tracking page's explicit numeric keys for the requested metrics. The organized note preserves Emma's meaning and includes a manageable Day plan based on her preferences, such as a quiet start, optional help, rest after lunch and the three o'clock sister call. Do not copy the raw transcript into the Journal body or durable `original_text` by default. It must not invent a diagnosis, recurrence assessment or medication change. Say "saved" only after the final artifact is persisted and can be read back. A raw-transcript test row does not meet this acceptance condition.

Correction request for the same entry:

> "Change the hand pain to six. Keep the breast cancer recovery context, medication note, worry and the rest of the day plan unchanged."

## Three-minute pitch

| Time | Beat |
| --- | --- |
| 0:00-0:08 | "Breast cancer treatment can end before its effects do." |
| 0:08-0:28 | Introduce Emma as a fictional composite. Explain the physical and emotional burden between appointments. |
| 0:28-0:45 | Show the product and current real app capture. |
| 0:45-2:05 | Default: show the breast cancer recovery and coping pages, then the Journal as it currently loads. State that a page-informed spoken save remains unverified. Use the voice request and saved-entry flow only after the mic coordinator records a passing genuine run. |
| 2:05-2:20 | State exactly what was demonstrated, that the space is shared, and that there has been no patient trial. Keep device claims within its owner's actual evidence. |
| 2:20-2:40 | Propose testing the daily journaling workflow with women living with effects of breast cancer treatment. |

This matches the six-slide deck's 160-second allocation, leaving 20 seconds within the three-minute limit. It is a plan, not a measured human rehearsal. The default path does not start voice or create a substitute entry. Show the ten saved daily notes as fictional manual examples. The mic coordinator's readback at 14:48:50 UTC contains 13 entries: ten revision-2 seeds plus three later October 24 notes whose origin is unverified. Preserve all three and do not attribute them to the voice agent. The [receipt manifest](demo-seed.md) retains its valid earlier 11-entry snapshot and records both the initial replacement and revision-2 updates. A real agent-composed voice save still requires verified session linkage and the genuine spoken workflow.

Use "designed to" for voice-writing claims until the microphone test passes. The three-minute limit and the public working-app requirement come from [event context](event-context.md).

## What confirms the demo

- All three saved context pages render in [the public app](https://pink-hack-journal.lovable.app/app).
- Real speech provides working context for the agent to compose and persist one final canonical Journal entry using those pages and the saved persona/profile. Record its ID, revision, session correlation and timing; a raw-transcript POST is not a passing result.
- The entry contains both physical and emotional self-reports, plus a plan traceable to the preferences.
- Reload keeps the entry. A correction preserves unrelated content; callback retry does not duplicate it.
- Stop retires backend writing. Provider closure and backend retirement are reported separately.
- No medicine dose or clinical recommendation is generated from symptoms.

## Fallback and submission

A fallback recording must come from an actually validated run and be labelled as a recording. Without a validated voice run, show the real pages and manual editing and say voice remains unproven.

The [landing page](https://pink-hack-journal.lovable.app/) and [working app](https://pink-hack-journal.lovable.app/app) are separate checks. Check-in submission is confirmed by the user. Product name is Kindalong. Presenter and who drives the laptop remain team decisions. Team names in event context are Jonas, Klara and Chloé.
