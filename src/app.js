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

  // 先に表示する内容
  const isReverse = w.dir === "jp-en";
  const first = isReverse ? w.ja : w.en;
  const second = isReverse ? w.en : w.ja;

  // 表示クリア
  wordEl.textContent = "";
  answerEl.textContent = "";
  wordEl.classList.remove("reveal");
  answerEl.classList.remove("reveal");

  disableButtons();

  // 先出し
  if (isReverse) {
    answerEl.textContent = first;
    answerEl.classList.add("reveal");
  } else {
    wordEl.textContent = first;
    wordEl.classList.add("reveal");
  }

  // 後出し（3秒後）
  startCountdown(3000, () => {
    state.phase = "revealed";
    if (isReverse) {
      wordEl.textContent = second;
      wordEl.classList.add("reveal");
    } else {
      answerEl.textContent = second;
      answerEl.classList.add("reveal");
    }
  });

  // 選択可能（6秒後）
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
