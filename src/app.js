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
  state.currentWord = getNextWord(words, state.wordStatus);
  render();
}

function render() {
  const w = state.currentWord;
  enEl.textContent = w.en;
  jaEl.textContent = w.ja;
  videoLink.href = w.video;
}

btnKnown.onclick = () => {
  state.wordStatus[state.currentWord.id] = "known";
  saveStatus(state.wordStatus);
  nextWord();
};

btnUnknown.onclick = () => {
  state.wordStatus[state.currentWord.id] = "unknown";
  saveStatus(state.wordStatus);
  nextWord();
};

btnNext.onclick = nextWord;

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
}
