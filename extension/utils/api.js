// api.js
class UnauthorizedError extends Error {}

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

async function apiLogin(email, password) {
 
    const formBody = new URLSearchParams();
    formBody.append('username', email);
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

async function handleResponse(response) {
    if (response.status === 401) {
        throw new UnauthorizedError('Session expired. Please login once again');
    }

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.detail 
            ? (Array.isArray(data.detail) ? data.detail.map(d => d.msg).join(', ') : data.detail)
            : `Server responded ${response.status}`;
        throw new Error(message);
    }

    return response.json();
}

async function apiSubmitComplaint(complaintData, token){
  
    let headers = { 'Content-Type': 'application/json'};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/submitComplaint`, {
        method: 'POST',
        headers,
        body: JSON.stringify(complaintData)
    });

    return handleResponse(res);
}

async function apiGetComplaints(token){
    const res = await fetch(`${API_BASE}/ComplaintsHistory`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
    });

    return handleResponse(res);
}

async function apiGetStatus(token){
    
    const res = await fetch(`${API_BASE}/ComplaintStatus`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

function getComplaintsHistory() {
  return [
    {
      id: 101,
      productName: 'Miracle Glow Whitening Setting S.....',
      platform: 'Shopee',
      time: '2 hrs ago',
      link: 'shopee.ph/Miracle-Glow-Whitening-Setting-Spray',
      storeName: 'GlowBeautyPH Store',
      description: 'Packaging looked off — no FDA sticker, blurry printing.',
      attachment: null,
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    },
    {
      id: 102,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hrs ago',
      link: 'lazada.com.ph/products/miracle-glow-whitening-setting-spray',
      storeName: 'SkinLuxe Official',
      description: '',
      attachment: null,
      status: 'dismissed',
      note: 'This complaint was dismissed because the product was found to be registered under a different FDA record not yet reflected in our database at the time of the report.'
    },
    {
      id: 103,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Tiktok Shop',
      time: '2 hrs ago',
      link: 'shop.tiktok.com/miracle-glow-whitening-spray',
      storeName: 'Radiance Beauty Hub',
      description: 'Seller claims registered but listing has no FDA number.',
      attachment: null,
      status: 'dismissed',
      note: 'This complaint was dismissed because the product\'s registration is currently in process with the FDA and could not be confirmed unregistered at this time.'
    },
    {
      id: 104,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hours ago',
      link: 'lazada.com.ph/products/miracle-glow-whitening-setting-spray-60ml',
      storeName: 'SkinLuxe Official',
      description: '',
      attachment: null,
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    },
    {
      id: 105,
      productName: 'Miracle Glow Whitening Setting Spray 60ml',
      platform: 'Lazada',
      time: '2 hours ago',
      link: 'lazada.com.ph/products/miracle-glow-whitening-setting-spray-60ml-2',
      storeName: 'SkinLuxe Official',
      description: '',
      attachment: null,
      status: 'completed',
      note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
    }
  ];
}

async function apiUpdateUsername(newUsername, token) {
    
    const res = await fetch(`${API_BASE}/accounts/username`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername })
    })

    return handleResponse(res);
}

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
// MOCK DATA — COMPLAINT STATUSES (persisted via chrome.storage.local
// so it's shared across extension pages, not per-page memory)
// ================================

const DEFAULT_COMPLAINT_STATUSES = [
  {
    id: 1,
    productName: 'Miracle Glow Whitening Setting Spray 60ml',
    stage: 'takedown_requested',
    platform: 'Lazada',
    time: '3 hrs ago',
    link: 'lazada.com.ph/products/miracle-glow-whitening-setting-spray-60ml-status1',
    storeName: 'SkinLuxe Official',
    description: 'Listing has no FDA registration number visible.',
    attachment: null,
    note: 'Takedown has been requested to CIDG. Awaiting enforcement action.'
  },
  {
    id: 2,
    productName: 'Miracle Glow Whitening Setting Spray 60ml',
    stage: 'under_review',
    platform: 'Shopee',
    time: '2 hrs ago',
    link: 'shopee.ph/Miracle-Glow-Whitening-Setting-Spray-status2',
    storeName: 'GlowBeautyPH Store',
    description: 'No FDA sticker visible on packaging photos.',
    attachment: null,
    note: 'Under review by FDA enforcement team. Evidence verified.'
  },
  {
    id: 3,
    productName: 'Miracle Glow Whitening Setting Spray 60ml',
    stage: 'open',
    platform: 'Tiktok Shop',
    time: '1 hr ago',
    link: 'shop.tiktok.com/miracle-glow-whitening-spray-status3',
    storeName: 'Radiance Beauty Hub',
    description: '',
    attachment: null,
    note: 'Report received. Queued for initial review.'
  }
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
      time: 'Just now',
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

function generateOtp(email, callback) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  chrome.storage.local.set({ pendingOtp: { email, code } }, () => {
    callback(code);
  });
}

function verifyOtp(inputCode, callback) {
  chrome.storage.local.get(['pendingOtp'], (data) => {
    const pending = data.pendingOtp;
    if (!pending || inputCode !== pending.code) {
      callback(false);
      return;
    }
    chrome.storage.local.remove('pendingOtp', () => callback(true));
  });
}
