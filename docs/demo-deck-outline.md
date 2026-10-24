---
provenance: "Unvetted Synthetic"
---

# Kindalong breast cancer demo and deck outline

Selected identity: **Kindalong**, previous pink/rose theme. Kindalong is published at source `a3fc982c`, deployment `bc2ab442`. Use the real [landing](../presentation/assets/kindalong-landing-a3fc982c-desktop.png) and [app screenshot](../presentation/assets/kindalong-app-a3fc982c.webp). Old Here With You/Sage screenshots remain historical evidence.

Draft. Grounded in the event's breast-cancer problem and current composite Emma. A finished deck must use the verified candidate and the human microphone-test result. [Demo script](demo-script.md) is the canonical case and spoken request; [validation](demo-validation.md) records evidence.

## Story in one line

Women living with the lasting effects of breast cancer treatment need a place for physical symptoms, feelings and everyday plans between appointments. Our companion is designed to turn Emma's spoken account into an editable Journal entry and a manageable day plan.

## Persona

Emma is a fictional composite grounded in the team's breast-cancer survivorship research, not a real patient. She has finished active hospital treatment for breast cancer and is eighteen months into ongoing prescribed hormone therapy. Joint pain, fatigue and worry compound each other. She wants to record difficult days in her own words for her next oncology appointment, while keeping everyday plans manageable.

The demo follows one morning between appointments. She describes pain and fatigue, the medicine she reports taking, and how she feels about recovery. She asks the companion to save that account and organize a modest day plan using her own preferences. The saved entry remains an editable page in Lovable.

For this fictional case, her existing prescription is letrozole 2.5 mg once daily. This is an illustrative prescription detail, not a recommendation, an observed patient's regimen, or a claim about what caused her symptoms. The companion records self-reports and is instructed not to diagnose, assess recurrence or change treatment.

Use Emma consistently. Present the case as a fictional composite. Patient testimony, prevalence statistics and clinical outcomes require evidence beyond this demo.

## Six slides in three minutes

| Time | Slide | On screen | Speaker notes |
| --- | --- | --- | --- |
| 0:00-0:10 | 1. Title | Kindalong. "Breast cancer treatment can end before its effects do." Jonas, Klara, Chloé. | This is a companion for life after breast cancer treatment. |
| 0:10-0:35 | 2. Problem | Breast cancer recovery between appointments: joint pain, fatigue and worry compound each other. "Emma is a fictional composite." | Explain that finishing hospital treatment does not end the physical and emotional burden. Difficult days are easy to forget before a follow-up. |
| 0:35-0:55 | 3. Product | Her breast cancer context; her tracking choices; her coping preferences. | She chooses what matters. The companion is designed to organize her words and a small plan. It is instructed not to diagnose or change treatment. |
| 0:55-2:15 | 4. Demo | The public app, three real context pages and one new saved entry. | Give the exact request in the script. Show symptoms, worry and medication self-report together, then her editable Day plan. This voice beat needs the real-test gate. |
| 2:15-2:35 | 5. Evidence | Only demonstrated capabilities. Shared synthetic demo; no patient trial. | Explain what actually saved and reloaded. Atech is a live input only if device speech to Journal is verified. |
| 2:35-3:00 | 6. Next | Proposed testing with women living with effects of breast cancer treatment; personal accounts and privacy. | Close with "Her words. Her recovery. Her day." The study shape is a proposal, not a commitment. |

## Demo beats

1. Open "My breast cancer recovery (demo)" and briefly show the other two pages.
2. Click Start voice in the corrected app and speak the [canonical request](demo-script.md#spoken-request).
3. Open the newly saved Journal entry. Check fatigue, hand pain, sleep, worry and the reported prescription; verify its Day plan came from the preferences.
4. Reload. If doing a correction test, change hand pain to six and verify unrelated content remains.
5. Stop voice and verify backend retirement separately from provider finalization.

Do not seed Journal results or present manually inserted notes as voice output. Atech only replaces the browser input after real hardware speech to saved Journal passes.

## Evidence gates

| Gate | Evidence needed | Current boundary |
| --- | --- | --- |
| G1 Public app | Anonymous access and API connectivity | Landing and public app access/CORS verified. |
| G2 Breast cancer case | Three retained synthetic pages and exact readback | Revised seed is tracked in demo-seed.md; previous two-page case is superseded. |
| G3 Voice write | Corrected frontend plus one genuine spoken run with saved entry/readback | Frontend is published for initial testing; real spoken result remains unverified until the mic coordinator records it. |
| G4 Context use | Physical and emotional fields plus a plan traceable to Emma's pages | To be checked in the genuine run. |
| G5 Saved means persisted | Canonical stored ID/revision agrees with the spoken save confirmation | To be checked in the genuine run. |
| G6 Retry and Stop | No duplicate callback write, unrelated-content preservation, backend retirement | Backend fixes and 64 tests reported verified; spoken-app evidence remains distinct. |
| G7 Timing | Request to saved entry measured within the demo slot | Not measured. |
| G8 Atech | Device speech to saved Journal | Claim only the hardware owner's actual evidence. |
| G9 Editing | Native edit, save and reload | Prior UI checks passed; the corrected public app remains the test target. |
| G10 Fallback | Recording of a validated run | No validated recording established. |

All voice-write copy uses "designed to" until G3 passes. A transient live failure after validation may use a labelled recording of that validated run. An unvalidated path has no voice fallback proof.

## Event fit and open decisions

The pitch addresses the exact event problem: women living with lasting effects of breast cancer treatment between appointments. The demo shows a record of physical and emotional experiences and practical daily priorities. It claims neither clinical monitoring nor automatic support routing.

Check-in deadline is 15:00 and working demo deadline 16:30, Europe/Copenhagen. The pitch lasts at most three minutes. The static landing must not be represented as a working voice demo.

Product name is Kindalong. Confirm presenter, laptop driver, submission status and the shape of any proposed user test. Existing comments in Notion remain team review inputs.
