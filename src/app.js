import { words } from "./words.js";
import { state } from "./state.js";
import { getNextWord } from "./logic.js";
import { loadStatus, saveStatus, updateVisit } from "./storage.js";

const enEl = document.getElementById("word-en");
const jaEl = document.getElementById("word-ja");
const videoLink = document.getElementById("video-link");

const btnKnown = document.getElementById("btn-known");
const btnUnknown = document.getElementById("btn-unknown");
const btnNext = document.getElementById("btn-next");

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

  // まず英語だけ表示
  enEl.textContent = w.en;
  jaEl.textContent = "";
  videoLink.href = w.video;

  disableButtons();

  // 3秒後 → 日本語表示
  state.timerIds.push(setTimeout(() => {
    state.phase = "revealed";
    jaEl.textContent = w.ja;
  }, 3000));

  // 6秒後 → ボタン有効化
  state.timerIds.push(setTimeout(() => {
    state.phase = "decision";
    enableButtons();
  }, 6000));
}

function disableButtons() {
  btnKnown.disabled = true;
  btnUnknown.disabled = true;
  btnNext.disabled = true;
}

function enableButtons() {
  btnKnown.disabled = false;
  btnUnknown.disabled = false;
  btnNext.disabled = false;
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

btnNext.onclick = () => {
  if (state.phase !== "decision") return;
  nextWord();
};

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
}
