
"use strict";

/* ==========================================
   MCQ VERSE — MAIN APPLICATION ENGINE
   Subject • Chapter • MCQ • Progress
========================================== */

const MCQVerse = {
  currentSubject: "",
  currentChapter: "",
  questions: [],
  currentQuestion: 0,
  correctAnswers: 0,
  answered: false,

  subjects: {
    "bangla-1st": {
      name: "বাংলা ১ম পত্র",
      folder: "bangla-1st",
      chapters: [
        { id: "chapter-01", name: "অপরিচিতা" },
        { id: "chapter-02", name: "বিলাসী" }
      ]
    },

    "bangla-2nd": {
      name: "বাংলা ২য় পত্র",
      folder: "bangla-2nd",
      chapters: []
    },

    "english-1st": {
      name: "English 1st Paper",
      folder: "english-1st",
      chapters: []
    },

    "english-2nd": {
      name: "English 2nd Paper",
      folder: "english-2nd",
      chapters: []
    },

    "civics": {
      name: "পৌরনীতি",
      folder: "civics",
      chapters: []
    },

    "economics": {
      name: "অর্থনীতি",
      folder: "economics",
      chapters: []
    },

    "history": {
      name: "ইতিহাস",
      folder: "history",
      chapters: []
    },

    "islamic-history": {
      name: "ইসলামের ইতিহাস",
      folder: "islamic-history",
      chapters: []
    },

    "sociology": {
      name: "সমাজবিজ্ঞান",
      folder: "sociology",
      chapters: []
    },

    "logic": {
      name: "যুক্তিবিদ্যা",
      folder: "logic",
      chapters: []
    },

    "geography": {
      name: "ভূগোল",
      folder: "geography",
      chapters: []
    }
  }
};

/* ==========================================
   LOCAL STORAGE
========================================== */

const STORAGE = {
  practice: "mcqVersePractice",
  correct: "mcqVerseCorrect",
  answered: "mcqVerseAnswered"
};

function getStat(key) {
  return Number(localStorage.getItem(key)) || 0;
}

function setStat(key, value) {
  localStorage.setItem(key, String(value));
}

function updateStats() {
  const answered = getStat(STORAGE.answered);
  const correct = getStat(STORAGE.correct);
  const accuracy = answered
    ? Math.round((correct / answered) * 100)
    : 0;

  const practiceEl = document.getElementById("totalPractice");
  const accuracyEl = document.getElementById("accuracy");

  if (practiceEl) practiceEl.textContent = answered;
  if (accuracyEl) accuracyEl.textContent = accuracy + "%";
}

/* ==========================================
   SUBJECT NAVIGATION
========================================== */

