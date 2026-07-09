// In js/status.js

const STAGE_ORDER = ['received', 'reviewing', 'acted_upon'];
const STAGE_LABELS = { received: 'RECEIVED', reviewing: 'REVIEWING', acted_upon: 'ACTED UPON' };
const STEP_LABELS = ['Recieved', 'Reviewing', 'Acted Upon'];

function renderComplaintCard(complaint) {
  const currentIndex = STAGE_ORDER.indexOf(complaint.stage);
  const isFinalStage = complaint.stage === 'acted_upon';

  let trackHtml = '';

  STEP_LABELS.forEach((label, i) => {
    const isComplete = i < currentIndex || (isFinalStage && i === currentIndex);
    let circleClass = 'step-upcoming';
    let circleContent = i + 1;

    if (isComplete) {
      circleClass = 'step-complete';
      circleContent = '✓';
    } else if (i === currentIndex) {
      circleClass = 'step-current';
      circleContent = i + 1;
    }

    trackHtml += `
      <div class="step">
        <div class="step-circle ${circleClass}">${circleContent}</div>
        <span class="step-label">${label}</span>
      </div>
    `;

    // Add a connector after every step except the last one
    if (i < STEP_LABELS.length - 1) {
      const connectorClass = i < currentIndex ? 'connector-complete' : '';
      trackHtml += `<div class="step-connector ${connectorClass}"></div>`;
    }
  });

  const badgeClass = `badge-${complaint.stage.replace('_', '-')}`;

  return `
    <div class="status-card">
      <div class="status-card-top">
        <h3 class="status-product-name">${complaint.productName}</h3>
        <span class="status-badge ${badgeClass}">${STAGE_LABELS[complaint.stage]}</span>
      </div>
      <div class="progress-track">${trackHtml}</div>
      <p class="status-note">${complaint.note}</p>
    </div>
  `;
}

function renderComplaintStatusPage() {
  const emptyView = document.getElementById('status-empty-view');
  const populatedView = document.getElementById('status-populated-view');
  const emptyText = document.getElementById('status-empty-text-main');

  const isGuest = typeof isUserLoggedIn === 'function' ? !isUserLoggedIn() : false;

  if (isGuest) {
    if (emptyText) emptyText.textContent = 'No contents to show. Sign in/up for tracking.';
    if (emptyView) emptyView.classList.remove('hidden');
    if (populatedView) populatedView.classList.add('hidden');
    return;
  }

  const complaints = getComplaintStatuses();
  if (!complaints || complaints.length === 0) {
    if (emptyText) emptyText.textContent = 'Complaint Status page is currently empty.';
    if (emptyView) emptyView.classList.remove('hidden');
    if (populatedView) populatedView.classList.add('hidden');
    return;
  }

  if (emptyView) emptyView.classList.add('hidden');
  if (populatedView) populatedView.classList.remove('hidden');
  const listEl = document.getElementById('status-list');
  if (listEl) listEl.innerHTML = complaints.map(renderComplaintCard).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  whenSessionReady(() => {
    renderComplaintStatusPage();
  });
});