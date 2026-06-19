# Architecture

## Current Stage

The app is a single-device Vite + React + TypeScript frontend.

```text
Browser
├── React UI
├── TypeScript scoring domain
└── localStorage persistence
```

There is no backend in the current stage.

## Data Model

- `TableState`: one local table, including players, rules, and rounds.
- `Player`: a fixed four-player participant with a seat and editable name.
- `RuleSet`: configurable point values for provisional table rules.
- `RoundDraft`: the editable form state before a record is confirmed.
- `RoundEntry`: an immutable confirmed score record.

## Score Flow

```text
RoundDraft -> buildRound() -> RoundEntry -> totals/statistics/trend
```

The UI previews `buildRound()` before confirmation. Confirmed rounds are appended to the table state, then persisted to `localStorage`.

## Future Multiplayer Shape

Future multiplayer should preserve the same scoring domain:

```text
React UI
  -> backend room API
  -> confirmed RoundEntry events
  -> database
  -> realtime updates
```

Do not let AI or unconfirmed clients directly mutate totals. They should propose or analyze records; confirmed score events remain the source of truth.
