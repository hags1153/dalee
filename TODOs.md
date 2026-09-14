# Dalee TODOs

## Next Formal Release

- Confirm Game Center weekly and yearly leaderboards are cumulative totals, not best single-score boards.
- Add a cumulative monthly Game Center leaderboard.
- Remove the Game Center icon/button from the Hub.
- Add the monthly leaderboard to App Store Connect/Game Center configuration.
- Create the new Game Center achievements in App Store Connect before 1.0.7 is released:
  wordle_ace, wordle_comeback, scramble_clean, ladder_short, crossword_clean, blitz_ten,
  blitz_twenty, clean_circuit, streak_3, streak_7, streak_30, and score_7000.
- Include the leaderboard changes in the next formal Apple release.
- Keep OTA active in the next release.
- Keep the in-app update link/gate active so users below the latest required release are sent to Dalee in the App Store.
- After the next release is fully implemented, update `docs/version.json` so older builds are required to update.

## Puzzle Supply

- Add offline puzzle generators for Mini Crossword, Ladder, Scramble variants, and Blitz letter sets.
- Run generated puzzles through validation before release: no duplicate daily words, all crossword cells clued, all ladder pairs reachable, enough Blitz answers, and no obscure/offensive words.
- Keep curated banks as the final shipped source of truth; generators should propose and validate candidates rather than dynamically inventing live daily puzzles.
