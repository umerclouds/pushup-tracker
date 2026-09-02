# UAT Checklist — Team Push-Up Tracker

Live site: https://pushup-tracker-production-bfd6.up.railway.app
Admin: https://pushup-tracker-production-bfd6.up.railway.app/admin (needs the admin token)

> **Heads-up:** the hero team total and the leaderboard show **today's push-ups only** —
> they visually reset each morning. Progress is shown by the small last-7-days chips under
> the team total and under each player's name; full September totals live in the player
> profile (tap a name).

## 1. Joining

- [ ] Open the link in a private/incognito window → "Join the challenge" screen shows.
- [ ] Enter a name and tap **Count me in** → dashboard appears, your name is on the leaderboard.
- [ ] Reload the page → still on the dashboard (no need to rejoin — identity is remembered
      per browser).
- [ ] Join from a second device/browser with a different name → both names appear for everyone.

## 2. Logging push-ups

- [ ] Tap **+10 / +20 / +25 / +50** → "Your day" count, progress bar and team total update.
- [ ] Add a custom amount → same.
- [ ] Reach 100 in a day → bar turns gold, "Target smashed!" note shows.
- [ ] **Reset today** → today's count returns to 0.
- [ ] Reload the page → your numbers are still there (server-side persistence).

## 3. Leaderboard & player profiles

- [ ] Leaderboard sorts by **today's** count (highest first), medals for top three, "YOU" tag on your row.
- [ ] Each row shows a small last-7-days strip: teal chips for 1–99 rep days, gold for 100+, dots for 0.
- [ ] The hero team total counts today only, with the team's last-7-days strip underneath.
- [ ] Tap any player row → profile modal opens: September calendar, stat tiles, badges.
- [ ] Days with 1–99 reps show teal, days with 100+ show gold in the calendar.
- [ ] Badges light up when earned (log 100+ in one September day → "First ton").
- [ ] Close the modal via the button, tapping outside, and the Escape key.

## 4. Fundraising

- [ ] With no figures set, the fundraising card is hidden on the dashboard.
- [ ] Admin → set a target and raised amount → card appears with a pink progress bar.
- [ ] Raised ≥ target → "Target smashed" note.
- [ ] **Donate** button opens the CRUK fundraising page.

## 5. Admin

- [ ] `/admin` with a wrong token → "Wrong token."
- [ ] Correct token → panel unlocks (stays unlocked for the browser session).
- [ ] **Rename** a member → new name shows on the leaderboard for everyone.
- [ ] **Set day** → that member's count for that date is overwritten (not added).
- [ ] **Remove member** → first tap arms the button, second tap deletes; member disappears.
- [ ] Main page (`/`) never shows any admin controls.

## 6. Sharing

- [ ] **Share standings** → share sheet (mobile) or WhatsApp web with the standings text,
      team total, link and donate URL.

## Found a problem?

Note what you did, what you expected, and what happened instead — screenshots help.
