---
provenance: "Unvetted Synthetic"
---

# Today-first companion design

Design direction and written spec reviewed and accepted by the user on 2026-10-24. Remaining choices are explicitly listed below. No app behavior is claimed as implemented or tested. User review does not change the artifact's provenance grade.

## Purpose and confirmed decisions

Help a person plan today around fatigue and personal priorities, while retaining their words and building a useful history. The event notes propose people living with physical and mental effects after cancer treatment as the audience. The precise audience and user story still need validation.

The user selected a Today-first experience with Journal, Patterns, and About me supporting it. Our own Lovable app and backend are the sole output sink. Notion inspires writing and editable structure; Apple Health inspires readable charts and history navigation. Neither integration is required by this direction. Microphone and speaker location remains independent of the app's storage and display.

References: [event context](../../event-context.md), [platform and voice research](../../gpt_live_atech_lovable_context.md), and the [interactive design mockup](2026-10-24-today-first-companion-preview.html). The mockup contains illustrative data and local interactions only. It is not a running app or an approved substitute for a real demo.

Parallel project work has now added [the PRD](../../../PRD.md) and [shared application contracts](../../app-structure.md). Those documents record personal and medical context pages, shared app/device operations, and an Atech voice outcome. This design defines the approved experience and does not remove those requirements. Its four navigation destinations can group additional routes, such as personal and medical context within About me and assistant controls within Today.

## Product loop

1. The person records ongoing needs and preferences in About me.
2. They write a short check-in, or eventually provide one through a verified voice/device client.
3. They review optional structured observations and identify what matters today.
4. The app proposes a flexible day plan using confirmed observations, current priorities, and personal context.
5. The person changes, accepts, or rejects the draft. The app stores their chosen plan alongside the journal entry.
6. Over time, they inspect observations in Patterns and open the source entry for context.

For a first-use path, typed input must support this entire loop. Voice is an additional input route, not a prerequisite for writing, planning, or persistence.

## Screens

### Today

Lead with the current local date and a useful action. Before a check-in, offer a short writing prompt: "How are you, and what matters today?" Show editable priorities and optional observations without requiring a long questionnaire. If personal context is empty, allow the person to continue and add it later.

After review, show a draft plan with one or two user-chosen priorities, smaller alternatives where useful, and flexible space for rest. Use the person's stated needs rather than inferred activity limits. Avoid fixed appointment times unless the person supplied them. A priority can be kept, made smaller, deferred, edited, or removed. "Use this plan" persists the accepted version; acceptance is separate from completing its activities.

Display what informed a suggestion, such as "You said a short visit matters today." The person can inspect and edit that source. A new check-in can offer a revised draft but must not overwrite an accepted plan without their choice.

### Journal

Group entries by local calendar date, with multiple entries per day allowed. Each entry retains original writing, reviewed observations, and its associated plan. Offer an optional evening reflection such as "What worked for you today?" Use a comfortable reading column, headings, paragraphs, and simple lists. A complete Notion block editor is not needed for this first path.

Editing an observation updates the relevant chart. Editing writing preserves it as the person's content and marks prior AI suggestions as needing review; it does not silently recalculate confirmed observations. Empty journal days are ordinary gaps, not missed goals.

### Patterns

Start with a weekly view of explicitly reported energy. The shared contracts propose a labeled 1-to-5 self-rating; capture and charts must use the same labels and scale. The mockup's three categories illustrate the layout only and must not become a competing persisted scale. These are personal reports, not a clinical scale. Sleep duration and symptom history can be added when explicitly recorded; they remain separate measures.

Show coverage, such as "4 of 7 days recorded." Plot observations with their dates and times; do not invent daily averages when there are multiple check-ins. Tapping a point opens its source entry and permits correction. Do not interpolate missing values or claim that a habit caused a symptom.

With no observations, invite a first check-in. With one, show that observation without asserting a trend. With gaps, leave gaps visible. Provide readable values and a text list alongside the chart for accessibility.

### About me

Use editable writing sections for "What matters to me," "What helps on a low-energy day," and "What I want you to remember." Show when context was last updated. The person can review or remove any context. A daily check-in must not automatically become a permanent personal fact.

Group the PRD's personal-needs and medical-needs pages here. Medical context must distinguish self-reports from care-team instructions and respect the shared contract's choice about using it in voice conversations.

## Visual and interaction direction

Use a calm, warm background, spacious writing areas, rounded metric cards, and clear typography. The preview explores warm ivory `#f7f5f1`, dark plum text `#292638`, a muted purple primary action `#625071`, lavender suggestion areas, and sage rest areas. These are proposed palette roles, not an approved brand identity. The product name remains open.

Use four plainly labeled navigation destinations on mobile and an equivalent desktop layout. Keep one dominant action per stage. Avoid streaks, recovery percentages, compulsory completion rings, and productivity language that treats rest as failure. Prefer concrete copy such as "Leave for later" and "Make it smaller."

For implementation, use the project's actual component system; the hackathon default is shadcn/ui if none exists. Require keyboard operation, visible focus, labeled inputs, comfortable touch targets, text contrast of at least 4.5:1, and information that does not depend on color. Respect reduced motion. Chart selection must work with keyboard and touch.

