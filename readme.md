# Class 5 Quiz Lab - How It Works

Here is a simple, non-technical guide explaining every feature currently built into your project and which file (`HTML`, `CSS`, or `JavaScript`) makes it happen.

---

### **1. Navigation & Screen Switching**
* **What it does:** Lets you click buttons on the navigation bar (Dashboard, Quiz, Mistakes Vault, Leaderboard) to flip between different screens without reloading the webpage.
* **How it works:**
  * **HTML:** Defines the layout structure for each screen (Dashboard, Quiz view, etc.) inside container sections.
  * **CSS:** Hides inactive screens and shows only the currently selected screen.
  * **JavaScript (`script.js`):** Listens for menu clicks and toggles the visible screen instantly.

---

### **2. Dynamic Dropdown Selectors (Subject & Chapter Menu)**
* **What it does:** Automatically loads available subjects and chapters so users can pick what they want to study.
* **How it works:**
  * **HTML:** Holds empty dropdown menus (`<select>`) for Subject and Chapter.
  * **JavaScript (`script.js`):** Fetches subject and chapter lists from Google Sheets via the API and automatically fills the dropdown boxes.

---

### **3. Thrill Mode (Question Shuffling)**
* **What it does:** Allows students to turn on "Thrill Mode" using a toggle switch to shuffle questions into a random order every time a quiz starts.
* **How it works:**
  * **HTML:** Provides the interactive toggle switch (`<input type="checkbox" id="shuffleToggle">`).
  * **CSS:** Styles the toggle button so it looks like a smooth slider switch.
  * **JavaScript (`script.js`):** Checks if the toggle is turned ON when loading questions. If active, it runs a shuffling algorithm on the question array before presenting them.

---

### **4. Interactive Quiz & Real-time Feedback**
* **What it does:** Displays one question at a time with multiple-choice options. It immediately highlights correct answers in green and incorrect ones in red when clicked.
* **How it works:**
  * **HTML:** Creates containers for question text, image/diagram slots, and multiple-choice buttons.
  * **CSS:** Styles choice buttons with hover effects, turning them green for correct selections and red for wrong ones.
  * **JavaScript (`script.js`):** Checks selected answers, calculates scores, updates progress indicators, and enables the "Next Question" button.

---

### **5. Mistakes Vault (Review Wrong Answers)**
* **What it does:** Automatically saves every question a student gets wrong so they can review and practice them later.
* **How it works:**
  * **HTML:** Provides a dedicated screen and layout to view past mistakes.
  * **JavaScript (`script.js`):** Saves incorrect answers into the browser’s local storage (`localStorage`). When opening the Mistakes Vault, it pulls those saved questions and builds review cards dynamically.

---

### **6. Live Online Leaderboard**
* **What it does:** Tracks user scores (XP points, accuracy, total solved) and displays a Top 10 ranking table comparing students.
* **How it works:**
  * **HTML:** Displays a table (`<table>`) structure with column headers for Rank, Name, XP, Accuracy, and Solved Count.
  * **CSS:** Formats table rows, adds padding, and highlights the current logged-in user's row.
  * **JavaScript (`script.js`):** Fetches the top rankings directly from the backend database (Google Sheets) and inserts rows into the HTML table.
  * **Google Apps Script (`Code.gs`):** Recalculates XP rankings on the backend spreadsheet and sends the Top 10 list back to the website.

---

### **7. Gamification System (XP & Badges)**
* **What it does:** Rewards students with Experience Points (XP) for correct answers and unlocks achievements or badges as they reach milestones.
* **How it works:**
  * **HTML:** Placeholders on the Dashboard to display XP counters and badge icons.
  * **CSS:** Styles progress meters, badges, and status cards.
  * **JavaScript (`script.js`):** Calculates XP earnings after quiz sessions, updates saved user stats, and unlocks dynamic reward badges.

---

### **Quick File Summary**

| File | Primary Role |
| :--- | :--- |
| **`index.html`** | **The Blueprint:** Defines what elements exist on the screen (buttons, text boxes, tables, toggles). |
| **`style.css`** | **The Design:** Makes everything look clean, sets colors, button animations, layouts, and responsive formatting. |
| **`script.js`** | **The Brains:** Handles click events, game logic, shuffling, score calculations, and web communications. |
| **`Code.gs`** | **The Cloud Database Engine:** Connects the website to Google Sheets to read questions and update leaderboard stats. |