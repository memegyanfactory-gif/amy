# Amy

**Ask anything. Amy has time.**

Amy is an AI tutor for school students. She teaches one step at a time, asks a quick check after each idea, and marks your working honestly. This repository holds the Amy website: the landing page, a demo of the student app, and the mascot sheet.

![A sunlit classroom with a chalkboard](public/art/classroom.webp)

## What is on the site

- **Ask box up front.** Type a question on the first screen and it opens Amy with that question. A class picker swaps the example questions for your stage of school.
- **Scroll-driven hero.** As you scroll, the first screen gives way to "If you can wonder it, Amy can teach it." while student and subject photos fly past.
- **She grows up with you.** An interactive showcase of four stages of school, each with a student photo and a short sample conversation.
- **The chalkboard.** The four teaching steps as sticky notes you can drag around.
- **A lesson that plays by itself**, animated feature tiles and the 56-second launch film.
- **Subjects carousel**, from first sums to the final exam.
- **Curricula picker** covering 16 countries and their boards.
- **For schools**, **pricing** (Amy and Amy+), **FAQ**, and a closing classroom scene.
- Light and dark themes, and layouts for phone, tablet and desktop.

## It adapts to where you study

The page works out the visitor's country in the browser and adjusts itself:

| What changes | India | United States | Nigeria |
| --- | --- | --- | --- |
| Stages | Class 1 to 5, 6 to 8, 9 to 12, NEET | Grades K to 5, 6 to 8, 9 to 12, SAT / ACT | Primary 1 to 6, JSS 1 to 3, WAEC / NECO, JAMB |
| Subject headline | From first sums to NEET | From first sums to the SAT | From first sums to JAMB |
| Wording | Maths | Math | Maths |
| Boards | CBSE, ICSE, ISC, State Board, NIOS | Common Core, AP, SAT / ACT prep | WAEC, NECO, JAMB prep |
| Student photos | South Asia set | Western set | Africa set |

How the country is chosen, in order:

1. `?country=US` in the address (handy for sharing a link or testing).
2. The country the visitor picked last time, saved in the browser.
3. The device time zone, for example `Asia/Kolkata` means India.
4. The browser language, for example `en-GB` means United Kingdom.
5. Otherwise the "International school" version.

Nothing is sent to a server and there is no location permission prompt. Visitors can change country at any time in the **Curricula** section, and the whole page follows.

Supported: India, United States, United Kingdom, Australia, Canada, Singapore, Malaysia, Philippines, Pakistan, Bangladesh, Nepal, Sri Lanka, Nigeria, Kenya, South Africa and International school. All of this lives in [`src/region.tsx`](src/region.tsx); add or edit a country there.

Prices are shown in rupees for every country.

## Getting started

You need Node.js 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5288.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 5288 |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built site on port 5289 |

To see another country's version locally, open `http://localhost:5288/?country=US` (use any code from `src/region.tsx`, such as `GB`, `NG` or `SG`).

## Pages

The site uses a small hash router, so it runs on any static host.

| Address | Page |
| --- | --- |
| `#/` | Landing page |
| `#/app` | Student app demo. `#/app?ask=...` opens it with a question |
| `#/amy` | Mascot sheet: Amy's moods and sizes |

## Project layout

```
public/art/          Photos used on the landing page
src/
  pages/
    Landing.tsx      The landing page, section by section
    Dashboard.tsx    Student app demo
    MascotSheet.tsx  Amy's moods
  components/        Amy the mascot, the self-playing lesson, feature tiles, app screens
  bits/              Reusable animated pieces (logo loop, count-up and others)
  region.tsx         Country detection and per-country content
  theme.tsx          Light and dark theme
  router.ts          Hash router
  index.css          Design tokens and utilities
```

## Built with

React 18, TypeScript, Vite, Tailwind CSS 4 and Motion for animation. Icons are from Hugeicons. Fonts are Geist, Instrument Serif and Caveat.

## Images

The photos in `public/art` were generated with Magnific for this site. The students shown are not real people.
