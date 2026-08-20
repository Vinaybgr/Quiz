// Replace with your exact deployed Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbz5dl4go_LxzW0wMSXdLhA6wkks1OJMHCNKYqbsY1cMwUT-4AwiQEF4k11MO3v_mj5y/exec"; 



let menuData = {};
let currentQuestions = [];
let currentIndex = 0;
let currentUser = null;
let userAnswers = {}; // Tracks answers for current session: { questionIndex: selectedOptionKey }

// Telemetry & Timing Variables
let questionStartTime = 0;
let questionTimerInterval = null;
let currentQuestionDuration = 0;

// Dynamic Loading Messages
const funLoadMessages = [
  "🚀 Fueling up the quiz rocket...",
  "🧠 Unlocking secret questions...",
  "⚡ Searching the brain vault...",
  "🔮 Preparing your exciting challenge...",
  "🎈 Assembling option choices..."
];

function getRandomLoadText() {
  return funLoadMessages[Math.floor(Math.random() * funLoadMessages.length)];
}

// Helper to normalize JSON key lookups (handles spaces, casing, camelCase)
function getObjectValueByNormalizedKey(obj, targetKeys) {
  if (!obj) return null;
  const normalizedObj = {};
  Object.keys(obj).forEach(key => {
    const cleanKey = key.toLowerCase().replace(/[\s_]/g, '');
    normalizedObj[cleanKey] = obj[key];
  });

  for (let target of targetKeys) {
    const cleanTarget = target.toLowerCase().replace(/[\s_]/g, '');
    if (normalizedObj[cleanTarget] !== undefined && normalizedObj[cleanTarget] !== null) {
      return normalizedObj[cleanTarget];
    }
  }
  return null;
}

// =========================================================================
// 2. APP INITIALIZATION
// =========================================================================

async function init() {
  startLiveClock();
  initUserProfile();

  const loaderText = document.getElementById('loaderText');

  try {
    if (loaderText) loaderText.innerText = getRandomLoadText();

    // Fetch initial menu with 302 redirect handling
    const response = await fetch(`${API_URL}?action=getMenu`, {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    menuData = data.subjects ? data.subjects : data;
    
    populateSubjects();
    
    if (currentUser) {
      loadQuestions();
    }
  } catch (err) {
    console.error("API Fetch Error Details:", err);
    if (loaderText) {
      loaderText.innerText = "❌ Connection error! Check deployment permissions or API URL.";
    }
  }
}

function startLiveClock() {
  setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) clockEl.innerText = now.toLocaleTimeString();
  }, 1000);
}

// =========================================================================
// 3. NAVIGATION & TAB SWITCHING
// =========================================================================

function switchTab(tabName) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

  if (tabName === 'dashboard') {
    document.getElementById('dashboardView').classList.add('active');
    document.getElementById('nav-dashboard').classList.add('active');
  } else if (tabName === 'quiz') {
    document.getElementById('quizView').classList.add('active');
    document.getElementById('nav-quiz').classList.add('active');
  } else if (tabName === 'mistakes') {
    document.getElementById('mistakesView').classList.add('active');
    document.getElementById('nav-mistakes').classList.add('active');
    renderMistakesVault();
  } else if (tabName === 'leaderboard') {
    document.getElementById('leaderboardView').classList.add('active');
    document.getElementById('nav-leaderboard').classList.add('active');
    renderLeaderboard();
  }
}

// =========================================================================
// 4. USER PROFILE MANAGEMENT
// =========================================================================

function initUserProfile() {
  const activeUser = localStorage.getItem('c5_active_user');
  if (activeUser) {
    setUser(activeUser);
  } else {
    openUserModal();
  }
}

