// api.js

let _session = null; // null = guest, otherwise { username, email }

// Every page must call this once before rendering anything that depends on login state
function whenSessionReady(callback) {
  chrome.storage.local.get(['session'], (data) => {
    _session = data.session || null;
    callback();
  });
}

function isUserLoggedIn() {
  return _session !== null;
}

function getCurrentUser() {
  return _session || { username: '', email: '' };
}

function getRegisteredUsers(callback) {
  chrome.storage.local.get(['registeredUsers'], (data) => {
    callback(data.registeredUsers || []);
  });
}

function registerUser(user, callback) {
  getRegisteredUsers((users) => {
    const alreadyExists = users.some(u => u.email === user.email);
    if (alreadyExists) {
      callback(false, 'An account with this email already exists.');
      return;
    }
    users.push(user);
    chrome.storage.local.set(
      { registeredUsers: users, session: { username: user.username, email: user.email } },
      () => callback(true)
    );
  });
}

function loginUser(email, password, callback) {
  getRegisteredUsers((users) => {
    const match = users.find(u => u.email === email && u.password === password);
    if (!match) {
      callback(false);
      return;
    }
    chrome.storage.local.set(
      { session: { username: match.username, email: match.email } },
      () => callback(true)
    );
  });
}

function logoutUser(callback) {
  chrome.storage.local.remove('session', callback);
}

// ================================
// MOCK DATA — NOTIFICATIONS
// ================================

let _notifications = [
  { id: 1, message: 'Miracle Glow Whitening Setting Spray 60ml has been resolved.', time: 'Just now', read: false },
  { id: 2, message: 'Miracle Glow Whitening Setting Spray 60ml has been denied.', time: '1 hour ago', read: true },
  { id: 3, message: 'Miracle Glow Whitening Setting Spray 60ml is now being reviewed.', time: '2 hours ago', read: true }
];

function getNotifications() {
  return _notifications;
}

function markAllNotificationsRead() {
  _notifications.forEach(n => n.read = true);
}

// ================================
// MOCK DATA — COMPLAINTS HISTORY
// ================================

function getComplaintsHistory() {
  return [
    { id: 1, productName: 'Miracle Glow Whitening Setting S.....', platform: 'Shopee', time: '2 hrs ago', status: 'resolved' },
    { id: 2, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Lazada', time: '2 hrs ago', status: 'pending' },
    { id: 3, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Tiktok Shop', time: '2 hrs ago', status: 'pending' },
    { id: 4, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Lazada', time: '2 hours ago', status: 'denied' },
    { id: 5, productName: 'Miracle Glow Whitening Setting S.....', platform: 'Shopee', time: '2 hrs ago', status: 'resolved' }
  ];
}

// ================================
// MOCK DATA — VERIFICATION HISTORY
// ================================

function getVerificationHistory() {
  return [
    { id: 1, productName: 'Miracle Glow Whitening Setting S.....', platform: 'Shopee', time: '2 hrs ago', status: 'registered' },
    { id: 2, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Lazada', time: '2 hrs ago', status: 'suspicious' },
    { id: 3, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Tiktok Shop', time: '2 hrs ago', status: 'unregistered' },
    { id: 4, productName: 'Miracle Glow Whitening Setting S.....', platform: 'Shopee', time: '2 hrs ago', status: 'registered' },
    { id: 5, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Lazada', time: '2 hrs ago', status: 'registered' }
  ];
}

// ================================
// MOCK DATA — COMPLAINT STATUSES
// ================================

function getComplaintStatuses() {
  return [
    {
      id: 1,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      stage: 'acted_upon', // 'received' | 'reviewing' | 'acted_upon'
      note: 'FDA issued takedown notice to seller. Listing removed from Shopee on May 17.'
    },
    {
      id: 2,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      stage: 'reviewing',
      note: 'Under review by FDA enforcement team. Evidence verified.'
    },
    {
      id: 3,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      stage: 'received',
      note: 'Report received. Queued for initial review.'
    }
  ];
}