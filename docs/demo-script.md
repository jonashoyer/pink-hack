---
provenance: "Unvetted Synthetic"
---

# Kindalong breast cancer demo script

Selected identity: **Kindalong**, with the previous pink/rose theme for Lovable and presentation. The sole Lovable writer published source `a3fc982c`, deployment `bc2ab442`. The presentation uses the real [Kindalong landing](../presentation/assets/kindalong-landing-a3fc982c-desktop.png) and [app screenshot](../presentation/assets/kindalong-app-a3fc982c.webp).

Draft scenario. The case and seed data are synthetic. A spoken save becomes a demonstrated capability only after the human microphone test and canonical entry readback pass. [Current evidence](demo-validation.md) records that boundary.

## Why this matters

The event's problem is women living with the lasting effects of breast cancer treatment, managing fatigue, symptoms and everyday life between appointments. The demo makes breast cancer explicit in the person, her context, her spoken request and the saved record.

## Emma's story

Emma is a fictional composite grounded in the team's breast-cancer survivorship research, not a real patient. She has finished active hospital treatment for breast cancer and is eighteen months into ongoing prescribed hormone therapy. Joint pain, fatigue and worry compound each other. She wants to record difficult days in her own words for her next oncology appointment, while keeping everyday plans manageable.

The demo follows one morning between appointments. She describes pain and fatigue, the medicine she reports taking, and how she feels about recovery. She asks the companion to save that account and organize a modest day plan using her own preferences. The saved entry remains an editable page in Lovable.

For this fictional case, her existing prescription is letrozole 2.5 mg once daily. This is an illustrative prescription detail, not a recommendation, an observed patient's regimen, or a claim about what caused her symptoms. The companion records self-reports and is instructed not to diagnose, assess recurrence or change treatment.

Source: [current Notion user research](https://app.notion.com/p/403e7bbddae88073929cf47b41a161d8), composite "Emma, The Compounding Burden". Her name stays Emma throughout. The medicine detail and sister call are synthetic scenario choices. No research prevalence statistic or clinical outcome is used.

## Seeded context pages

[The seed manifest](demo-seed.md) records canonical IDs, revisions, operation IDs and exact native BlockNote content. The revised case has three pages; the earlier two-page restriction is superseded by the user's breast-cancer case correction. Journal entries remain reserved for actual app or voice input.

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

### What I want to track (demo)

> Synthetic demo page. This journal follows Emma's life after breast cancer treatment.
>
> Let me describe fatigue and hand or joint pain from 0 to 10, where 0 means none and 10 means most severe; how long I slept; and any worry or mood changes in my own words.
>
> If I mention medication, record the name, dose and time exactly as I report them. Do not assume that I took it or that it caused a symptom.
>
> Keep one thing that matters to me today alongside the symptoms. Make a short note I can revisit before my oncology follow-up. Use my words and keep physical and emotional experiences together.

### What helps me (demo)

> Synthetic demo page. These are Emma's personal coping preferences during breast cancer recovery, not medical advice.
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

Charts select the latest valid explicitly recorded value per key and `journal_date`, with `created_at`/ID ties, full pagination and missing-day gaps. Explicit rating Save uses the latest valid rating source entry, otherwise the latest selected-day entry. Empty today can create an ordinary current-day Daily rating after explicit Save; empty historical days are not created. No illustrative history or rating is seeded. See [the design source rules](../design/README.md).

## Spoken request

> "I'm Emma. Since breast cancer treatment ended, the fatigue hasn't gone away. Today it's six out of ten, my hand pain is seven, and I slept five hours. I'm worried about my next oncology appointment. I took my prescribed letrozole, 2.5 milligrams, at nine this morning. I'd like enough energy to call my sister at three. Please save this in my journal and make a manageable plan using my pages."

Expected save, to be verified in the human test: one new entry recording fatigue 6, hand pain 7, sleep 5 hours, worry about the next oncology appointment, and the reported letrozole 2.5 mg at 09:00. Flexible property names are acceptable. Its body preserves Emma's words and includes a Day plan based on her preferences, such as a quiet start, optional help, rest after lunch and the three o'clock sister call. It must not invent a diagnosis, recurrence assessment or medication change.

Correction request for the same entry:

> "Change the hand pain to six. Keep the breast cancer recovery context, medication note, worry and the rest of the day plan unchanged."

## Three-minute pitch

| Time | Beat |
| --- | --- |
| 0:00-0:10 | "Breast cancer treatment can end before its effects do." |
| 0:10-0:35 | Introduce Emma as a fictional composite. Explain the physical and emotional burden between appointments. |
| 0:35-0:55 | Show her breast cancer recovery page, tracking choices and personal coping preferences. |
| 0:55-1:45 | Start voice and give the request above only when the corrected app is ready for the coordinated test. |
| 1:45-2:05 | Show the new saved entry, medication self-report and Day plan; reload it. A prior rehearsal entry must be labelled as such. |
| 2:05-2:15 | Show Atech only to the extent its owner has verified real device speech to Journal. |
| 2:15-2:35 | State what was demonstrated, that the space is shared, and that there has been no patient trial. |
| 2:35-3:00 | Propose testing the daily journaling workflow with women living with effects of breast cancer treatment. |

Use "designed to" for voice-writing claims until the microphone test passes. The three-minute limit and the public working-app requirement come from [event context](event-context.md).

## What confirms the demo

- All three saved context pages render in [the public app](https://pink-hack-journal.lovable.app/app).
- Real speech creates one canonical Journal entry using those pages. Record its ID, revision, transcript and timing.
- The entry contains both physical and emotional self-reports, plus a plan traceable to the preferences.
- Reload keeps the entry. A correction preserves unrelated content; callback retry does not duplicate it.
- Stop retires backend writing. Provider closure and backend retirement are reported separately.
- No medicine dose or clinical recommendation is generated from symptoms.

## Fallback and submission

A fallback recording must come from an actually validated run and be labelled as a recording. Without a validated voice run, show the real pages and manual editing and say voice remains unproven.

The [landing page](https://pink-hack-journal.lovable.app/) and [working app](https://pink-hack-journal.lovable.app/app) are separate checks. Submission status is unknown. Product name is Kindalong. Presenter and who drives the laptop remain team decisions. Team names in event context are Jonas, Klara and Chloé.