function openUserModal() {
  const modal = document.getElementById('userModal');
  const userListContainer = document.getElementById('userList');
  const savedUsers = JSON.parse(localStorage.getItem('c5_quiz_users') || '[]');

  userListContainer.innerHTML = '';

  if (savedUsers.length > 0) {
    savedUsers.forEach(username => {
      const chip = document.createElement('div');
      chip.className = 'user-chip';
      chip.innerHTML = `<span>👤 ${username}</span> <span>➔</span>`;
      chip.onclick = () => {
        setUser(username);
        closeUserModal();
        if (Object.keys(menuData).length > 0) loadQuestions();
      };
      userListContainer.appendChild(chip);
    });
  } else {
    userListContainer.innerHTML = `<p style="font-size: 12px; color: var(--text-sub);">No profiles found. Create one below!</p>`;
  }

  modal.style.display = 'flex';
}

function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
}

function registerNewUser() {
  const nameInput = document.getElementById('newUsername');
  const name = nameInput.value.trim();

  if (!name) return alert('Please enter a username!');

  let savedUsers = JSON.parse(localStorage.getItem('c5_quiz_users') || '[]');
  if (!savedUsers.includes(name)) {
    savedUsers.push(name);
    localStorage.setItem('c5_quiz_users', JSON.stringify(savedUsers));
  }

  let userData = getUserData(name);
  saveUserData(name, userData);

  setUser(name);
  nameInput.value = '';
  closeUserModal();
  
  if (Object.keys(menuData).length > 0) {
    loadQuestions();
  }
}

function setUser(username) {
  currentUser = username;
  localStorage.setItem('c5_active_user', username);
  
  const heading = document.getElementById('welcomeHeading');
  const nameDisplay = document.getElementById('activeUserName');
  
  if (heading) heading.innerText = `Ready to Learn, ${username}? 🚀`;
  if (nameDisplay) nameDisplay.innerText = username;
  
  updateDashboardStats();
}

function getUserData(username) {
  const key = `c5_user_data_${username}`;
  const defaultData = {
    xp: 0,
    streak: 0,
    solved: 0,
    correct: 0,
    totalTime: 0,
    subjectStats: {},
    mistakes: []
  };
  return JSON.parse(localStorage.getItem(key)) || defaultData;
}

function saveUserData(username, data) {
  localStorage.setItem(`c5_user_data_${username}`, JSON.stringify(data));
}

function updateDashboardStats() {
  if (!currentUser) return;
  const data = getUserData(currentUser);
  
  document.getElementById('dashXP').innerText = `${data.xp} XP`;
  document.getElementById('dashStreak').innerText = `🔥 ${data.streak}`;
  
  const accuracy = data.solved > 0 ? Math.round((data.correct / data.solved) * 100) : 0;
  document.getElementById('dashAccuracy').innerText = `${accuracy}%`;

  let level = "Rookie";
  if (data.xp > 500) level = "Master";
  else if (data.xp > 200) level = "Brainiac";
  else if (data.xp > 50) level = "Explorer";
  
  document.getElementById('dashLevel').innerText = level;
}

// =========================================================================
// 5. DROPDOWNS & QUESTION FETCHING
// =========================================================================

function populateSubjects() {
  const subjectSelect = document.getElementById('subjectSelect');
  subjectSelect.innerHTML = '';
  
  const subjects = Object.keys(menuData || {});
  subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub;
    opt.innerText = sub;
    subjectSelect.appendChild(opt);
  });

  onSubjectChange();
}

function onSubjectChange() {
  const subjectSelect = document.getElementById('subjectSelect').value;
  const chapterSelect = document.getElementById('chapterSelect');
  chapterSelect.innerHTML = '<option value="ALL">All Chapters Combined</option>';

  if (menuData && menuData[subjectSelect]) {
    menuData[subjectSelect].forEach(chap => {
      const opt = document.createElement('option');
      opt.value = chap;
      opt.innerText = chap;
      chapterSelect.appendChild(opt);
    });
  }
}

