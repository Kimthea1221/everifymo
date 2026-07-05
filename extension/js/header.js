document.addEventListener('DOMContentLoaded', async () => {
  // Only runs on pages that actually have a header-slot placeholder
  const headerSlot = document.getElementById('header-slot');
  if (headerSlot) {
    await loadPartial('partials/header.html', 'header-slot');
  }

  // Overlays are needed by both the shared header AND about.html's custom header,
  // so load them whenever an overlay-slot exists, regardless of which header is present
  const overlaySlot = document.getElementById('overlay-slot');
  if (overlaySlot) {
    await loadPartial('partials/overlays.html', 'overlay-slot');
  }

  initProfileOverlay();
  initNotifications();
  initExitButton();
});

function initProfileOverlay() {
  const dropdownBtn = document.getElementById('profile-dropdown-btn');
  const profileOverlay = document.getElementById('profile-overlay');
  const notifOverlay = document.getElementById('notification-overlay');
  const pageContent = document.getElementById('blur-target');
  const dropdownImg = dropdownBtn ? dropdownBtn.querySelector('img') : null;

  if (!dropdownBtn || !profileOverlay) return;

  dropdownBtn.addEventListener('click', () => {
    if (notifOverlay) notifOverlay.classList.remove('visible');

    const isOpen = profileOverlay.classList.toggle('visible');
    if (pageContent) pageContent.classList.toggle('blurred', isOpen);
    if (dropdownImg) dropdownImg.classList.toggle('open', isOpen); // flips the arrow image
  });
}

function initNotifications() {
  const notifBtn = document.getElementById('notif-btn');
  const notifOverlay = document.getElementById('notification-overlay');
  const profileOverlay = document.getElementById('profile-overlay');
  const pageContent = document.getElementById('blur-target');
  const badgeDot = document.getElementById('notif-badge');

  if (!notifBtn || !notifOverlay) return;

  notifBtn.addEventListener('click', () => {
    if (profileOverlay) profileOverlay.classList.remove('visible');
    const isOpen = notifOverlay.classList.toggle('visible');
    if (pageContent) pageContent.classList.toggle('blurred', isOpen);
  });

  renderNotifications();

  const markAllBtn = document.getElementById('mark-all-read');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', (e) => {
      e.preventDefault(); // stops the <a href="#"> from jumping the page to the top
      markAllNotificationsRead();
      renderNotifications(); // re-render so items visually update to "read" style
      updateNotifBadge();
    });
  }

  updateNotifBadge();
}

function renderNotifications() {
  const listEl = document.getElementById('notification-list');
  if (!listEl || typeof getNotifications !== 'function') return;

  const notifications = getNotifications();

  listEl.innerHTML = notifications.map(n => `
    <div class="notification-item ${n.read ? '' : 'unread'}">
      <p class="notification-message">${n.message}</p>
      <span class="notification-time">${n.time}</span>
    </div>
  `).join('');
}

function updateNotifBadge() {
  const badgeDot = document.getElementById('notif-badge');
  if (!badgeDot || typeof getNotifications !== 'function') return;

  const notifications = getNotifications();
  const hasUnread = notifications.some(n => !n.read);
  badgeDot.classList.toggle('hidden', !hasUnread);
}

function initExitButton() {
  const exitBtn = document.getElementById('exit-btn');
  if (!exitBtn) return;

  exitBtn.addEventListener('click', () => {
    window.close();
  });
}