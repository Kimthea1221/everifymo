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

function updateUsername(newUsername, callback) {
  if (!_session) {
    callback(false);
    return;
  }

  _session.username = newUsername;

  getRegisteredUsers((users) => {
    const updatedUsers = users.map(u =>
      u.email === _session.email ? { ...u, username: newUsername } : u
    );
    chrome.storage.local.set(
      { session: _session, registeredUsers: updatedUsers },
      () => callback(true)
    );
  });
}

function deleteAccount(callback) {
  if (!_session) {
    callback(false);
    return;
  }

  getRegisteredUsers((users) => {
    const remainingUsers = users.filter(u => u.email !== _session.email);
    chrome.storage.local.set({ registeredUsers: remainingUsers }, () => {
      chrome.storage.local.remove('session', () => {
        _session = null;
        callback(true);
      });
    });
  });
}

function getRegisteredUsers(callback) {
  chrome.storage.local.get(['registeredUsers'], (data) => {
    callback(data.registeredUsers || []);
  });
}

// loginUser, updateUsername, deleteAccount all stay exactly as they are —
// they were already correctly calling getRegisteredUsers, it just didn't exist yet

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
    const accountExists = users.some(u => u.email === email);
    if (!accountExists) {
      callback(false, 'Account does not exist.');
      return;
    }
    const match = users.find(u => u.email === email && u.password === password);
    if (!match) {
      callback(false, 'Incorrect email or password.');
      return;
    }
    chrome.storage.local.set({ session: { username: match.username, email: match.email } }, () => callback(true));
  });
}

function logoutUser(callback) {
  chrome.storage.local.remove('session', callback);
}

// ================================
// MOCK DATA — NOTIFICATIONS
// ================================

let _notifications = [
  { id: 1, message: 'Miracle Glow Whitening Setting Spray 60ml has been completed and moved to your Complaints History.', time: 'Just now', read: false, target: { type: 'history', id: 101 } },
  { id: 2, message: 'Miracle Glow Whitening Setting Spray 60ml has been dismissed and moved to your Complaints History.', time: '1 hour ago', read: true, target: { type: 'history', id: 102 } },
  { id: 3, message: 'Miracle Glow Whitening Setting Spray 60ml is now under review.', time: '2 hours ago', read: true, target: { type: 'status', id: 2 } },
  { id: 4, message: 'Miracle Glow Whitening Setting Spray 60ml is now under review.', time: '2 hours ago', read: true, target: { type: 'status', id: 2 } },
  { id: 5, message: 'Miracle Glow Whitening Setting Spray 60ml is now under review.', time: '2 hours ago', read: true, target: { type: 'status', id: 2 } },
    { id: 6, message: 'Miracle Glow Whitening Setting Spray 60ml is now under review.', time: '2 hours ago', read: true, target: { type: 'status', id: 2 } }


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
    // {
    //   id: 101,
    //   productName: 'Miracle Glow Whitening Setting S.....',
    //   platform: 'Shopee',
    //   time: '2 hrs ago',
    //   link: 'shopee.ph/Miracle-Glow-Whitening-Setting-Spray',
    //   storeName: 'GlowBeautyPH Store',
    //   description: 'Packaging looked off — no FDA sticker, blurry printing.',
    //   attachment: null,
    //   status: 'completed',
    //   note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    // },
    // {
    //   id: 102,
    //   productName: 'Miracle Glow Whitening Setting Spray 60ml',
    //   platform: 'Lazada',
    //   time: '2 hrs ago',
    //   link: 'lazada.com.ph/products/miracle-glow-whitening-setting-spray',
    //   storeName: 'SkinLuxe Official',
    //   description: '',
    //   attachment: null,
    //   status: 'dismissed',
    //   note: 'This complaint was dismissed because the product was found to be registered under a different FDA record not yet reflected in our database at the time of the report.'
    // },
    // {
    //   id: 103,
    //   productName: 'Miracle Glow Whitening Setting Spray 60ml',
    //   platform: 'Tiktok Shop',
    //   time: '2 hrs ago',
    //   link: 'shop.tiktok.com/miracle-glow-whitening-spray',
    //   storeName: 'Radiance Beauty Hub',
    //   description: 'Seller claims registered but listing has no FDA number.',
    //   attachment: null,
    //   status: 'dismissed',
    //   note: 'This complaint was dismissed because the product\'s registration is currently in process with the FDA and could not be confirmed unregistered at this time.'
    // },
    // {
    //   id: 104,
    //   productName: 'Miracle Glow Whitening Setting Spray 60ml',
    //   platform: 'Lazada',
    //   time: '2 hours ago',
    //   link: 'lazada.com.ph/products/miracle-glow-whitening-setting-spray-60ml',
    //   storeName: 'SkinLuxe Official',
    //   description: '',
    //   attachment: null,
    //   status: 'completed',
    //   note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    // },
    // {
    //   id: 105,
    //   productName: 'Miracle Glow Whitening Setting Spray 60ml',
    //   platform: 'Lazada',
    //   time: '2 hours ago',
    //   link: 'lazada.com.ph/products/miracle-glow-whitening-setting-spray-60ml-2',
    //   storeName: 'SkinLuxe Official',
    //   description: '',
    //   attachment: null,
    //   status: 'completed',
    //   note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    // }
  ];
}