async function loadQuestions() {
  const subject = document.getElementById('subjectSelect').value;
  const chapter = document.getElementById('chapterSelect').value;
  
  if (!subject) return;

  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('loader').style.display = 'block';
  document.getElementById('loaderText').innerText = getRandomLoadText();

  try {
    const res = await fetch(`${API_URL}?action=getQuestions&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`, {
      method: "GET",
      redirect: "follow"
    });
    
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    currentQuestions = await res.json();
    currentIndex = 0;
    userAnswers = {};
    
    document.getElementById('loader').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
    renderQuestion();
  } catch (e) {
    console.error("Question Fetch Error:", e);
    document.getElementById('loaderText').innerText = "⚠️ Failed to fetch questions. Check network/URL.";
  }
}

// =========================================================================
// 6. QUESTION RENDERER & INTERACTION
// =========================================================================
// =========================================================================
// CSS-OVERRIDE QUESTION RENDERER
// Uses inline styles to guarantee left alignment, dark background, and glowing borders
// =========================================================================
function renderQuestion() {
  if (!currentQuestions || !currentQuestions.length) return;

  // Timer setup
  clearInterval(questionTimerInterval);
  currentQuestionDuration = 0;
  const timerEl = document.getElementById('questionTimer') || document.getElementById('timer');
  if (timerEl) timerEl.innerText = '0s';

  questionTimerInterval = setInterval(() => {
    currentQuestionDuration++;
    if (timerEl) timerEl.innerText = `${currentQuestionDuration}s`;
  }, 1000);

  const q = currentQuestions[currentIndex];
  const subjectSelect = document.getElementById('subjectSelect') || document.getElementById('subject-select');
  const chapterSelect = document.getElementById('chapterSelect') || document.getElementById('chapter-select');

  const subject = subjectSelect ? subjectSelect.value : '';
  const chapter = chapterSelect ? chapterSelect.value : '';

  // Header Breadcrumbs
  const breadcrumb = document.getElementById('quizBreadcrumb') || document.getElementById('quiz-title');
  if (breadcrumb) breadcrumb.innerText = `${subject} • ${chapter === 'ALL' ? 'ALL CHAPTERS' : chapter}`;

  const counter = document.getElementById('questionCounter') || document.getElementById('progress');
  if (counter) counter.innerText = `Question ${currentIndex + 1} of ${currentQuestions.length}`;

  const qTextEl = document.getElementById('questionText') || document.getElementById('q-text');
  const qText = q.question || q.Question || getObjectValueByNormalizedKey(q, ['question', 'q']) || '';
  if (qTextEl) qTextEl.innerText = `${currentIndex + 1}. ${qText}`;

  // Target options container
  const container = document.getElementById('options-container') || document.getElementById('optionsGrid');
  if (!container) return;
  container.innerHTML = '';

  // Parse options
  const optionsObj = q.options || {
    "Option A": q['Option A'] || getObjectValueByNormalizedKey(q, ['optiona', 'a']),
    "Option B": q['Option B'] || getObjectValueByNormalizedKey(q, ['optionb', 'b']),
    "Option C": q['Option C'] || getObjectValueByNormalizedKey(q, ['optionc', 'c']),
    "Option D": q['Option D'] || getObjectValueByNormalizedKey(q, ['optiond', 'd'])
  };

  const correctAnswerKey = String(q.correct || q['Correct Answer'] || getObjectValueByNormalizedKey(q, ['correctanswer', 'correct', 'answer']) || '').trim();

  Object.keys(optionsObj).forEach(key => {
    const optionText = optionsObj[key];
    if (!optionText || String(optionText).trim() === "") return;

    const btn = document.createElement('button');
    const shortLabel = key.replace('Option ', '').trim() + ':';

    // BASE STYLES: Direct inline overrides against CSS interference
    const baseStyle = `
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      text-align: left !important;
      width: 100% !important;
      padding: 14px 20px !important;
      margin-bottom: 12px !important;
      border-radius: 12px !important;
      background-color: rgba(15, 23, 42, 0.6) !important;
      color: #f8fafc !important;
      font-size: 15px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      box-sizing: border-box !important;
    `;

    if (userAnswers[currentIndex]) {
      btn.disabled = true;

      const isCorrectOption = key.toLowerCase() === correctAnswerKey.toLowerCase() || optionText === correctAnswerKey;
      const isSelectedOption = userAnswers[currentIndex] === key;

      if (isCorrectOption) {
        // Green Glow Outline for Correct Option
        btn.style.cssText = `${baseStyle} border: 2px solid #10b981 !important; background-color: rgba(6, 78, 59, 0.3) !important; color: #6ee7b7 !important; box-shadow: 0 0 12px rgba(16, 185, 129, 0.3) !important;`;
      } else if (isSelectedOption) {
        // Red Glow Outline for Wrong Selected Option
        btn.style.cssText = `${baseStyle} border: 2px solid #f43f5e !important; background-color: rgba(136, 19, 55, 0.3) !important; color: #fca5a5 !important; box-shadow: 0 0 12px rgba(244, 63, 94, 0.3) !important;`;
      } else {
        // Subdued Unselected Options
        btn.style.cssText = `${baseStyle} border: 1px solid rgba(255, 255, 255, 0.1) !important; opacity: 0.4 !important;`;
      }
    } else {
      btn.style.cssText = `${baseStyle} border: 1px solid rgba(255, 255, 255, 0.15) !important;`;
      btn.onmouseenter = () => btn.style.borderColor = "rgba(255, 255, 255, 0.4)";
      btn.onmouseleave = () => btn.style.borderColor = "rgba(255, 255, 255, 0.15)";
      btn.onclick = () => handleAnswerSelect(key, optionText, q);
    }

    btn.innerHTML = `<span style="color: #60a5fa; font-weight: 700; font-size: 14px; margin-right: 10px; min-width: 22px; display: inline-block;">${shortLabel}</span> <span style="font-weight: 400;">${optionText}</span>`;
    container.appendChild(btn);
  });

  // Always show explanation box when an answer is selected
  if (userAnswers[currentIndex]) {
    renderInlineExplanation(q, container);
  }

  // Navigation button states
  const prevBtn = document.getElementById('prevBtn') || document.getElementById('prev-btn');
  if (prevBtn) prevBtn.disabled = currentIndex === 0;

  const nextBtn = document.getElementById('nextBtn') || document.getElementById('next-btn');
  if (nextBtn) nextBtn.innerText = currentIndex === currentQuestions.length - 1 ? 'Finish' : 'Next';
}

