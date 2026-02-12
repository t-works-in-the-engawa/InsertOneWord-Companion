const STATUS_KEY = "iow_status";
const VISIT_KEY = "iow_visit";

export function loadStatus() {
  return JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
}

export function saveStatus(status) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(status));
}

export function updateVisit() {
  const today = new Date().toISOString().split("T")[0];
  let visit = JSON.parse(localStorage.getItem(VISIT_KEY)) || {
    firstVisit: today,
    lastVisit: today,
    visitCount: 0
  };

  if (visit.lastVisit !== today) {
    visit.visitCount += 1;
    visit.lastVisit = today;
  }

  localStorage.setItem(VISIT_KEY, JSON.stringify(visit));
  return visit;
}
