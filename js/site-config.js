/**
 * Optional Supabase sync for the guestbook (shared across all visitors).
 * Leave both empty to use browser-only storage (messages visible only on this device).
 *
 * 1) Create a project at https://supabase.com
 * 2) SQL Editor → run:
 *
 *   create table if not exists guestbook_entries (
 *     id uuid primary key default gen_random_uuid(),
 *     created_at timestamptz not null default now(),
 *     nickname text not null check (char_length(nickname) <= 40),
 *     message text not null check (char_length(message) <= 500)
 *   );
 *   alter table guestbook_entries enable row level security;
 *   create policy "guestbook_read" on guestbook_entries for select using (true);
 *   create policy "guestbook_insert" on guestbook_entries for insert with check (true);
 *
 * 3) Paste Project URL and anon public key below.
 */
window.NBA_SITE_CONFIG = {
  /** Optional: override default path to player data (same origin). */
  playersJsonUrl: "players.json",

  /**
   * Ball Don't Lie NBA API — https://app.balldontlie.io (free key).
   * When set, optional milestone.live + player.liveProfile in players.json can refresh totals from playoff box scores.
   */
  balldontlieApiKey: "",
  balldontlieBaseUrl: "https://api.balldontlie.io/v1",
  /** Default playoff seasons to sum when player.liveProfile omits postseasonSeasons. */
  balldontliePostseasonSeasons: [2025],

  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseTable: "guestbook_entries",

  /**
   * Giscus (GitHub Discussions comments) — https://giscus.app
   * 1) Turn on Discussions for the repo (Settings → General → Features).
   * 2) Install the Giscus GitHub App for that repo.
   * 3) Open giscus.app → fill the form → copy the generated data-repo-id / data-category-id / data-repo / data-category into the fields below.
   * Leave repoId or categoryId empty to show setup instructions instead of the widget.
   */
  giscusRepo: "Cychenyang1991/playoff-chase",
  giscusRepoId: "R_kgDOSXmGSA",
  giscusCategory: "Announcements",
  giscusCategoryId: "DIC_kwDOSXmGSM4C8pFL",
  giscusMapping: "pathname",
  giscusTheme: "noborder_dark",
  giscusLang: "en"
};