// =========================================================================
// MATCHING INLINE EXPLANATION (CSS-OVERRIDE)
// Creates dark card with blue left accent border right under options
// =========================================================================
function renderInlineExplanation(q, parentContainer) {
  const explanationText = q.explanation || q['Explanation'] || getObjectValueByNormalizedKey(q, ['explanation', 'exp']) || "No detailed explanation provided for this question.";

  const expCard = document.createElement('div');
  expCard.id = 'inline-explanation-box';
  expCard.style.cssText = `
    margin-top: 16px !important;
    padding: 16px 20px !important;
    border-radius: 12px !important;
    background-color: rgba(15, 23, 42, 0.7) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-left: 4px solid #3b82f6 !important;
    text-align: left !important;
    width: 100% !important;
    box-sizing: border-box !important;
  `;
  
  expCard.innerHTML = `
    <div style="color: #60a5fa; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
      EXPLANATION
    </div>
    <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6; font-weight: 400;">
      ${explanationText}
    </div>
  `;

  parentContainer.appendChild(expCard);
}
function nextQuestion() {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    alert("🎉 Quiz completed!");
  }
}

// =========================================================================
// 7. LEADERBOARD & MISTAKES LOG
// =========================================================================

function renderLeaderboard() {
  const savedUsers = JSON.parse(localStorage.getItem('c5_quiz_users') || '[]');
  const aliases = ["Speedy Scholar", "Brainy Explorer", "Math Wizard", "Logic Master", "Quiz Champ"];
  
  let leaderboardData = savedUsers.map((user, idx) => {
    const uData = getUserData(user);
    const accuracy = uData.solved > 0 ? Math.round((uData.correct / uData.solved) * 100) : 0;
    return {
      realName: user,
      alias: user === currentUser ? user : (aliases[idx % aliases.length] + ` #${idx + 1}`),
      xp: uData.xp,
      accuracy: accuracy,
      solved: uData.solved
    };
  });

  leaderboardData.sort((a, b) => b.xp - a.xp);

  const tbody = document.getElementById('leaderboardBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  leaderboardData.forEach((row, i) => {
    const tr = document.createElement('tr');
    if (row.realName === currentUser) tr.className = 'active-user-row';
    tr.innerHTML = `
      <td>#${i + 1}</td>
      <td>${row.alias} ${row.realName === currentUser ? ' (You)' : ''}</td>
      <td>${row.xp} XP</td>
      <td>${row.accuracy}%</td>
      <td>${row.solved}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderMistakesVault() {
  const data = getUserData(currentUser);
  const container = document.getElementById('mistakesList');
  if (!container) return;
  container.innerHTML = '';

  if (data.mistakes.length === 0) {
    container.innerHTML = `<p style="margin-top: 15px;">Great job! No recorded mistakes.</p>`;
    return;
  }

  data.mistakes.forEach((m, idx) => {
    const card = document.createElement('div');
    card.style.cssText = "background: var(--bg-sidebar); padding: 12px; border-radius: 8px; margin-top: 10px; text-align: left;";
    card.innerHTML = `
      <p style="color: var(--text-main); font-weight: 700;">${idx + 1}. ${m.question}</p>
      <p style="color: #ef4444; font-size: 12px;">Your Answer: ${m.yourAnswer}</p>
      <p style="color: #22c55e; font-size: 12px;">Correct Answer: ${m.correctAnswer}</p>
    `;
    container.appendChild(card);
  });
}

// =========================================================================
// 8. PARENT PDF REPORT GENERATOR
// =========================================================================

function openReportModal() {
  if (!currentUser) return alert("Select a profile first!");
  const data = getUserData(currentUser);

  document.getElementById('pdfStudentName').innerText = currentUser;
  document.getElementById('pdfStudentRank').innerText = "#1 Local";
  document.getElementById('pdfStudentLevel').innerText = document.getElementById('dashLevel').innerText;
  
  document.getElementById('pdfTimeSpent').innerText = `${Math.round(data.totalTime / 60)}m`;
  document.getElementById('pdfQuestionsSolved').innerText = data.solved;
  
  const accuracy = data.solved > 0 ? Math.round((data.correct / data.solved) * 100) : 0;
  document.getElementById('pdfAccuracy').innerText = `${accuracy}%`;
  document.getElementById('pdfTotalXP').innerText = `${data.xp} XP`;

  const avgSpeed = data.solved > 0 ? Math.round(data.totalTime / data.solved) : 0;
  document.getElementById('pdfAvgSpeed').innerText = `${avgSpeed}s`;
  document.getElementById('pdfMistakesCount').innerText = `${data.mistakes.length} unresolved errors`;

  const tbody = document.getElementById('pdfSubjectBreakdown');
  tbody.innerHTML = '';
  Object.keys(data.subjectStats).forEach(sub => {
    const stat = data.subjectStats[sub];
    const subAcc = stat.solved > 0 ? Math.round((stat.correct / stat.solved) * 100) : 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${sub}</td>
      <td>${Math.round(stat.time / 60)}m</td>
      <td>${stat.solved}</td>
      <td>${subAcc}%</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('reportModal').style.display = 'flex';
}

function closeReportModal() {
  document.getElementById('reportModal').style.display = 'none';
}

function downloadPDFReport() {
  const element = document.getElementById('pdfPrintContainer');
  const opt = {
    margin:       0.5,
    filename:     `${currentUser}_Progress_Report.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

window.onload = init;
