# Channel 27 News &amp; Entertainment — Website

A fast, responsive, low-maintenance site for **Channel 27 (Tyson Media)** whose main job is
to surface content from the Channel 27 Facebook page. Built as plain HTML/CSS/JS — no build
step, no framework — so it can be hosted anywhere and edited easily.

---

## 1. Quick start

Just open `index.html` in a browser, or drag the whole `channel27/` folder onto a host like
**Netlify**, **Cloudflare Pages**, **GitHub Pages**, or any standard web host. There is nothing
to compile.

To preview locally with a tiny server (so the Facebook embeds behave like production):

```bash
cd channel27
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## 2. The one file you'll edit most: `js/config.js`

Almost everything you'll ever change lives in **`js/config.js`** — the Facebook page link,
contact details, and which posts to feature. You don't need to touch the HTML.

```js
window.C27_CONFIG = {
  siteName: "Channel 27 News & Entertainment",
  facebook: {
    fanPageUrl:   "https://www.facebook.com/tysonmediaoutlet",
    handle:       "facebook.com/tysonmediaoutlet",
    watchLiveUrl: "https://www.facebook.com/tysonmediaoutlet/live_videos",
    ...
  },
  contact: {
    email:    "tysonmedia27@gmail.com",
    location: "Danville, Virginia",
  },
  posts: [ /* see below */ ],
};
```

---

## 3. How the Facebook feed works

The site has **two modes**, and it picks automatically based on the `posts` array in the config:

### Mode A — Live timeline (default, zero maintenance)
If `posts` is **empty**, the Home and All-Posts pages embed the **live Facebook Page timeline**.
As long as the Facebook page is **public**, your newest posts, photos, videos, reactions, and
comments appear automatically — you never have to update the website. This is the recommended
default.

### Mode B — Featured post cards (optional, with filters)
If you paste post links into `posts`, those show as a **card grid** (3–4 columns on desktop)
with working **All / Videos / Photos / Live** filters and a **Load More** button.

To feature a post:
1. On Facebook, open the post.
2. Click the **“…”** menu → **Embed** (or **Copy link**).
3. Paste the URL into `posts` and set its `type`:

```js
posts: [
  { href: "https://www.facebook.com/tysonmediaoutlet/posts/XXXXXXXX",  type: "photo" },
  { href: "https://www.facebook.com/tysonmediaoutlet/videos/XXXXXXXX", type: "video" },
  { href: "https://www.facebook.com/tysonmediaoutlet/videos/XXXXXXXX", type: "live"  },
],
```

`type` can be `"video"`, `"live"`, `"photo"`, or `"status"`. It powers the filters and the
icons. Leave `posts` empty to go back to the live timeline.

> **Note:** Facebook embeds require the page/posts to be **public**. Private or removed posts
> will show a small “View this post on Facebook” fallback link instead of the embed — by design.

---

## 4. Making the contact form actually send email

Out of the box, the contact form (`contact.html`) does full **client-side validation** and shows
a confirmation message, but it does **not** yet deliver email anywhere. Wire it up in one step
using any form service. Two easy options:

**Option A — Formspree** (works on any host)
1. Create a free form at [formspree.io](https://formspree.io) and copy your form ID.
2. In `contact.html`, change the opening form tag to:
   ```html
   <form class="contact-form" id="contact-form" novalidate
         action="https://formspree.io/f/YOUR_ID" method="POST">
   ```
   The existing validation still runs first; submissions then post to Formspree.

**Option B — Netlify Forms** (if hosting on Netlify)
1. Add `netlify` to the form tag:
   ```html
   <form class="contact-form" id="contact-form" netlify novalidate>
   ```
2. Deploy to Netlify — submissions show up in your Netlify dashboard.

The field `name` attributes (`name`, `email`, `phone`, `subject`, `message`) are already set up
to work with both services.

---

## 5. File structure

```
channel27/
├── index.html          Home (hero + latest Facebook feed)
├── about.html          About (two-column + host photo)
├── contact.html        Contact (details + validated form)
├── posts.html          All Posts (filters + card grid / live timeline)
├── post.html           Single post view (?post=<facebook-url>)
├── privacy.html        Privacy Policy (template — review before publishing)
├── terms.html          Terms of Use (template — review before publishing)
├── site.webmanifest    PWA/icon manifest
├── css/
│   └── styles.css       All styling + design system (colors, spacing, responsive)
├── js/
│   ├── config.js        ← edit me: FB links, contact info, featured posts
│   ├── components.js    Shared header + footer (injected on every page)
│   ├── main.js          Facebook feed engine (lazy-loads the SDK, filters, single post)
│   └── contact.js       Contact-form validation + confirmation
└── assets/             Logo, favicons, host cut-out, studio graphic (optimized)
```

The header and footer are defined **once** in `js/components.js` and injected into every page,
so updating the nav or footer in that one file changes the whole site.

---

## 6. Good to know

- **Performance:** images are compressed, the hero image is preloaded, and the Facebook SDK is
  **lazy-loaded** only when the feed scrolls into view (with an 8-second timeout → graceful
  error state). Pages stay fast even before Facebook responds.
- **Accessibility:** semantic HTML, labeled form fields, visible keyboard focus rings, a
  “Skip to content” link, and reduced-motion support are all built in.
- **Responsive:** desktop, tablet, and mobile are all handled. On phones the hero stacks with the
  host photo **above** the text (never covering it), and the post filters become a swipe strip.
- **Branding:** the logo is used in the header and footer only (not repeated in the hero), per the
  brief. Favicons and a web manifest are included.
- **Editing legal pages:** `privacy.html` and `terms.html` are sensible templates — review and
  adjust them to match your actual practices before going live.

---

© Channel 27 (Tyson Media). Built as a custom one-site package.
