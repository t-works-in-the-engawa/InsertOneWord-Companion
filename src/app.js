import { words } from "./words.js";
import { state } from "./state.js";
import { getNextWord } from "./logic.js";
import { loadStatus, saveStatus, updateVisit } from "./storage.js";

const wordEl = document.getElementById("word");
const answerEl = document.getElementById("answer");

const btnKnown = document.getElementById("known");
const btnUnknown = document.getElementById("unknown");
const btnReset = document.getElementById("reset");

const timerBar = document.getElementById("timer-bar");

init();

function init() {
  state.wordStatus = loadStatus() || {};
  cleanupStatus();
  state.visitInfo = updateVisit();

  btnReset.style.display = "none";
  disableButtons(); // 最初は押せない
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

  const isReverse = w.dir === "jp-en";
  const first = isReverse ? w.ja : w.en;
  const second = isReverse ? w.en : w.ja;

  wordEl.textContent = "";
  answerEl.textContent = "";
  // 完了画面用クラスを削除
  wordEl.classList.remove("completed-en");
  answerEl.classList.remove("completed-ja");
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

  // 後出し
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

  // 選択可能
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

  btnKnown.classList.add("flash");
  btnUnknown.classList.add("flash");

  setTimeout(() => {
    btnKnown.classList.remove("flash");
    btnUnknown.classList.remove("flash");
  }, 300);
}

function clearTimers() {
  state.timerIds.forEach(id => clearTimeout(id));
  state.timerIds = [];
}

function showCompletionScreen() {
  clearTimers();
  disableButtons();
  state.phase = "completed";

  wordEl.classList.remove("completed-en");
  answerEl.classList.remove("completed-ja");

  wordEl.innerHTML =
    "🎉 All words completed!<br>" +
    "You will see new words when they are added.";
  wordEl.classList.add("reveal", "completed-en");

  timerBar.style.width = "100%";

  answerEl.innerHTML =
    "🎉 全単語クリア！<br>" +
    "新しい単語が追加されると表示されます。";
  answerEl.classList.add("reveal", "completed-ja");

  // 通常ボタンを隠す
  document.getElementById("buttons").style.display = "none";

  // リセットボタンだけ表示
  btnReset.style.display = "inline-block";
}

function resetProgress() {
  state.wordStatus = {};
  saveStatus(state.wordStatus);

  // ボタン表示戻す
  document.getElementById("buttons").style.display = "flex";
  btnReset.style.display = "none";

  nextWord();
}

function cleanupStatus() {
  const validIds = new Set(words.map(w => w.id));

  Object.keys(state.wordStatus).forEach(id => {
    if (!validIds.has(Number(id))) {
      delete state.wordStatus[id];
    }
  });

  saveStatus(state.wordStatus);
}

// ボタン処理
btnKnown.onclick = () => {
  if (state.phase !== "decision") return;

  state.wordStatus[state.currentWord.id] = "known";
  saveStatus(state.wordStatus);

  const allKnown = words.every(
    w => state.wordStatus[w.id] === "known"
  );

  if (allKnown) {
    showCompletionScreen();
    return; // ← ここ重要
  }

  nextWord();
};

btnUnknown.onclick = () => {
  if (state.phase !== "decision") return;
  state.wordStatus[state.currentWord.id] = "unknown";
  saveStatus(state.wordStatus);
  nextWord();
};

// リセットボタン
btnReset.onclick = resetProgress;

// サービスワーカー
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}
