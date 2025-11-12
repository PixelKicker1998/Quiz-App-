let questions = [];
let currentQuestion = 0;
let correctAnswers = 0;
let userAnswers = [];

function isPWA() {
  // return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  return true;
}

window.addEventListener('load', () => {
  const installPrompt = document.getElementById('install-prompt');
  const appContent = document.getElementById('app-content');

  if (!isPWA()) {
    installPrompt.style.display = 'block';
    appContent.style.display = 'none';
    return;
  } else {
 
    installPrompt.style.display = 'none';
    appContent.style.display = 'block';
  }

  const splash = document.getElementById('splash');
  setTimeout(() => splash.style.opacity = 0, 3000);
  setTimeout(() => splash.style.display = 'none', 4000);

  loadQuestions();
});

async function loadQuestions() {
  const res = await fetch('questions_polymere.json');
  const data = await res.json();
  questions = data.sort(() => Math.random() - 0.5);
  currentQuestion = 0;
  correctAnswers = 0;
  userAnswers = [];

  const container = document.getElementById("progress-container");
  container.innerHTML = '<div class="progress-marker"></div>';

  showQuestion();
  updateProgressBar();
}

function showQuestion() {
  const questionEl = document.getElementById("question");
  const answersEl = document.getElementById("answers");
  const btn = document.getElementById("checkBtn");

  if (currentQuestion >= questions.length) {
    showResults();
    return;
  }

  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  answersEl.innerHTML = "";

  q.answers.forEach((ans, i) => {
    const div = document.createElement("div");
    div.textContent = ans.text;
    div.classList.add("answer");
    div.style.animationDelay = `${i * 0.1}s`;
    div.addEventListener("click", () => div.classList.toggle("selected"));
    answersEl.appendChild(div);
  });

  questionEl.style.animation = "fadeIn 0.5s forwards";
  btn.textContent = "Antwort prüfen";
  btn.onclick = checkAnswers;
}

function checkAnswers() {
  const q = questions[currentQuestion];
  const selected = Array.from(document.querySelectorAll(".answer.selected"));
  const btn = document.getElementById("checkBtn");

  const correctSet = new Set(q.answers.map((a, i) => a.correct ? i : -1).filter(i => i !== -1));
  const selectedSet = new Set(selected.map(el => Array.from(el.parentNode.children).indexOf(el)));

  let correctCount = 0;

  document.querySelectorAll(".answer").forEach((el, i) => {
    el.classList.remove("selected");
    if (correctSet.has(i) && selectedSet.has(i)) {
      el.classList.add("correct");
      correctCount++;
    } else if (correctSet.has(i)) {
      el.classList.add("correct");
    } else if (selectedSet.has(i)) {
      el.classList.add("wrong");
    }
  });

  if (correctCount === correctSet.size && correctSet.size === selectedSet.size) {
    correctAnswers++;
  }

  userAnswers.push({
    question: currentQuestion,
    correct: correctCount === correctSet.size && correctSet.size === selectedSet.size
  });

  updateProgressBar();

  btn.textContent = currentQuestion === questions.length - 1 ? "Fertigstellen" : "Nächste Frage";
  btn.onclick = nextQuestion;
}

function nextQuestion() {
  currentQuestion++;
  showQuestion();
}

function updateProgressBar() {
  const container = document.getElementById("progress-container");
  const answered = userAnswers.length;
  if (answered === 0) return;

  const correctCount = userAnswers.filter(a => a.correct).length;
  const wrongCount = answered - correctCount;

  let bars = container.querySelectorAll(".progress-bar");

  if (bars.length < 2) {
    const divC = document.createElement("div");
    divC.classList.add("progress-bar", "correct", "first");
    container.appendChild(divC);

    const divW = document.createElement("div");
    divW.classList.add("progress-bar", "wrong");
    container.appendChild(divW);

    bars = container.querySelectorAll(".progress-bar");
  }

  bars.forEach((bar) => {
    if (bar.classList.contains("correct")) {
      bar.style.width = (correctCount / answered * 100) + "%";
    } else if (bar.classList.contains("wrong")) {
      bar.style.width = (wrongCount / answered * 100) + "%";
    }
  });
}

function showResults() {
  const main = document.querySelector("main");
  main.innerHTML = `
    <h2>Quiz abgeschlossen 🎉</h2>
    <p>Du hast ${correctAnswers} von ${questions.length} Fragen richtig beantwortet.</p>
    <button id="restart-btn">Quiz neu starten</button>
  `;
  const btnRestart = document.getElementById("restart-btn");
  btnRestart.addEventListener("click", () => {
    currentQuestion = 0;
    correctAnswers = 0;
    userAnswers = [];

    const container = document.getElementById("progress-container");
    container.innerHTML = '<div class="progress-marker"></div>';

    main.innerHTML = `
      <div class="question" id="question"></div>
      <div class="answers" id="answers"></div>
      <button id="checkBtn">Antwort prüfen</button>
    `;

    showQuestion();
    updateProgressBar();
  });
}




