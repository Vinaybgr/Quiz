// Replace with your exact deployed Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbz5dl4go_LxzW0wMSXdLhA6wkks1OJMHCNKYqbsY1cMwUT-4AwiQEF4k11MO3v_mj5y/exec"; 

let menuData = {};
let currentQuestions = [];
let currentIndex = 0;
let currentUser = null;

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

// 1. LIVE CLOCK TICKER
function startLiveClock() {
  setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) clockEl.innerText = now.toLocaleTimeString();
  }, 1000);
}

// 2. TAB SWITCHER
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

// 3. USER PROFILE MANAGEMENT
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
  
  // Instantly trigger question loading for new user
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

// 4. API INITIALIZATION & FETCHING
// =========================================================================
// 1. CONFIGURATION & FETCHING SNIPPET (REPLACE AT TOP OF script.js)
// =========================================================================

// Make sure your web app is deployed as "Execute as: Me" and "Who has access: Anyone"
const API_URL = "https://script.google.com/macros/s/AKfycbwG4IBygCvhwV0I0A4B8bX3224S1I961T93-UfE5qP7k26dG_qX_S0X_g/exec"; 

async function init() {
  startLiveClock();
  initUserProfile();

  const loaderText = document.getElementById('loaderText');

  try {
    if (loaderText) loaderText.innerText = getRandomLoadText();

    // Added redirect follow mode to handle Google Apps Script 302 redirects properly
    const response = await fetch(`${API_URL}?action=getMenu`, {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    menuData = await response.json();
    
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
function populateSubjects() {
  const subjectSelect = document.getElementById('subjectSelect');
  subjectSelect.innerHTML = '';
  
  const subjects = Object.keys(menuData.subjects || {});
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
  chapterSelect.innerHTML = '<option value="ALL">All Chapters</option>';

  if (menuData.subjects && menuData.subjects[subjectSelect]) {
    menuData.subjects[subjectSelect].forEach(chap => {
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
    
    document.getElementById('loader').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
    renderQuestion();
  } catch (e) {
    console.error("Question Fetch Error:", e);
    document.getElementById('loaderText').innerText = "⚠️ Failed to fetch questions. Check network/URL.";
  }
}
// 5. QUESTION RENDERER & TIMER
function renderQuestion() {
  if (!currentQuestions || !currentQuestions.length) {
    document.getElementById('questionText').innerText = "No questions found for this selection.";
    document.getElementById('optionsGrid').innerHTML = '';
    return;
  }
  
  clearInterval(questionTimerInterval);
  currentQuestionDuration = 0;
  document.getElementById('questionTimer').innerText = '0s';
  questionTimerInterval = setInterval(() => {
    currentQuestionDuration++;
    document.getElementById('questionTimer').innerText = `${currentQuestionDuration}s`;
  }, 1000);

  const q = currentQuestions[currentIndex];
  const subject = document.getElementById('subjectSelect').value;
  const chapter = document.getElementById('chapterSelect').value;

  document.getElementById('quizBreadcrumb').innerText = `${subject} • ${chapter === 'ALL' ? 'All Chapters' : chapter}`;
  document.getElementById('questionCounter').innerText = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  document.getElementById('questionText').innerText = `${currentIndex + 1}. ${q.question || q.Question || ''}`;

  let options = [];
  if (Array.isArray(q.options) && q.options.length > 0) {
    options = q.options;
  } else {
    options = [
      q.optionA || q.option1 || q.OptionA || q.Option1,
      q.optionB || q.option2 || q.OptionB || q.Option2,
      q.optionC || q.option3 || q.OptionC || q.Option3,
      q.optionD || q.option4 || q.OptionD || q.Option4
    ];
  }

  options = options.filter(opt => opt !== undefined && opt !== null && String(opt).trim() !== "");

  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';

  const prefixes = ['A', 'B', 'C', 'D', 'E'];
  options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-prefix">${prefixes[idx] || idx + 1}</span> <span>${opt}</span>`;
    btn.onclick = () => handleAnswerSelect(opt, q);
    grid.appendChild(btn);
  });

  document.getElementById('prevBtn').disabled = currentIndex === 0;
  document.getElementById('nextBtn').disabled = currentIndex === currentQuestions.length - 1;
}

function handleAnswerSelect(selectedOption, questionObj) {
  clearInterval(questionTimerInterval);
  
  const data = getUserData(currentUser);
  const subject = document.getElementById('subjectSelect').value;
  const correctAnswer = questionObj.answer || questionObj.Answer || questionObj.correctAnswer;
  
  data.solved++;
  data.totalTime += currentQuestionDuration;

  if (!data.subjectStats[subject]) {
    data.subjectStats[subject] = { time: 0, solved: 0, correct: 0 };
  }
  data.subjectStats[subject].solved++;
  data.subjectStats[subject].time += currentQuestionDuration;

  if (selectedOption === correctAnswer || !correctAnswer) {
    data.correct++;
    data.subjectStats[subject].correct++;
    data.streak++;
    data.xp += 10 + (data.streak > 2 ? 5 : 0);
    alert("🎉 Correct! +10 XP");
  } else {
    data.streak = 0;
    data.mistakes.push({
      question: questionObj.question || questionObj.Question,
      yourAnswer: selectedOption,
      correctAnswer: correctAnswer
    });
    alert(`❌ Oops! The right answer was: ${correctAnswer}`);
  }

  saveUserData(currentUser, data);
  updateDashboardStats();
  nextQuestion();
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function nextQuestion() {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

// 6. LEADERBOARD RENDERER
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

// 7. MISTAKES VAULT RENDERER
function renderMistakesVault() {
  const data = getUserData(currentUser);
  const container = document.getElementById('mistakesList');
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

// 8. PARENT PDF REPORT GENERATOR
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
