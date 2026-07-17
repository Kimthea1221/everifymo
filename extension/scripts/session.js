
let _session = null; // null = guest, otherwise { username, email }

// Every page must call this once before rendering anything that depends on login state
function whenSessionReady(callback) {
  chrome.storage.local.get(['access_token', 'username', 'email'], (data) => {
    _session = data.access_token 
      ? { username: data.username, email: data.email, access_token: data.access_token }
      : null;
    callback();
  });
}

function isUserLoggedIn() {
  return _session !== null;
}

function getCurrentUser() {
  return _session || { username: '', email: '' };
}

// function updateUsername(newUsername, callback) {
//   if (!_session) {
//     callback(false);
//     return;
//   }

//   _session.username = newUsername;

//   getRegisteredUsers((users) => {
//     const updatedUsers = users.map(u =>
//       u.email === _session.email ? { ...u, username: newUsername } : u
//     );
//     chrome.storage.local.set(
//       { session: _session, registeredUsers: updatedUsers },
//       () => callback(true)
//     );
//   });
// }

// function deleteAccount(callback) {
//   if (!_session) {
//     callback(false);
//     return;
//   }

//   getRegisteredUsers((users) => {
//     const remainingUsers = users.filter(u => u.email !== _session.email);
//     chrome.storage.local.set({ registeredUsers: remainingUsers }, () => {
//       chrome.storage.local.remove('session', () => {
//         _session = null;
//         callback(true);
//       });
//     });
//   });
// }

// function getRegisteredUsers(callback) {
//   chrome.storage.local.get(['registeredUsers'], (data) => {
//     callback(data.registeredUsers || []);
//   });
// }

// loginUser, updateUsername, deleteAccount all stay exactly as they are —
// they were already correctly calling getRegisteredUsers, it just didn't exist yet

function registerUser(user, callback) {
  apiSignUp({ email: user.email, username: user.username, password: user.password })
      .then(() => callback(true))
      .catch(e => callback(false, e.message));
}

function loginUser(email, password, callback) {
  apiLogin(email, password)
      .then(data => {
          _session = { email, access_token: data.access_token };
          chrome.storage.local.set(
              { access_token: data.access_token, token_type: data.token_type, email },
              () => callback(true)
          );
      })
      .catch(e => callback(false, e.message));
}

function logoutUser(callback) {
  _session = null;
  chrome.storage.local.remove(['access_token', 'token_type', 'username', 'email'], callback);
}

function submitComplaint(complaints, callback) {
  const token = _session ? _session.access_token : null;

  apiSubmitComplaint({ 
    product_title: complaints.productName, 
    product_url: complaints.productUrl, 
    store_name: complaints.storeName, 
    consumer_description: complaints.description, 
    platform: complaints.platform 
  }, token)
      .then(() => callback(true))
      .catch(e => callback(false, e.message));
}