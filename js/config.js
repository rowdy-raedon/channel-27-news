/* ============================================================================
   CHANNEL 27 — SITE CONFIGURATION
   ----------------------------------------------------------------------------
   This is the only file the site owner needs to edit. Everything that points
   at the real Facebook page, contact details, and featured posts lives here.

   HOW TO CONNECT THE FACEBOOK FEED
   --------------------------------
   1. The page timeline shows automatically from `facebook.fanPageUrl` below.
      As long as the Facebook page is PUBLIC, real posts appear with their
      images, video, reactions, comments and share controls — no extra work.

   2. To FEATURE specific posts as cards (the 3–4 column grid on the home page
      and the "All Posts" page), paste the post permalinks into `posts` below.
      On Facebook: open a post → "..." menu → "Embed" or "Copy link" → paste the
      URL here. Set `type` so the All-Posts filters (Videos / Photos / Live)
      work. Leave `posts` empty and the live timeline is shown instead.
   ============================================================================ */

window.C27_CONFIG = {
  /* ---- Brand ---- */
  siteName: "Channel 27 News & Entertainment",
  tagline: "Your Source for News & Entertainment",

  /* ---- Auth (Facebook Page OAuth) ---- */
  auth: {
    // Facebook App ID — set this after creating your Facebook App.
    // When empty, the "Connect Page" button is hidden.
    appId: "",
    // Set to false to hide the connect button even when appId is set.
    showConnectButton: true,
    // API base URL for Cloudflare Pages Functions.
    // Leave empty ("") to use the same origin (recommended for production).
    apiBase: "",
  },

  /* ---- Facebook ---- */
  facebook: {
    fanPageUrl: "https://www.facebook.com/tysonmediaoutlet",
    handle: "facebook.com/tysonmediaoutlet",
    // Where the "Watch Live" buttons point. Default = the page's live videos.
    watchLiveUrl: "https://www.facebook.com/tysonmediaoutlet/live_videos",
    // Facebook SDK locale + version
    locale: "en_US",
    graphVersion: "v19.0",
  },

  /* ---- Contact ---- */
  contact: {
    email: "tysonmedia27@gmail.com",
    location: "Danville, Virginia",
  },

  /* ----------------------------------------------------------------------
     FEATURED POSTS  (optional)
     Paste real Facebook post links here to show them as cards.
     type: "video" | "live" | "photo" | "status"
     Example:
       { href: "https://www.facebook.com/tysonmediaoutlet/posts/PID", type: "photo" },
       { href: "https://www.facebook.com/tysonmediaoutlet/videos/VID", type: "video" },
     Leave the array empty to display the live page timeline instead.
  ---------------------------------------------------------------------- */
  posts: [
    // Add post permalinks here — see instructions above.
  ],
};
