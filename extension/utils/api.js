// api.js

//login/signup to backend
const API_BASE = 'http://localhost:8000'; // will be changed to real url during development (same with in the manifest)

async function apiSignUp({ email, username, password }){
  
    const res = await fetch(`${API_BASE}/accounts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    });

    const data = await res.json();

    if (!res.ok) {
        const message = Array.isArray(data.detail) 
            ? data.detail.map(d => d.msg).join(', ') : data.detail;
        throw new Error(message);
    }

    return data;
}

async function apiLogin(username, password) {
 
    const formBody = new URLSearchParams();
    formBody.append('username', username);
    formBody.append('password', password);

    const res = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
    }

    return data;
}

async function apiSubmitComplaint(complaintData, token){
  
    let headers = { 'Content-Type': 'application/json'};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/submitComplaint`, {
        method: 'POST',
        headers,
        body: JSON.stringify(complaintData)
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server responded ${res.status}: ${errText}`);
    }

    return res.json();
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
    {
      id: 101,
      productName: 'Miracle Glow Whitening Setting S.....',
      platform: 'Shopee',
      time: '2 hrs ago',
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    },
    {
      id: 102,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hrs ago',
      status: 'dismissed',
      note: 'This complaint was dismissed because the product was found to be registered under a different FDA record not yet reflected in our database at the time of the report.'
    },
    {
      id: 103,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Tiktok Shop',
      time: '2 hrs ago',
      status: 'dismissed',
      note: 'This complaint was dismissed because the product\'s registration is currently in process with the FDA and could not be confirmed unregistered at this time.'
    },
    {
      id: 104,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hours ago',
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    },
    {
      id: 105,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hours ago',
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    }
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

function getComplaintsHistory() {
  return [
    {
      id: 101,
      productName: 'Miracle Glow Whitening Setting S.....',
      platform: 'Shopee',
      time: '2 hrs ago',
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    },
    {
      id: 102,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hrs ago',
      status: 'dismissed',
      note: 'This complaint was dismissed because the product was found to be registered under a different FDA record not yet reflected in our database at the time of the report.'
    },
    {
      id: 103,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Tiktok Shop',
      time: '2 hrs ago',
      status: 'dismissed',
      note: 'This complaint was dismissed because the product\'s registration is currently in process with the FDA and could not be confirmed unregistered at this time.'
    },
    {
      id: 104,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hours ago',
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    },
    {
      id: 105,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hours ago',
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    }
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
      stage: 'takedown_requested', // 'open' | 'under_review' | 'takedown_requested'
      note: 'Takedown has been requested to CIDG. Awaiting enforcement action.'
    },
    {
      id: 2,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      stage: 'under_review',
      note: 'Under review by FDA enforcement team. Evidence verified.'
    },
    {
      id: 3,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      stage: 'open',
      note: 'Report received. Queued for initial review.'
    }
  ];
}