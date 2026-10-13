/* ===== 1. DATA QUIZ ===== */
const quizData = [
  {
    question: "Apa kepanjangan dari HTML?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink Text Mode Language"
    ],
    correct: 0
  },
  {
    question: "CSS digunakan untuk apa?",
    options: ["Struktur halaman", "Styling tampilan", "Logika program", "Database"],
    correct: 1
  },
  {
    question: "Method DOM modern untuk memilih elemen adalah?",
    options: ["getElementById", "querySelector", "getElementsByTagName", "selectNode"],
    correct: 1
  },
  {
    question: "Manakah yang AMAN dari serangan XSS saat menampilkan input user?",
    options: ["innerHTML", "textContent", "outerHTML", "document.write"],
    correct: 1
  },
  {
    question: "Storage yang datanya tetap ada setelah browser ditutup adalah?",
    options: ["SessionStorage", "Cookies", "LocalStorage", "CacheStorage"],
    correct: 2
  }
];

/* ===== 2. STATE ===== */
let currentQuestion = 0;
let score = 0;
let answered = false;
let timerInterval = null;
const TIME_PER_QUESTION = 15; // detik

/* ===== 3. DOM ELEMENTS ===== */
const questionEl   = document.querySelector('#question');
const optionsEl    = document.querySelector('#options');
const nextBtn      = document.querySelector('#nextBtn');
const progressEl   = document.querySelector('#progress');
const progressFill = document.querySelector('#progressFill');
const timerEl      = document.querySelector('#timer');
const resultEl     = document.querySelector('#result');
const quizContent  = document.querySelector('#quizContent');
const scoreEl      = document.querySelector('#score');
const highScoreEl  = document.querySelector('#highScore');
const restartBtn   = document.querySelector('#restartBtn');
const themeToggle  = document.querySelector('#themeToggle');

/* ===== 4. THEME TOGGLE ===== */
// Muat preferensi tema dari LocalStorage
if (localStorage.getItem('quizTheme') === 'dark') {
  document.body.classList.add('dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('quizTheme', isDark ? 'dark' : 'light');
});

/* ===== 5. TIMER PER SOAL ===== */
function startTimer() {
  clearInterval(timerInterval);
  let timeLeft = TIME_PER_QUESTION;
  timerEl.textContent = `⏱ ${timeLeft}s`;
  timerEl.style.color = '';

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱ ${timeLeft}s`;

    // Warna merah kalau waktu tinggal <= 5 detik
    if (timeLeft <= 5) timerEl.style.color = '#ef4444';

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      autoRevealAnswer(); // waktu habis → tandai jawaban benar
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

/* ===== 6. RENDER SOAL ===== */
function renderQuestion() {
  answered = false;
  const q = quizData[currentQuestion];

  // Progress text & bar
  progressEl.textContent = `Soal ${currentQuestion + 1}/${quizData.length}`;
  progressFill.style.width = `${((currentQuestion) / quizData.length) * 100}%`;

  // Render pertanyaan dengan textContent (AMAN dari XSS)
  questionEl.textContent = q.question;

  // Clear & render opsi pakai createElement
  optionsEl.innerHTML = '';
  q.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.textContent = option;              // textContent = XSS safe
    btn.classList.add('option-btn');
    btn.dataset.index = index;             // data-index untuk delegation
    optionsEl.appendChild(btn);
  });

  // Sembunyikan tombol next
  nextBtn.classList.add('hidden');

  // Jalankan timer
  startTimer();
}

/* ===== 7. EVENT DELEGATION untuk pilihan jawaban ===== */
optionsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.option-btn');
  if (!btn || answered) return;

  answered = true;
  stopTimer();

  const selectedIndex = parseInt(btn.dataset.index);
  const correctIndex  = quizData[currentQuestion].correct;

  // Disable semua tombol
  document.querySelectorAll('.option-btn').forEach(b => (b.disabled = true));

  // Feedback visual
  if (selectedIndex === correctIndex) {
    btn.classList.add('correct');
    score++;
  } else {
    btn.classList.add('wrong');
    // Tunjukkan jawaban yang benar
    document.querySelector(`.option-btn[data-index="${correctIndex}"]`)
      .classList.add('correct');
  }

  // Tampilkan tombol next
  nextBtn.classList.remove('hidden');
});

/* ===== 8. AUTO REVEAL jika waktu habis ===== */
function autoRevealAnswer() {
  if (answered) return;
  answered = true;

  const correctIndex = quizData[currentQuestion].correct;
  document.querySelectorAll('.option-btn').forEach(b => (b.disabled = true));
  document.querySelector(`.option-btn[data-index="${correctIndex}"]`)
    .classList.add('correct');

  nextBtn.classList.remove('hidden');
}

/* ===== 9. TOMBOL NEXT ===== */
nextBtn.addEventListener('click', () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    renderQuestion();
  } else {
    showResult();
  }
});

/* ===== 10. SHOW RESULT & HIGH SCORE ===== */
function showResult() {
  stopTimer();

  const total = quizData.length;
  const percentage = Math.round((score / total) * 100);

  scoreEl.textContent = `${score}/${total} (${percentage}%)`;

  // LocalStorage: High Score
  const savedHighScore = parseInt(localStorage.getItem('quizHighScore')) || 0;
  if (percentage > savedHighScore) {
    localStorage.setItem('quizHighScore', percentage);
    highScoreEl.textContent = `${percentage}% 🎉 New Record!`;
  } else {
    highScoreEl.textContent = `${savedHighScore}%`;
  }

  // Update progress bar 100%
  progressFill.style.width = '100%';

  // Show result, hide quiz
  quizContent.classList.add('hidden');
  resultEl.classList.remove('hidden');
}

/* ===== 11. RESTART QUIZ ===== */
restartBtn.addEventListener('click', () => {
  currentQuestion = 0;
  score = 0;
  answered = false;
  progressFill.style.width = '0%';

  resultEl.classList.add('hidden');
  quizContent.classList.remove('hidden');

  renderQuestion();
});

/* ===== 12. INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  renderQuestion();
});