function showSubjects() {
  document.getElementById("subjectsSection").classList.remove("hidden");
  document.getElementById("chapterSection").classList.add("hidden");
  document.getElementById("quizSection").classList.add("hidden");

  document.getElementById("subjectsSection").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function openSubject(subjectId) {
  const subject = MCQVerse.subjects[subjectId];

  if (!subject) return;

  MCQVerse.currentSubject = subjectId;

  document.getElementById("subjectsSection").classList.add("hidden");
  document.getElementById("quizSection").classList.add("hidden");
  document.getElementById("chapterSection").classList.remove("hidden");

  document.getElementById("selectedSubjectName").textContent =
    subject.name;

  renderChapters(subject);

  document.getElementById("chapterSection").scrollIntoView({
    behavior: "smooth"
  });
}

/* ==========================================
   CHAPTER RENDERING
========================================== */

function renderChapters(subject) {
  const container = document.getElementById("chapterList");
  container.innerHTML = "";

  if (!subject.chapters.length) {
    container.innerHTML = `
      <div class="quiz-card">
        <h3>Chapter Content Coming Soon</h3>
        <p style="color:#9aafa4;margin-top:10px">
          এই বিষয়ের অধ্যায়গুলো শীঘ্রই যুক্ত করা হবে।
        </p>
      </div>
    `;
    return;
  }

  subject.chapters.forEach((chapter, index) => {
    const button = document.createElement("button");
    button.className = "chapter-item";

    const info = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent =
      `Chapter ${String(index + 1).padStart(2, "0")} — ${chapter.name}`;

    const description = document.createElement("p");
    description.textContent = "Practice MCQs and explanations";

    info.append(heading, description);

    const arrow = document.createElement("span");
    arrow.textContent = "→";
    arrow.style.color = "#e6bd65";

    button.append(info, arrow);

    button.addEventListener("click", () => {
      openChapter(chapter.id);
    });

    container.appendChild(button);
  });
}

/* ==========================================
   LOAD CHAPTER MCQ FILE
========================================== */

function loadChapterFile(subjectFolder, chapterId) {
  return new Promise((resolve, reject) => {
    const oldScript = document.getElementById("chapterQuestionScript");

    if (oldScript) oldScript.remove();

    window.MCQ_VERSE_QUESTIONS = [];

    const script = document.createElement("script");

    script.id = "chapterQuestionScript";
    script.src =
      `questions/${subjectFolder}/${chapterId}.js`;

    script.onload = () => {
      resolve(window.MCQ_VERSE_QUESTIONS || []);
    };

    script.onerror = () => {
      reject(new Error("Chapter file could not be loaded."));
    };

    document.body.appendChild(script);
  });
}

/* ==========================================
   OPEN CHAPTER
========================================== */

async function openChapter(chapterId) {
  const subject = MCQVerse.subjects[MCQVerse.currentSubject];

  if (!subject) return;

  MCQVerse.currentChapter = chapterId;

  const chapter = subject.chapters.find(
    item => item.id === chapterId
  );

  try {
    const questions = await loadChapterFile(
      subject.folder,
      chapterId
    );

    if (!questions.length) {
      alert("এই অধ্যায়ে এখনো MCQ যুক্ত করা হয়নি।");
      return;
    }

    MCQVerse.questions = questions;
    MCQVerse.currentQuestion = 0;
    MCQVerse.correctAnswers = 0;
    MCQVerse.answered = false;

    document.getElementById("chapterSection").classList.add("hidden");
    document.getElementById("quizSection").classList.remove("hidden");

    document.getElementById("quizChapterName").textContent =
      chapter ? chapter.name : "MCQ Practice";

    renderQuestion();

    document.getElementById("quizSection").scrollIntoView({
      behavior: "smooth"
    });

  } catch (error) {
    console.error(error);
    alert("Chapter file পাওয়া যায়নি। GitHub-এ ফাইলের নাম ও location পরীক্ষা করো।");
  }
}

/* ==========================================
   RENDER QUESTION
========================================== */

function renderQuestion() {
  const data = MCQVerse.questions[MCQVerse.currentQuestion];

  if (!data) {
    showQuizResult();
    return;
  }

  MCQVerse.answered = false;

  document.getElementById("questionText").textContent =
    data.question;

  document.getElementById("questionProgress").textContent =
    `${MCQVerse.currentQuestion + 1} / ${MCQVerse.questions.length}`;

  const progress =
    ((MCQVerse.currentQuestion + 1) / MCQVerse.questions.length) * 100;

  document.getElementById("progressFill").style.width =
    progress + "%";

  const optionsContainer = document.getElementById("optionsList");
  optionsContainer.innerHTML = "";

  document.getElementById("explanationBox").classList.add("hidden");
  document.getElementById("nextQuestionBtn").classList.add("hidden");

  data.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.className = "option-btn";
    button.textContent =
      `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => {
      checkAnswer(index, button);
    });

    optionsContainer.appendChild(button);
  });
}

/* ==========================================
   CHECK ANSWER
========================================== */

function checkAnswer(selectedIndex, selectedButton) {
  if (MCQVerse.answered) return;

  MCQVerse.answered = true;

  const data = MCQVerse.questions[MCQVerse.currentQuestion];

  const correctIndex = data.answer;

  const buttons = document.querySelectorAll(".option-btn");

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === correctIndex) {
      button.classList.add("correct");
    }
  });

  const isCorrect = selectedIndex === correctIndex;

  if (isCorrect) {
    MCQVerse.correctAnswers++;
  } else {
    selectedButton.classList.add("wrong");
  }

  setStat(
    STORAGE.answered,
    getStat(STORAGE.answered) + 1
  );

  if (isCorrect) {
    setStat(
      STORAGE.correct,
      getStat(STORAGE.correct) + 1
    );
  }

  updateStats();

  const explanation = document.getElementById("explanationBox");

  const resultTitle = isCorrect
    ? "✓ সঠিক উত্তর!"
    : "✕ ভুল উত্তর!";

  const explanationText = data.explanation || "এই প্রশ্নের ব্যাখ্যা এখনো যুক্ত করা হয়নি।";

  explanation.replaceChildren();

  const title = document.createElement("strong");
  title.textContent = resultTitle;
  title.style.color = isCorrect ? "#36d69a" : "#ff8585";

  const body = document.createElement("p");
  body.textContent = explanationText;
  body.style.marginTop = "10px";

  explanation.append(title, body);
  explanation.classList.remove("hidden");

  document.getElementById("nextQuestionBtn").classList.remove("hidden");
}

/* ==========================================
   NEXT QUESTION
========================================== */

document.getElementById("nextQuestionBtn").addEventListener(
  "click",
  () => {
    MCQVerse.currentQuestion++;
    renderQuestion();
  }
);

/* ==========================================
   QUIZ RESULT
========================================== */

function showQuizResult() {
  const quizSection = document.getElementById("quizSection");

  const total = MCQVerse.questions.length;
  const correct = MCQVerse.correctAnswers;
  const percentage = total
    ? Math.round((correct / total) * 100)
    : 0;

  quizSection.innerHTML = `
    <div class="quiz-card" style="text-align:center">
      <div style="font-size:55px">🏆</div>

      <h2 style="color:#e6bd65;margin:20px 0">
        Quiz Completed!
      </h2>

      <h1 style="font-size:45px">${percentage}%</h1>

      <p style="color:#9aafa4;margin:15px 0">
        Correct Answers: ${correct} / ${total}
      </p>

      <button class="primary-btn" onclick="restartQuiz()">
        Practice Again →
      </button>

      <br>

      <button class="back-btn" style="margin-top:20px"
        onclick="backToChapters()">
        Back to Chapters
      </button>
    </div>
  `;
}

function restartQuiz() {
  const subject = MCQVerse.subjects[MCQVerse.currentSubject];
  const chapter = MCQVerse.currentChapter;

  loadChapterFile(subject.folder, chapter)
    .then(questions => {
      MCQVerse.questions = questions;
      MCQVerse.currentQuestion = 0;
      MCQVerse.correctAnswers = 0;

      const quizSection = document.getElementById("quizSection");

      quizSection.innerHTML = `
        <button class="back-btn" onclick="backToChapters()">← Chapters</button>

        <div class="quiz-card">
          <div class="quiz-top">
            <span id="quizChapterName">Chapter</span>
            <span id="questionProgress">0 / 0</span>
          </div>

          <div class="progress-track">
            <div class="progress-fill" id="progressFill"></div>
          </div>

          <h2 id="questionText"></h2>
          <div class="options-list" id="optionsList"></div>
          <div id="explanationBox" class="explanation-box hidden"></div>
          <button class="primary-btn hidden" id="nextQuestionBtn">Next Question →</button>
        </div>
      `;

      document.getElementById("nextQuestionBtn").addEventListener(
        "click",
        () => {
          MCQVerse.currentQuestion++;
          renderQuestion();
        }
      );

      renderQuestion();
    })
    .catch(error => {
      console.error(error);
      alert("Chapter load করা যায়নি।");
    });
}

/* ==========================================
   BACK NAVIGATION
========================================== */

function backToSubjects() {
  showSubjects();
}

function backToChapters() {
  document.getElementById("quizSection").classList.add("hidden");
  document.getElementById("chapterSection").classList.remove("hidden");

  document.getElementById("chapterSection").scrollIntoView({
    behavior: "smooth"
  });
}

/* ==========================================
   THEME TOGGLE
========================================== */

document.getElementById("themeToggle").addEventListener(
  "click",
  () => {
    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");

    localStorage.setItem("mcqVerseTheme", isLight ? "light" : "dark");
  }
);

if (localStorage.getItem("mcqVerseTheme") === "light") {
  document.body.classList.add("light-mode");
}

/* ==========================================
   ANIMATED NETWORK BACKGROUND
========================================== */

(() => {
  const canvas = document.getElementById("networkBackground");
  const ctx = canvas.getContext("2d");

  let width;
  let height;
  let particles = [];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticles();
  }

  function createParticles() {
    const count = Math.min(
      Math.floor((width * height) / 14000),
      85
    );

    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      radius: Math.random() * 2 + .7
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, i) => {
      if (!reducedMotion) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      ctx.fillStyle = "rgba(230, 189, 101, .65)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];

        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 125) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);

          ctx.strokeStyle =
            `rgba(54, 214, 154, ${.13 * (1 - distance / 125)})`;

          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    });

    if (!reducedMotion) {
      requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  draw();
})();

/* ==========================================
   INITIALIZATION
========================================== */

updateStats();

document.getElementById("totalQuestions").textContent = "0";

console.log("MCQ VERSE Engine Loaded Successfully!");
