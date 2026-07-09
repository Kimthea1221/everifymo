// header.js
document.addEventListener('DOMContentLoaded', async () => {
  whenSessionReady(async () => {
    const headerSlot = document.getElementById('header-slot');
    if (headerSlot) await loadPartial('partials/header.html', 'header-slot');

    const overlaySlot = document.getElementById('overlay-slot');
    if (overlaySlot) await loadPartial('partials/overlays.html', 'overlay-slot');

    initProfileOverlay();
    initNotifications();
    initExitButton();
    renderProfileContent();
    applyGuestHeaderVisibility(); // new — see Step 5
  });
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

function renderProfileContent() {
  const contentEl = document.getElementById('profile-content');
  if (!contentEl || typeof getCurrentUser !== 'function') return;

  const user = getCurrentUser();
  contentEl.innerHTML = `
    <p><strong>Welcome to your profile page, ${user.username}!</strong></p>
    <p>Email: ${user.email}</p>
    <p>Username: ${user.username}</p>
  `;
}

function applyGuestHeaderVisibility() {
  const loggedIn = typeof isUserLoggedIn === 'function' ? isUserLoggedIn() : false;

  const notifBtn = document.getElementById('notif-btn');
  const dropdownBtn = document.getElementById('profile-dropdown-btn');

  if (notifBtn) notifBtn.classList.toggle('hidden', !loggedIn);
  if (dropdownBtn) dropdownBtn.classList.toggle('hidden', !loggedIn);
}