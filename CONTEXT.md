# Project Context

## Product

`ma-small-journal` is a Changshu mahjong scorekeeping website. The first stage is a single-device browser app built with Vite, React, and TypeScript. It should feel fast at the table and keep scoring transparent.

## Domain Language

- `Player`: one of the four people in a table.
- `Seat`: the player's east/south/west/north position in a table.
- `Round`: one recorded hand or manual score adjustment.
- `Self draw`: a win paid by all other players.
- `Discard win`: a win paid by the discarding player.
- `Exposed kong`: a visible kong paid by one payer in the current provisional rules.
- `Concealed kong`: a concealed kong paid by all other players in the current provisional rules.
- `Adjustment`: a manual score correction that does not represent a normal win.
- `Settlement`: the score delta applied to every player for a round.
- `Local review`: deterministic analysis generated from the score history; it is not an AI model call.

## Product Principles

- Keep scoring transparent: every recorded round should show how each score changed.
- Avoid hard-coding disputed local rules before they are confirmed.
- Prefer fast table-side input over complex forms.
- Treat AI as advisory only; score changes must come from explicit rules or user-confirmed records.

## Architecture Notes

- The current app stores data in browser `localStorage`.
- `src/domain/scoring.ts` owns score calculation and statistics.
- `src/domain/storage.ts` owns local persistence and import validation.
- `src/domain/insights.ts` owns deterministic local review text.
- Future multiplayer and AI features should use a backend; API keys must not be stored in the browser app.

