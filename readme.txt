# Class 5 Quiz Lab — Architecture & System Specification (v1.0)

---

## 1. System Overview & Core Stack

* **Architecture Model**: Single-Page Application (SPA) driven by vanilla HTML5, CSS3, and modern JavaScript (ES6+).
* **API & Data Engine**: Connects to Google Sheets via a Google Apps Script Web App API (`doGet` endpoint) for dynamic question delivery and subject menu fetching.
* **Storage Layer**: Zero-database design using browser `localStorage` for profile retention, individual progress logs, XP points, telemetry, and local leaderboard standings.
* **Deployment Target**: GitHub Pages (static web hosting) with zero build steps or external dependencies.

---

## 2. Visual Aesthetic & Theme Specs

* **Theme**: Modern Dark Mode with kid-friendly neon accents to maximize visual engagement while keeping eye strain low.
* **Typography**: Primary font family is **Plus Jakarta Sans** (weights 400 through 900) via Google Fonts.
* **Color Palette**:
* **Main Canvas**: `#121214` (Deep Charcoal)
* **Sidebar & Controls**: `#18181b` (Off-black)
* **Surfaces & Cards**: `#202024` (Elevated Surface)
* **Primary Accent**: `#f97316` (Electric Orange with `#ea580c` hover state)
* **Neon Accents**: `#06b6d4` (Cyan Glow), `#fbbf24` (Amber Gold), `#4ade80` (Live Green)
* **Text Spectrum**: `#f4f4f5` (High-Contrast White), `#a1a1aa` (Muted Grey), `#71717a` (Subdued Label Grey)


* **Motion & FX**: Custom `@keyframes` pulse glows on titles, smooth translation on option buttons/chips, and custom keyframe loading spinners.

---

## 3. UI Modules & Layout Breakdown

### Left Sidebar (`<aside class="sidebar">`)

* **Brand Header**: Displays `favicon.png` with a fallback badge (`C5`) if the image fails to load.
* **Navigation Sections**:
* **Learn**: Access main Dashboard view.
* **Practice**: Direct Practice Quiz view and Mistakes Log vault view.



### Top Bar Header (`<header class="top-bar">`)

* **Dynamic Welcome**: Animated glowing gradient title (`.glowing-title`) that updates dynamically to greet active users (e.g., *"Ready to Learn, Kairav? 🚀"*).
* **Live Clock Indicator**: Real-time digital clock displaying hours, minutes, and seconds to confirm active connection status.
* **Active Profile Chip**: Displays active student name and triggers the identity switcher modal when clicked.
* **System Badges**: Live Question Bank counter and green-dot API status indicator.

### Footer Signature (`<footer>`)

* **Branding Footnote**: Positioned at the bottom of the main content container:
`Made with ❤️ by Vinay Ray`

---

## 4. Master Feature Set (v1.0)

### 1. Tab Navigation System

* Smooth, tabbed switching between **Dashboard**, **Practice Quiz**, and **Mistakes Log** without full page refreshes.

### 2. Smart Option Parser & Dynamic Loader

* Robust fallback logic for API payloads to handle options delivered as either arrays (`q.options`) or individual keys (`q.optionA`, `q.option1`, etc.), automatically filtering empty values.
* Kid-friendly loading screens featuring rotating prompts (*"Unlocking secret questions...", "Fueling up the rocket...", "Searching the brain vault..."*).

### 3. Passwordless User Profile Manager

* Browser-based registration and profile switcher using `localStorage`.
* Allows seamless profile creation and instant switching on shared family or school devices.

### 4. Gamified XP & Streak Engine

* Earn +10 XP per correct answer with active streak multipliers for consecutive correct responses.
* Displays current XP total, student level (e.g., *Level 1: Rookie*, *Level 5: Brainiac*), and active streak on the user dashboard.

### 5. Anonymous Competitive Standings (Leaderboard)

* Ranks local profiles by **Total XP**, **Accuracy (%)**, and **Questions Solved**.
* Privacy protection: Highlights the active user by their real name while masking all other competitors under fun anonymous aliases (*Speedy Scholar*, *Quiz Wizard #4*).

### 6. Telemetry & Time Analytics

* **Per-Question Solve Timer**: Tickers measure precise answer duration per question to compute average solve speeds.
* **Subject & Chapter Time Tracker**: Tracks total learning time categorized by Subject and Chapter.

### 7. Mobile-Adaptable Layout

* Fully responsive design: Automatically hides the fixed sidebar under 900px screens, converts form controls into single-column vertical stacks, and optimizes touch targets for mobile displays.

### 8. Official Parent PDF Performance Report

* Automated client-side PDF export via `html2pdf.js` for **Daily**, **Weekly**, or **Monthly** reviews.
* **Report Layout**:
* **Header**: Dual logo arrangement featuring company logo (`favicon.png`) on the left and educational emblem box on the right.
* **Executive Summary**: Total time spent, accuracy rate, questions attempted, XP earned, and best streak.
* **Performance Tables**: Breakdown of time and accuracy by Subject and Chapter, alongside speed analytics (Average Answer Speed).
* **Verification Footer**: Features an automated gold progress verification stamp, **Parent/Guardian Signature Line** (`_______________________`), and **Director/Principal Signature Line** with seal placement.
