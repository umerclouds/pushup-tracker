# UAT Checklist — Team Push-Up Tracker

Live site: https://pushup-tracker-production-bfd6.up.railway.app
Admin: https://pushup-tracker-production-bfd6.up.railway.app/admin (needs the admin token)

> **Heads-up for testing before 1 September:** the leaderboard and team total count
> **September push-ups only**. Reps you log today (August) will show in "Your day" and in
> a player's all-time total, but the leaderboard will stay at 0 until the challenge starts.
> To see the leaderboard working during UAT, use the admin page → **Set day** with a
> September date (e.g. 2026-09-01) — then remove the test data afterwards.

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

- [ ] Leaderboard sorts highest first, medals for top three, "YOU" tag on your row.
- [ ] (Sept only / via admin Set day) totals on the board reflect September reps only.
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
