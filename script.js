// Replace with your exact deployed Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbz5dl4go_LxzW0wMSXdLhA6wkks1OJMHCNKYqbsY1cMwUT-4AwiQEF4k11MO3v_mj5y/exec"; 

let menuData = {};
let currentQuestions = [];
let currentIndex = 0;

// Fetch initial menu options on page load
async function init() {
  try {
    const response = await fetch(`${API_URL}?action=getMenu`);
    menuData = await response.json();
    
    document.getElementById('totalQuestionsCount').innerText = menuData.totalQuestions || "1,248";
    populateSubjects();
    document.getElementById('loader').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
  } catch (err) {
    document.getElementById('loader').innerText = "Error loading data. Please check your API URL.";
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
  
  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('loader').style.display = 'block';
  document.getElementById('loader').innerText = "Loading questions...";

  try {
    const res = await fetch(`${API_URL}?action=getQuestions&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`);
    currentQuestions = await res.json();
    currentIndex = 0;
    
    document.getElementById('loader').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
    renderQuestion();
  } catch (e) {
    document.getElementById('loader').innerText = "Failed to load questions.";
  }
}

function renderQuestion() {
  if (!currentQuestions.length) return;
  
  const q = currentQuestions[currentIndex];
  const subject = document.getElementById('subjectSelect').value;
  const chapter = document.getElementById('chapterSelect').value;

  document.getElementById('quizBreadcrumb').innerText = `${subject} • ${chapter === 'ALL' ? 'All Chapters' : chapter}`;
  document.getElementById('questionCounter').innerText = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  document.getElementById('questionText').innerText = `${currentIndex + 1}. ${q.question}`;

  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';

  const prefixes = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-prefix">${prefixes[idx]}</span> <span>${opt}</span>`;
    grid.appendChild(btn);
  });

  document.getElementById('prevBtn').disabled = currentIndex === 0;
  document.getElementById('nextBtn').disabled = currentIndex === currentQuestions.length - 1;
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

window.onload = init;
