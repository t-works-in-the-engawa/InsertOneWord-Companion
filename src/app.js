import { words } from "./words.js";
import { state } from "./state.js";
import { getNextWord } from "./logic.js";
import { loadStatus, saveStatus, updateVisit } from "./storage.js";

const wordEl = document.getElementById("word");
const answerEl = document.getElementById("answer");

const btnKnown = document.getElementById("known");
const btnUnknown = document.getElementById("unknown");

const timerBar = document.getElementById("timer-bar");

init();

function init() {
  state.wordStatus = loadStatus();
  state.visitInfo = updateVisit();

  disableButtons(); // 最初は押せない
  
  const urlParams = new URLSearchParams(window.location.search);
  const wordParam = urlParams.get("word");

  if (wordParam) {
    const found = words.find(
      w => w.en.toLowerCase() === wordParam.toLowerCase()
    );
    if (found) {
      state.currentWord = found;
      startRound();
    } else {
      nextWord();
    }
  } else {
    nextWord();
  }

  registerServiceWorker();
}

function nextWord() {
  clearTimers();
  state.currentWord = getNextWord(words, state.wordStatus);
  startRound();
}

function startRound() {
  const w = state.currentWord;

  state.phase = "thinking";

  // 初期化
  wordEl.textContent = "";
  answerEl.textContent = "";
  const container = document.querySelector('.flash-card-container');
  container.classList.remove('flip', 'tilt');
  answerEl.classList.remove('show');
  disableButtons();

  const isReverse = w.dir === "jp-en";
  const first = isReverse ? w.ja : w.en;
  const second = isReverse ? w.en : w.ja;

  // 先出し
  if (isReverse) {
    answerEl.textContent = first;
    wordEl.textContent = "";
  } else {
    wordEl.textContent = first;
    answerEl.textContent = "";
  }

  // タイマーで後出し・フリップ・傾き
  startCountdown(3000, () => {
    state.phase = "revealed";
    if (isReverse) {
      wordEl.textContent = second;
      container.classList.add('flip', 'tilt');
    } else {
      answerEl.textContent = second;
      container.classList.add('flip', 'tilt');
      answerEl.classList.add("show");
    }
  });

  state.timerIds.push(setTimeout(() => {
    state.phase = "decision";
    enableButtons();
  }, 6000));
}

function startCountdown(duration, onComplete) {
  const startTime = Date.now();
  timerBar.style.width = "100%";

  function animate() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, duration - elapsed);
    const percent = (remaining / duration) * 100;

    timerBar.style.width = percent + "%";

    if (remaining > 0) {
      requestAnimationFrame(animate);
    } else {
      onComplete();
    }
  }

  animate();
}

function disableButtons() {
  btnKnown.disabled = true;
  btnUnknown.disabled = true;
}

function enableButtons() {
  btnKnown.disabled = false;
  btnUnknown.disabled = false;

  // 跳ねるアニメーション
  btnKnown.classList.add("flash");
  btnUnknown.classList.add("flash");

  setTimeout(() => {
    btnKnown.classList.remove("flash");
    btnUnknown.classList.remove("flash");
  }, 300); // animation-duration に合わせる
}

function clearTimers() {
  state.timerIds.forEach(id => clearTimeout(id));
  state.timerIds = [];
}

btnKnown.onclick = () => {
  if (state.phase !== "decision") return;

  state.wordStatus[state.currentWord.id] = "known";
  saveStatus(state.wordStatus);
  nextWord();
};

btnUnknown.onclick = () => {
  if (state.phase !== "decision") return;

  state.wordStatus[state.currentWord.id] = "unknown";
  saveStatus(state.wordStatus);
  nextWord();
};

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}