// ================================
// MOCK DATA — VERIFICATION HISTORY
// ================================

function getVerificationHistory() {
  return [
    // { id: 1, productName: 'Miracle Glow Whitening Setting S.....', platform: 'Shopee', time: '2 hrs ago', status: 'registered' },
    // { id: 2, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Lazada', time: '2 hrs ago', status: 'suspicious' },
    // { id: 3, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Tiktok Shop', time: '2 hrs ago', status: 'unregistered' },
    // { id: 4, productName: 'Miracle Glow Whitening Setting S.....', platform: 'Shopee', time: '2 hrs ago', status: 'registered' },
    // { id: 5, productName: 'Miracle Glow Whitening Setting Spray 60ml', platform: 'Lazada', time: '2 hrs ago', status: 'registered' }
  ];
}

// ================================
// MOCK DATA — COMPLAINT STATUSES (persisted via chrome.storage.local
// so it's shared across extension pages, not per-page memory)
// ================================

const DEFAULT_COMPLAINT_STATUSES = [
  // {
  //   id: 1,
  //   productName: 'Miracle Glow Whitening Setting Spray 60ml',
  //   stage: 'takedown_requested',
  //   platform: 'Lazada',
  //   link: 'lazada.com.ph/products/miracle-glow-whitening-setting-spray-60ml-status1',
  //   storeName: 'SkinLuxe Official',
  //   description: 'Listing has no FDA registration number visible.',
  //   attachment: null,
  //   note: 'Takedown has been requested to CIDG. Awaiting enforcement action.'
  // },
  // {
  //   id: 2,
  //   productName: 'Miracle Glow Whitening Setting Spray 60ml',
  //   stage: 'under_review',
  //   platform: 'Shopee',
  //   link: 'shopee.ph/Miracle-Glow-Whitening-Setting-Spray-status2',
  //   storeName: 'GlowBeautyPH Store',
  //   description: 'No FDA sticker visible on packaging photos.',
  //   attachment: null,
  //   note: 'Under review by FDA enforcement team. Evidence verified.'
  // },
  // {
  //   id: 3,
  //   productName: 'Miracle Glow Whitening Setting Spray 60ml',
  //   stage: 'open',
  //   platform: 'Tiktok Shop',
  //   link: 'shop.tiktok.com/miracle-glow-whitening-spray-status3',
  //   storeName: 'Radiance Beauty Hub',
  //   description: '',
  //   attachment: null,
  //   note: 'Report received. Queued for initial review.'
  // }
];

function getComplaintStatuses(callback) {
  chrome.storage.local.get(['complaintStatuses'], (data) => {
    if (data.complaintStatuses) {
      callback(data.complaintStatuses);
    } else {
      chrome.storage.local.set({ complaintStatuses: DEFAULT_COMPLAINT_STATUSES }, () => {
        callback(DEFAULT_COMPLAINT_STATUSES);
      });
    }
  });
}

function derivePlatformFromLink(link) {
  const lower = (link || '').toLowerCase();
  if (lower.includes('shopee')) return 'Shopee';
  if (lower.includes('lazada')) return 'Lazada';
  if (lower.includes('tiktok')) return 'Tiktok Shop';
  if (lower.includes('facebook') || lower.includes('fb.com')) return 'Facebook Marketplace';
  return 'Unknown';
}

function addComplaintToStatus(reportData, callback) {
  getComplaintStatuses((complaints) => {
    const nextId = complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1;

    const newComplaint = {
      id: nextId,
      productName: reportData.productName,
      stage: 'open',
      platform: derivePlatformFromLink(reportData.link),
      link: reportData.link,
      storeName: reportData.storeName,
      description: reportData.description || '',
      attachment: reportData.attachment || null,
      note: 'Report received. Queued for initial review.'
    };

    const updated = [newComplaint, ...complaints];
    chrome.storage.local.set({ complaintStatuses: updated }, () => {
      if (callback) callback(newComplaint);
    });
  });
}

function resetPasswordDirect(email, newPassword, callback) {
  getRegisteredUsers((users) => {
    const account = users.find(u => u.email === email);
    if (!account) {
      callback(false, 'Account does not exist.');
      return;
    }
    const updatedUsers = users.map(u =>
      u.email === email ? { ...u, password: newPassword } : u
    );
    chrome.storage.local.set({ registeredUsers: updatedUsers }, () => callback(true));
  });
}