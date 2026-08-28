# Class 5 Quiz Lab — Architecture & System Specification (v1.0)[cite: 6]

---

## 1. System Overview & Core Stack[cite: 6]

* **Architecture Model**: Single-Page Application (SPA) driven by vanilla HTML5, CSS3, and modern JavaScript (ES6+).[cite: 6]
* **API & Data Engine**: Connects to Google Sheets via a Google Apps Script Web App API (`doGet` endpoint) for dynamic question delivery and subject menu fetching.[cite: 6]
* **Storage Layer**: Zero-database design using browser `localStorage` for profile retention, individual progress logs, XP points, telemetry, and local leaderboard standings.[cite: 6]
* **Deployment Target**: GitHub Pages (static web hosting) with zero build steps or external dependencies.[cite: 6]

---

## 2. Visual Aesthetic & Theme Specs[cite: 6]

* **Theme**: Modern Dark Mode with kid-friendly neon accents to maximize visual engagement while keeping eye strain low.[cite: 6]
* **Typography**: Primary font family is **Plus Jakarta Sans** (weights 400 through 900) via Google Fonts.[cite: 6]
* **Color Palette**:[cite: 6]
  * **Main Canvas**: `#121214` (Deep Charcoal)[cite: 6]
  * **Sidebar & Controls**: `#18181b` (Off-black)[cite: 6]
  * **Surfaces & Cards**: `#202024` (Elevated Surface)[cite: 6]
  * **Primary Accent**: `#f97316` (Electric Orange with `#ea580c` hover state)[cite: 6]
  * **Neon Accents**: `#06b6d4` (Cyan Glow), `#fbbf24` (Amber Gold), `#4ade80` (Live Green)[cite: 6]
  * **Text Spectrum**: `#f4f4f5` (High-Contrast White), `#a1a1aa` (Muted Grey), `#71717a` (Subdued Label Grey)[cite: 6]
* **Motion & FX**: Custom `@keyframes` pulse glows on titles, smooth translation on option buttons/chips, and custom keyframe loading spinners.[cite: 6]

---

## 3. UI Modules & Layout Breakdown[cite: 6]

### Left Sidebar (`<aside class="sidebar">`)[cite: 6]

* **Brand Header**: Displays `favicon.png` with a fallback badge (`C5`) if the image fails to load.[cite: 6]
* **Navigation Sections**:[cite: 6]
  * **Learn**: Access main Dashboard view.[cite: 6]
  * **Practice**: Direct Practice Quiz view and Mistakes Log vault view.[cite: 6]

### Top Bar Header (`<header class="top-bar">`)[cite: 6]

* **Dynamic Welcome**: Animated glowing gradient title (`.glowing-title`) that updates dynamically to greet active users (e.g., *"Ready to Learn, Kairav? 🚀"*).[cite: 6]
* **Live Clock Indicator**: Real-time digital clock displaying hours, minutes, and seconds to confirm active connection status.[cite: 6]
* **Active Profile Chip**: Displays active student name and triggers the identity switcher modal when clicked.[cite: 6]
* **System Badges**: Live Question Bank counter and green-dot API status indicator.[cite: 6]

### Footer Signature (`<footer>`)[cite: 6]

* **Branding Footnote**: Positioned at the bottom of the main content container:[cite: 6]
  `Made with ❤️ by Vinay Ray`[cite: 6]

---

## 4. Master Feature Set (v1.0)[cite: 6]

### 1. Tab Navigation System[cite: 6]

* Smooth, tabbed switching between **Dashboard**, **Practice Quiz**, and **Mistakes Log** without full page refreshes.[cite: 6]

### 2. Smart Option Parser & Dynamic Loader[cite: 6]

* Robust fallback logic for API payloads to handle options delivered as either arrays (`q.options`) or individual keys (`q.optionA`, `q.option1`, etc.), automatically filtering empty values.[cite: 6]
* Kid-friendly loading screens featuring rotating prompts (*"Unlocking secret questions...", "Fueling up the rocket...", "Searching the brain vault..."*).[cite: 6]

### 3. Passwordless User Profile Manager[cite: 6]

* Browser-based registration and profile switcher using `localStorage`.[cite: 6]
* Allows seamless profile creation and instant switching on shared family or school devices.[cite: 6]

### 4. Gamified XP & Streak Engine[cite: 6]

* Earn +10 XP per correct answer with active streak multipliers for consecutive correct responses.[cite: 6]
* Displays current XP total, student level (e.g., *Level 1: Rookie*, *Level 5: Brainiac*), and active streak on the user dashboard.[cite: 6]

### 5. Anonymous Competitive Standings (Leaderboard)[cite: 6]

* Ranks local profiles by **Total XP**, **Accuracy (%)**, and **Questions Solved**.[cite: 6]
* Privacy protection: Highlights the active user by their real name while masking all other competitors under fun anonymous aliases (*Speedy Scholar*, *Quiz Wizard #4*).[cite: 6]

### 6. Telemetry & Time Analytics[cite: 6]

* **Per-Question Solve Timer**: Tickers measure precise answer duration per question to compute average solve speeds.[cite: 6]
* **Subject & Chapter Time Tracker**: Tracks total learning time categorized by Subject and Chapter.[cite: 6]

### 7. Mobile-Adaptable Layout[cite: 6]

* Fully responsive design: Automatically hides the fixed sidebar under 900px screens, converts form controls into single-column vertical stacks, and optimizes touch targets for mobile displays.[cite: 6]

### 8. Official Parent PDF Performance Report[cite: 6]

* Automated client-side PDF export via `html2pdf.js` for **Daily**, **Weekly**, or **Monthly** reviews.[cite: 6]
* **Report Layout**:[cite: 6]
  * **Header**: Dual logo arrangement featuring company logo (`favicon.png`) on the left and educational emblem box on the right.[cite: 6]
  * **Executive Summary**: Total time spent, accuracy rate, questions attempted, XP earned, and best streak.[cite: 6]
  * **Performance Tables**: Breakdown of time and accuracy by Subject and Chapter, alongside speed analytics (Average Answer Speed).[cite: 6]
  * **Verification Footer**: Features an automated gold progress verification stamp, **Parent/Guardian Signature Line** (`_______________________`), and **Director/Principal Signature Line** with seal placement.[cite: 6]