## Data model and ownership

Keep four logical record types with separate purposes. These describe ownership and relationships, not four mandatory physical tables; map them to the shared contracts before implementing storage:

- `personal_context`: user ownership, editable sections, revision, creation/update timestamps.
- `journal_entry`: ID, user ownership, original text, local date/timezone, UTC capture timestamp, input source, optional source/session ID, revision, creation/update timestamps.
- `observation`: ID, entry ID, metric, value, unit where relevant, observed timestamp, confirmation state, and source excerpt or explicit-input reference. Unconfirmed extraction suggestions never drive charts.
- `day_plan`: ID, user ownership, local date, source entry IDs, context revision, editable items, draft/accepted state, and timestamps. Each item has a stable ID, text, optional smaller alternative, user-chosen priority, and active/deferred/removed state.

For the first build, plan items may be stored as a structured array on the plan. Activity completion is separate from plan acceptance and is not required for the initial loop. Splitting items into their own table is appropriate if later querying or collaboration needs it.

The current shared contracts choose separate observations and day-plan records. Implement their source and confirmation relationships through the shared API. This document does not introduce a second API.

Use stable capture/request IDs to avoid duplicate journal entries on retry. Confirmed observations retain their source entry. Deleting an entry removes its observations from charts and marks plans that relied on it for review. Never silently rewrite an accepted plan. Every read and write is scoped to its authenticated owner; privileged credentials remain server-side.

## AI and backend boundaries

The backend operations are saving context, saving/reviewing a check-in, generating a plan draft, accepting/editing a plan, and reading journal or pattern data. Both typed and voice clients use these same operations. Subsequent backend coordination selects the local Better-T-Stack backend with Lovable as external frontend. Its owner is implementing the shared API and storage. The [implementation plan](../../implementation-plan.md) reflects this runtime choice; Lovable Cloud is not a second source of truth.

AI extraction produces suggestions from a specific entry. Preserve the original text and allow correction or rejection. Missing sleep duration remains missing; it is not guessed from "slept badly." Plan generation uses confirmed observations and user-authored context. It produces an editable draft, not a diagnosis, treatment recommendation, readiness score, or medication change.

GPT-Live may provide the conversational input experience. Session creation and API secrets belong on the trusted backend. The application still executes its own persistence tools, even with OpenAI Responses delegation. Device audio streaming or a persistent Live sideband has separate runtime requirements; the approved screen design does not settle them.

## Save, error, and recovery behavior

Distinguish unsaved, saving, saved, and failed states. Keep a draft available when a request fails and offer retry. Do not show "Saved" before backend confirmation. On revisiting the page, retrieve the persisted entry and plan rather than relying on browser memory.

If extraction or plan generation fails, retain the writing and permit manual observations and a manually edited plan. If a save succeeds but AI fails afterward, report these states separately. Handle outdated revisions by retaining local edits and offering refresh/review instead of replacing another version silently.

Transcript and raw-audio retention needs an explicit decision. Saving a journal entry does not automatically require saving the audio.

## First demo and acceptance checks

The proposed three-minute demo introduces the user and problem, performs a real check-in, corrects an extracted observation, makes a priority smaller, saves the plan, and reopens the stored journal entry. Show history and chart evidence only from actual entries or clearly labeled, explicitly approved demonstration fixtures. Include Atech or voice only when the actual integration is demonstrated.

Verify these behaviors in the real app before claiming the workflow works:

1. A new user can finish the typed workflow without historical data or personal context.
2. Original text survives extraction, observation correction, plan editing, and reload.
3. Only confirmed observations appear in Patterns; every point opens the correct source.
4. Missing observations remain missing, including when an entry describes poor sleep without a duration.
5. Duplicate retries do not create duplicate entries; failed saves retain the draft.
6. A revised check-in does not overwrite an accepted plan or ongoing personal context.
7. Another authenticated user cannot read or modify the first user's records.
8. The workflow works at mobile width and with keyboard navigation.

## Open decisions and delivery boundary

The user has approved the Today-first direction, supporting screens, and written spec. Product name, exact audience, build-project selection, authentication approach, final metric labels, Atech audio transport and module inventory, and provider retention remain open. Testing is authorized in Lovable workspace `lM5BSCDhedvBnbbUoDgS`; project membership still needs verification. The PRD records Atech microphone/speaker voice as a requested outcome; its laptop bridge remains proposed. The source's "Mediation tracker" wording is unresolved and creates no feature requirement here.

This first design covers personal and medical context, daily writing, reviewed observations, flexible planning, and evidence-linked charts. HealthKit integration, Notion persistence, clinical scoring, medication management, and a generic workspace builder are not requirements of the approved direction. Hardware and voice can advance independently against the PRD once their actual interfaces are confirmed.

Event deadlines are 15:00 check-in and 16:30 working demo on 2026-10-24, treated as Europe/Copenhagen in [status](../../../status.md). No implementation, deployed demo, or scope-cut decision is established by this document.
