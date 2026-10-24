---
provenance: "Unvetted Synthetic"
owner: "Demo deck outline thread (Claude Opus), reports to Main a4366dab"
last_verified: "2026-10-24 14:35 CEST"
---

# Demo and deck outline

**Draft. This outline has not been checked against a validated candidate.** It proposes the three-minute story, slide copy, timing, speaker notes, and the evidence each claim needs. The demo/presentation worker owns [the demo script](demo-script.md), [demo validation](demo-validation.md), and the eventual `presentation/` deck. Copy and claims become final only after a candidate passes validation. Anything marked *gate* is cut or reworded if its evidence is missing. A 16:00 rewrite checkpoint is proposed only. It is not a user-set freeze and gives no permission to cut scope.

Constraints: three minutes maximum, a live demo from the submitted link, judged on impact, working demo, execution, originality, and pitch clarity ([event context](event-context.md)). Slides follow the template's six sections: title, problem, product, demo, evidence, and closing.

**Two separate deadlines.** The authorized static public landing page comes first, by the 15:00 check-in. The working app and live demo are due separately, by 16:30; the check-in link can be updated before then. The full-app requirement in G1 must not delay the static landing page.

**G3 applies to every voice-write claim.** Every line marked *(G3)* (the one-liner, the slide 1 hook, slide 3 steps 2–3 and notes, and slide 4 beats 2–4) describes product intent until all three G3 conditions pass: the corrected backend, the stop-aware client, and one genuine candidate loop. Until then, use the "intent" wording given with each line and do not perform or narrate those beats as working.

## The story in one line

> The hospital part is over. The hormone therapy and its side effects aren't. She tells the app about her morning in her own words, and it writes her journal entry and a day she can manage. *(G3; intent wording until then: "...and it is designed to write her journal entry...")*

## Persona and scenario

**Anna is a composite persona, not a real person.** She is the team's Notion research Persona 1, built from published research rather than from a patient interview or observed product use. Say "composite" out loud the first time she appears. The name is optional; drop it if the team prefers "she".

Scenario: Anna is two years into hormone therapy after breast cancer. Her hands and knees are stiffest in the morning, and she is often tired. Her surgery and other hospital treatment are behind her, but the daily hormone tablets continue for years. People around her assume that the end of hospital treatment means she is fine. Between appointments, she has no easy record of her bad days in her own words. Typing with stiff hands is a chore, and fixed forms don't ask about what matters to her.

The demo shows one morning. Her granddaughter is coming at three o'clock, and Anna wants to have energy left for her.

Product hypothesis, not a measured outcome: if writing it down is as easy as talking, and the plan is built from what she already knows helps, she can keep the record and get through the day. Emotional journaling and other needs remain valid uses of the same journal. This scenario is simply the clearest one to demo.

## Timing

| Time | Slide | Beat |
| --- | --- | --- |
| 0:00–0:10 | 1 Title | Hook |
| 0:10–0:35 | 2 Problem | Anna, labeled as a composite |
| 0:35–0:55 | 3 Product | Her pages → she talks → it writes |
| 0:55–2:15 | 4 Live demo | Four beats in the app (80 s) |
| 2:15–2:35 | 5 What's real | Evidence and honest gaps |
| 2:35–3:00 | 6 Next | Next step and closing line |

The demo slot has about 20 seconds of slack for voice latency. Rehearsal must measure the actual time from the spoken request to the saved row. If it is more than about 25 seconds, shorten slide 3 to a single sentence (*gate G7*).

## Slides

### 1. Title (0:00–0:10)

**On screen**

- [Product name, to be decided]
- Your words. Your day. For life on hormone therapy after breast cancer.
- [confirmed team names]

**Say**

> "The hospital part is over. The side effects aren't. We built a voice journal that turns a hard morning into a day you can manage." *(G3)*

Intent wording until G3 passes: "We're building a voice journal designed to turn a hard morning into a day you can manage."

### 2. Problem (0:10–0:35)

**On screen**

- The hospital part is over. The side effects aren't.
- Hormone therapy continues for years and can mean stiff joints and fatigue.
- Between appointments, there is no easy record in her own words.
- Everyone assumes she's fine.
- Footer: *Anna is a composite persona from published research, not a real patient.*

**Say**

> "Meet Anna. She's a composite from our research, not a real patient. Two years into hormone therapy after breast cancer, her hands are stiffest in the morning. Typing is a chore, the forms ask the wrong questions, and by her next appointment, the bad weeks blur together. Everyone thinks she's fine because the hospital part is over, but she still takes hormone therapy every day."

