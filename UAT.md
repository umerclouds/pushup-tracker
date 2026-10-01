# UAT Checklist — Triple-50 October Challenge Tracker

Live site and admin URLs: see `ADMIN-ACCESS.md` (private, not committed).
Admin is at `<live-url>/admin` and needs the admin token.

> **Heads-up:** the hero team total and the leaderboard show **today's reps only** —
> they visually reset each morning. Progress is shown by the small last-7-days chips under
> the team total and under each player's name; full October totals live in the player
> profile (tap a name).

## 1. Joining

- [ ] Open the link in a private/incognito window → "Triple-50 Challenge" join screen shows
      with the three 50-rep tiles.
- [ ] Enter a name and tap **Count me in** → dashboard appears, your name is on the leaderboard.
- [ ] Reload the page → still on the dashboard (no need to rejoin — identity is remembered
      per browser).
- [ ] Join from a second device/browser with a different name → both names appear for everyone.

## 2. Logging reps

- [ ] Each of the three cards (💪 Push-ups, 🦵 Squats, 🧘 Core) has its own
      **+10 / +25 / +50**, custom amount and progress bar.
- [ ] Add reps to one exercise → only that card's count/bar moves; team total updates.
- [ ] Reach 50 in an exercise → its bar turns gold, "Target hit!" note shows, and one
      target dot lights up.
- [ ] Go past 50 → count keeps climbing ("X over 💪"), bar stays full.
- [ ] Hit all three 50s → "3/3 targets — day done! 🏅".
- [ ] **Reset today (all three)** → all three counts return to 0.
- [ ] Reload the page → your numbers are still there (server-side persistence).

## 3. Leaderboard & player profiles

- [ ] Leaderboard ranks by **targets hit today** first, then total reps — someone with
      2/3 targets ranks above someone with more reps but 1/3.
- [ ] Each row shows three exercise chips (gold ✓ at 50+, teal if started, grey at 0)
      and the score as `N/3` with reps underneath; medals for the top three, "YOU" tag
      on your row.
- [ ] The hero shows team reps today, a per-exercise breakdown and a last-7-days strip.
- [ ] Tap any player row → profile modal: October calendar (gold day = all 3 targets),
      stat tiles, per-exercise totals, badges.
- [ ] Badges light up when earned (hit all 3 targets in one day → "First triple").
- [ ] Close the modal via the button, tapping outside, and the Escape key.

## 4. Admin

- [ ] `/admin` with a wrong token → "Wrong token."
- [ ] Correct token → panel unlocks (stays unlocked for the browser session).
- [ ] October summary shows team reps, full days, per-player per-exercise table.
- [ ] **Copy team update for WhatsApp** → formatted October update lands on the clipboard.
- [ ] **Rename** a member → new name shows on the leaderboard for everyone.
- [ ] **Add to day** → the amounts in the 💪/🦵/🧘 boxes are added on top of that
      member's existing counts for that date (for logging forgotten days).
- [ ] **Set day** → that member's whole day is overwritten with the three boxes (blank = 0).
- [ ] **Remove member** → first tap arms the button, second tap deletes; member disappears.
- [ ] Main page (`/`) never shows any admin controls.

## 5. Sharing

- [ ] **Share standings** → share sheet (mobile) or WhatsApp web with the standings text
      (targets + reps per player), team total and the app link.

## 6. Fresh-start checks (October cutover)

- [ ] No September members or data appear anywhere.
- [ ] The old September URL no longer loads the app.
- [ ] The old admin token no longer unlocks `/admin`.

## Found a problem?

Note what you did, what you expected, and what happened instead — screenshots help.
