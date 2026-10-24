# Lovable interface exploration

Three visual concepts for the existing Pink Hack app. These are illustrative image mockups, not implemented or tested frontend screens. “Journal” is a working label, not a selected product name. All logos are provisional.

Grounding: `PRD.md` and `docs/flexible-pages-journal.md` supersede older Today/Patterns designs. Preserve the existing Lovable frontend and Hono/Turso backend.

| Concept | Direction | Trade-off |
| --- | --- | --- |
| A — Warm paper | Ivory, rose, aubergine; editorial heading; journal above the open entry | Most personal; less room for long tables |
| B — Plum workspace | Dark plum sidebar; crisp neutral workspace; table beside entry | Clearest navigation; more like a productivity app |
| C — Airy sage | Pale sage, forest green, warm white; spacious split view | Calm and readable; weaker connection to the pink event identity |

## Shared behavior for implementation

- Sidebar: one fixed Journal destination plus arbitrary user-created pages and Add page.
- Journal: date, title, source, and flexible property columns. Sleep is illustrative user-selected data, never a required metric.
- Open entries and context pages use the existing standard BlockNote/shadcn editor with native block JSON persistence.
- Day plan is a heading and checkboxes inside an entry, not a separate destination or resource.
- Voice reads the person's pages and relevant journal history, and writes directly when asked. No mandatory draft review or approval flow.
- Show saved status only after backend confirmation. Show listening, stopping, saving, failure, and revision-conflict states accurately.
- At smaller widths, show journal list first and open an entry in a full-width view; collapse sidebar into a drawer. Keep microphone and stop controls reachable.
- Reuse the current authentication, API contracts, backend, and storage. Coordinate implementation with the sole existing Lovable writer.

## Review status

Logo, palette, typography, and layout are all open. Choosing one does not select the others. No remote Lovable changes have been made by this exploration.

Subsequent user choice: the original [C — Airy Sage](c-airy-sage.png) is the selected visual inspiration and favourite prototype. Carry its palette, typography, and spacious treatment into the symptom-first revision. The exact logo/name and final layout remain open.

The user subsequently requested an Airy Sage revision focused on symptom trends and a separate daily Journal tab. See [the symptom-first design](symptom-first-design.md) for the revised navigation, example chart data, and repository integration requirements. This revision supersedes the journal-first exploration for the next prototype, without changing the live application.

The latest exploration further simplifies that direction and includes desktop web and phone app screens. See [Minimal Airy Sage](minimal-sage-design.md). It uses one selected symptom chart, a compact voice action, and separate Journal navigation; the phone version uses bottom navigation instead of the desktop sidebar.

The next user-requested revision adds an All view with separate symptom lines, additional example symptoms, and three name/logo directions. See [All symptoms and identity exploration](all-symptoms-and-identity.md). Airy Sage remains the visual reference; names and logos remain unselected.

Latest navigation refinement: [Home and Journal](simple-navigation.md) replace the three primary destinations. Home opens the symptom overview. Pages is removed from primary navigation, while existing context records remain intact.

Latest visual exploration: [Calm minimal revision](calm-minimal-design.md) reduces chart saturation, removes peach highlights and duplicate headings, and simplifies the mobile symptom controls into a single selector. Web and mobile remain aligned on Home and Journal.

Latest user decision: the name is **Here With You**, with **Home / Journal / Symptom** primary navigation on both platforms. See [Here With You](here-with-you-design.md) for the revised screen roles and three separate logo explorations. This supersedes the two-destination navigation above.

The user selected **B — A listening line** as the final logo. Use the [consolidated final visual prototypes](../final/README.md) as the current design handoff; earlier images remain iteration history.

Images generated with the built-in image generation tool. Full generation prompts are saved alongside these notes.