No statistics. The supported framing is that joint pain from aromatase inhibitors is a frequent side effect that contributes to stopping treatment (Kim 2024 abstract, [citation check](demo-validation.md#citation-check)). If asked, quote it in those words. Do not use "1 in 5 quit".

### 3. Product (0:35–0:55)

**On screen**

1. **Her pages.** She writes what she wants to track and what helps her, once, in her own words.
2. **She talks.** A morning check-in, by voice. *(G3)*
3. **It writes.** A Journal entry with her own fields and a gentle day plan, as a page she can edit. *(G3)*
- Small print: *Organizes what she says. Instructed not to diagnose or advise on treatment.* (G11)

**Say**

> "Anna keeps a couple of pages in her own words: what she wants to track, and what helps her on hard days. Then each morning she just talks. The assistant reads her pages, listens, and writes the entry for her: her fields, her words, and a plan built from what she already knows helps." *(G3)*

Intent wording until G3 passes: "...the assistant is designed to read her pages, listen, and write the entry for her."

### 4. Live demo (0:55–2:15)

**On screen:** "Live: one morning" with the submitted link, then switch to the app.

| Time | Beat | Do | Say |
| --- | --- | --- | --- |
| 0:55–1:05 | Her context | Open the synthetic page "What helps me (demo)" | "She wrote this once: warm shower, a walk before lunch, rest after lunch, ask for help with jars." |
| 1:05–1:40 | She talks | Press Talk and say the [spoken request](demo-script.md#spoken-request). Wait for the assistant to say it saved. | Say nothing while it works, or "It's reading her pages and writing the entry." |
| 1:40–1:55 | It wrote | Open Journal. Point to today's new row and its fields, such as stiffness 7, energy low, and sleep poor. | "Today's entry, with the fields she chose. Nobody built a symptom form." |
| 1:55–2:15 | She owns it | Open the entry. Point to her words and the Day plan items taken from her page. Tick one checkbox. | "Her words, and a plan from her own list, with the afternoon kept free for three o'clock. It's just a page, so she can change anything." |

Beats 2–4 (She talks, It wrote, She owns it) are *(G3)*. Do not perform them live until G3 passes; use the fallback below. Only say the fields and plan items that the rehearsal entry actually contains (*gate G4*).

**Atech variant (gate G8).** Press Anna's hold-to-talk button on the Atech device instead of the browser Talk button, but only if the hardware owner has verified device speech → saved Journal on the candidate. Otherwise, keep the browser and show the device on slide 5 as built but not yet connected.

### 5. What's real (2:15–2:35)

**On screen** (each line only if its gate passed)

- Live: voice → saved Journal entry → editable page, on the link you can open. (G1–G3)
- Real storage. The assistant says "saved" only after the database confirms it. A retry doesn't duplicate the entry, and a stale edit doesn't overwrite a newer one. (G5, G6)
- Atech: *pick one line.* "Talk from a button on the device." (G8 passed) / "Device mic and speaker work. Connecting them to the journal is next." (local capture only)
- Not yet: tested with patients; personal accounts. This is one shared demo space.

**Say**

Say this only if G1–G3 passed; otherwise say exactly which parts were live.

> "Everything you saw was live: real voice, real storage, a real editable page. What we haven't done is put it in front of women living with this. That's next."

### 6. Next (2:35–3:00)

**On screen**

- Proposed next step: test the morning check-in with women on hormone therapy after breast cancer.
- Then: personal accounts and privacy, so it's hers alone.
- [If G8 has not passed: a hold-to-talk Atech device by the bed.]
- Closing line: *Her words. Her day.*

**Say**

> "What we'd like to do next is sit with women on hormone therapy and let them try this on their own mornings. The same journal works for whatever they need to say, whether that's symptoms, feelings, or plans. The hospital part is over. Her day still deserves a plan. Thank you."

The next step is a proposal, not a committed team plan. Its shape (who, how many, how long) is a team decision. Do not name partners or numbers that the team hasn't agreed.

## Evidence gates

| Gate | Claim | Evidence needed before the pitch uses it | State at 14:35 | Owner |
| --- | --- | --- | --- | --- |
| G1 | Judges can open the demo link | The submitted URL opens the app without a Lovable login, checked from a signed-out browser | Preview requires Lovable login. Static landing publication is authorized and comes first (15:00); the working app link is a separate 16:30 requirement and must not delay the landing. | Lovable writer, Main |
| G2 | Her context pages exist | Exactly two labeled synthetic pages, with page IDs recorded in [demo validation](demo-validation.md) | Space is empty; seeding waits for op6 | Demo worker |
| G3 | Voice writes the entry (every voice-write claim) | Corrected backend deployment (durable replay and Stop), stop-aware client in Lovable, and one coordinated rehearsal on the candidate. Record the entry ID, revision, and transcript. | Not established. A browser attempt timed out during ICE before the session POST, so there is no provider proof. Earlier synthetic PCM proof was on a different build. | Backend owner, Lovable writer, Demo worker |
| G4 | Fields and plan come from her pages | The rehearsal entry's properties match "What I want to track", and its plan items trace to "What helps me" | Not run | Demo worker |
| G5 | "Saved" only after storage confirms | Voice prompt rule in `voice/prompts.ts`, plus the rehearsal transcript showing confirmation after the row exists | Prompt rule exists; runtime not observed | Demo worker |
| G6 | Retries don't duplicate; stale edits conflict | REST: verified at `e2d33ad`. Voice callback retry: the fixed deployment must show one entry. | REST verified. Voice duplicate reproduced and being fixed. | Backend owner |
| G7 | The demo fits in 80 seconds | Measured time from request to saved row in rehearsal | Not measured | Demo worker |
| G8 | Atech in the live loop | Hardware owner verifies device speech → saved Journal on the candidate | Local mic capture and replay verified; WiFi firmware running; not end to end | Atech owner |
| G9 | Editing works | Op6 no-login save, reload, and retry E2E evidence at a pinned ref | Op6 pinned at `f648b42335d396fc58613848c26bf2531e7a63eb` and independently inspected. The owner reports live REST checks and 93 tests passing; this thread did not rerun them. | Lovable writer |
| G10 | Fallback exists | Screen recording of the validated path on the candidate | None | Demo worker |
| G11 | Instructed not to diagnose | Say "it's instructed not to diagnose or advise on treatment" (`voice/prompts.ts`), not "it never does" | Instruction exists | — |

Hard rule: if G3 has not passed, slide 5's first line and the "everything was live" line are cut, and every *(G3)* line uses its intent wording. Fallback depends on why voice isn't working live:

- **Transient failure after validation.** G3 passed and G10 holds an actual recording of that validated run. Say the live call failed just now, play the recording, and label it as a recording of the validated run.
- **Path never validated.** G3 never passed, so no validated recording exists. Say that live voice writing is not working end to end yet, and show only what was validated, such as the context pages and editing entries (G2, G9). Do not play or describe any recording as proof.

A recording never stands in for validation that didn't happen.

## Suggested changes to the demo script

These are for the demo/presentation worker to accept or reject in [demo-script.md](demo-script.md). This thread has not edited that file.

1. Open with "The hospital part is over. The side effects aren't." (consistent with ongoing hormone therapy) and fill in the "Three-minute run" section from the timing table above.
2. Optionally give the composite persona a name ("Anna"), labeled as a composite out loud and on the slide.
3. Add a manual edit beat: tick one Day plan checkbox. It shows the entry is her own page by reusing the editor path (G9), without a second live voice call.
4. Add the Atech rule: the device appears in the live loop only if G8 passes. Otherwise it is presented as built hardware with local audio, and connecting it is next.
5. Fallback: follow the hard rule above, which separates a transient failure after validation from a path that was never validated. A saved rehearsal entry may be opened only if it came from the validated run, labeled as from rehearsal. Never present a rehearsal entry as live.
6. Pre-demo check at 16:15: the demo space is public and shared, so visitors may have added entries or edited pages. Check the Journal and the two context pages before going on. Whether to keep rehearsal entries is the demo owner's call; do not delete records without that call.
7. Keep the deadlines separate. The static landing link can serve the 15:00 check-in. By 16:30, the submitted link must reach the working app for the live demo, and the check-in link is updated if it changes. G1 must not delay the landing page.

## Open decisions

- Product name (slide 1, check-in form).
- Confirmed team names (slide 1).
- Presenter, and who drives the laptop.
- Next-step shape for slide 6 (who, how many, how long). Keep the duration neutral unless the team agrees one.
- Whether the landing page appears in the deck. If it does, use a real screenshot and a clickable URL, per the [presentation guide](../.agents/skills/hackathon/references/presentation.md).
