const COMPLAINT_STATUS_LABELS = { resolved: 'RESOLVED', pending: 'PENDING', denied: 'DENIED' };
const VERIFICATION_STATUS_LABELS = { registered: 'REGISTERED', suspicious: 'SUSPICIOUS', unregistered: 'UNREGISTERED' };

const COMPLAINT_ICONS = { resolved: 'check_green_icon.png', pending: 'sus_icon.png', denied: 'x_icon.png' };
const VERIFICATION_ICONS = { registered: 'check_green_icon.png', suspicious: 'sus_icon.png', unregistered: 'x_icon.png' };

let currentHistoryTab = 'complaints';

function iconTag(status, iconMap) {
  return `<img src="../assets/images/${iconMap[status]}" alt="${status}" class="history-item-icon-img">`;
}

function renderComplaintsHistoryList() {
  const items = getComplaintsHistory();

  const counterEl = document.getElementById('resolved-counter');

  if (items.length === 0) {
    if (counterEl) counterEl.textContent = '';
    return `<p class="history-empty-text">Complaints History page is currently empty.</p>`;
  }

  const resolvedCount = items.filter(i => i.status === 'resolved').length;
  if (counterEl) counterEl.textContent = `RESOLVED: ${resolvedCount}`;

  return items.map(item => `
    <div class="history-item status-${item.status}">
      <div class="history-item-icon icon-${item.status}">${iconTag(item.status, COMPLAINT_ICONS)}</div>
      <div class="history-item-text">
        <p class="history-item-name">${item.productName}</p>
        <span class="history-item-meta">${item.platform} • ${item.time} • <a href="../pages/complaint-status.html" class="see-details-link">See Details</a></span>
      </div>
      <span class="history-item-status">${COMPLAINT_STATUS_LABELS[item.status]}</span>
    </div>
  `).join('');
}

function renderVerificationHistoryList() {
  const items = getVerificationHistory();
  const counterEl = document.getElementById('resolved-counter');
  if (counterEl) counterEl.textContent = ''; // verification tab never shows a resolved counter

  if (items.length === 0) {
    return `<p class="history-empty-text">Verification History page is currently empty.</p>`;
  }

  return items.map(item => `
    <div class="history-item status-${item.status}">
      <div class="history-item-icon icon-${item.status}">${iconTag(item.status, VERIFICATION_ICONS)}</div>
      <div class="history-item-text">
        <p class="history-item-name">${item.productName}</p>
        <span class="history-item-meta">${item.platform} • ${item.time}</span>
      </div>
      <span class="history-item-status">${VERIFICATION_STATUS_LABELS[item.status]}</span>
    </div>
  `).join('');
}

function renderHistoryList() {
  const listEl = document.getElementById('history-list');
  if (!listEl) return;

  listEl.innerHTML = currentHistoryTab === 'complaints'
    ? renderComplaintsHistoryList()
    : renderVerificationHistoryList();
}

function switchHistoryTab(tab) {
  currentHistoryTab = tab;
  document.querySelectorAll('.history-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  renderHistoryList();
}

function renderHistoryPage() {
  const emptyView = document.getElementById('history-empty-view');
  const populatedView = document.getElementById('history-populated-view');
  const emptyText = document.getElementById('history-empty-text-main');

  // Guest check takes priority over data — a guest never has tracked history,
  // regardless of what the mock arrays contain
  const isGuest = typeof isUserLoggedIn === 'function' ? !isUserLoggedIn() : false;

  if (isGuest) {
    if (emptyText) emptyText.textContent = 'No contents to show. Sign in/up for tracking.';
    if (emptyView) emptyView.classList.remove('hidden');
    if (populatedView) populatedView.classList.add('hidden');
    return;
  }

  const complaints = getComplaintsHistory();
  const verification = getVerificationHistory();
  const hasNoDataAtAll = complaints.length === 0 && verification.length === 0;

  if (hasNoDataAtAll) {
    if (emptyText) emptyText.textContent = 'History page is currently empty.';
    if (emptyView) emptyView.classList.remove('hidden');
    if (populatedView) populatedView.classList.add('hidden');
    return;
  }

  if (emptyView) emptyView.classList.add('hidden');
  if (populatedView) populatedView.classList.remove('hidden');

  document.querySelectorAll('.history-tab').forEach(btn => {
    btn.addEventListener('click', () => switchHistoryTab(btn.dataset.tab));
  });

  renderHistoryList();
}

document.addEventListener('DOMContentLoaded', () => {
  whenSessionReady(() => {
    renderHistoryPage();
  });
});