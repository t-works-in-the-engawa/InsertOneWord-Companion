import { words } from "./words.js";
import { state } from "./state.js";
import { getNextWord } from "./logic.js";
import { loadStatus, saveStatus, updateVisit } from "./storage.js";

const wordEl = document.getElementById("word");
const answerEl = document.getElementById("answer");

const btnKnown = document.getElementById("known");
const btnUnknown = document.getElementById("unknown");

init();

function init() {
  state.wordStatus = loadStatus();
  state.visitInfo = updateVisit();
  nextWord();
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

  // 英語表示
  wordEl.textContent = w.en;

  // 日本語は隠す
  answerEl.textContent = "";
  answerEl.classList.remove("show");

  disableButtons();

  // 3秒後に答え表示
  state.timerIds.push(setTimeout(() => {
    state.phase = "revealed";
    answerEl.textContent = w.ja;
    answerEl.classList.add("show");
  }, 3000));

  // 6秒後にボタン有効化
  state.timerIds.push(setTimeout(() => {
    state.phase = "decision";
    enableButtons();
  }, 6000));
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
