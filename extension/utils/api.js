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

async function handleResponse(response) {
    if (response.status === 401) {
        throw new UnauthorizedError('Session expired. Please login once again');
    }

    if (!response.ok){
        let error = await response.text();
        throw new Errror(`Server responded ${response.status}: ${error}`);
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


// function apiGetComplaints(token) {
//   return [
//     {
//       id: 101,
//       productName: 'Miracle Glow Whitening Setting S.....',
//       platform: 'Shopee',
//       time: '2 hrs ago',
//       status: 'completed',
//       note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
//     },
//     {
//       id: 102,
//       productName: 'Miracle Glow Whitening Setting Spray 60ml',
//       platform: 'Lazada',
//       time: '2 hrs ago',
//       status: 'dismissed',
//       note: 'This complaint was dismissed because the product was found to be registered under a different FDA record not yet reflected in our database at the time of the report.'
//     },
//     {
//       id: 103,
//       productName: 'Miracle Glow Whitening Setting Spray 60ml',
//       platform: 'Tiktok Shop',
//       time: '2 hrs ago',
//       status: 'dismissed',
//       note: 'This complaint was dismissed because the product\'s registration is currently in process with the FDA and could not be confirmed unregistered at this time.'
//     },
//     {
//       id: 104,
//       productName: 'Miracle Glow Whitening Setting Spray 60ml',
//       platform: 'Lazada',
//       time: '2 hours ago',
//       status: 'completed',
//       note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
//     },
//     {
//       id: 105,
//       productName: 'Miracle Glow Whitening Setting Spray 60ml',
//       platform: 'Lazada',
//       time: '2 hours ago',
//       status: 'completed',
//       note: 'This complaint has been completed. The seller listing was taken down following FDA enforcement action.'
//     }
//   ];
// }