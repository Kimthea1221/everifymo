document.addEventListener("DOMContentLoaded", () => {

  whenSessionReady(() => {

    chrome.storage.local.get(
      ['productTitle', 'productPlatform', 'productUrl', 'productStatus'],
      (data) => {

        // TEMPORARY HARDCODE FOR TESTING — should be remove later
        const title = 'Maybelline Fit Me Foundation';
        const url = 'shopee.ph/Maybelline-Fit-Me-Foundation';
        const status = 'unregistered'; // here are the states: 'registered', 'unregistered', 'suspicious', 'home', 'idle', 'scanning'

        chrome.storage.local.set({
          productTitle: title,
          productUrl: url,
          productStatus: status
        });

        if (status === 'registered') {
          const el = document.getElementById('product-name-registered');
          if (el) el.textContent = title;
          showState('registered');

        } else if (status === 'unregistered') {
          const el = document.getElementById('product-name-unregistered');
          if (el) el.textContent = title;
          showState('unregistered');

        } else if (status === 'suspicious') {
          const el = document.getElementById('product-name-suspicious');
          if (el) el.textContent = title;
          showState('suspicious');

        } else if (status === 'home') {
          showState('home');

        } else if (status === 'scanning') {
          showState('scanning');

        } else {
          showState('idle');
        }
      }
    );

    applyAuthView();

    // const btnReport = document.getElementById('btn-report');
    // if (btnReport) {
    //   btnReport.addEventListener('click', () => {
    //     chrome.tabs.create({ url: chrome.runtime.getURL('pages/report-complaint.html') });
    //   });
    // }

    document.querySelectorAll('.btn-report').forEach(btn => {
      btn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('pages/report-complaint.html') });
      });
    });

    document.querySelectorAll('.btn-skip').forEach(btn => {
      btn.addEventListener('click', () => window.close());
    });

    const btnSigninHeader = document.getElementById('link-sign-in-up');
    if (btnSigninHeader) {
      btnSigninHeader.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('pages/auth.html') });
      });
    }

    const btnAbout = document.getElementById('btn-about');
    if (btnAbout) {
      btnAbout.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('pages/about.html') });
      });
    }

    const btnComplaintHistory = document.getElementById('history-btn');
    if (btnComplaintHistory) {
      btnComplaintHistory.addEventListener('click', (e) => {
        if (!isUserLoggedIn()) {
          e.preventDefault();
          chrome.tabs.create({ url: chrome.runtime.getURL('pages/auth.html') });
          return;
        }
        chrome.tabs.create({ url: chrome.runtime.getURL('pages/history.html') });
      });
    }

    const btnComplaintStatus = document.getElementById('status-btn');
    if (btnComplaintStatus) {
      btnComplaintStatus.addEventListener('click', (e) => {
        if (!isUserLoggedIn()) {
          e.preventDefault();
          chrome.tabs.create({ url: chrome.runtime.getURL('pages/auth.html') });
          return;
        }
        chrome.tabs.create({ url: chrome.runtime.getURL('pages/complaint-status.html') });
      });
    }

    document.querySelectorAll('.back-to-home-btn').forEach(btn => {
      btn.addEventListener('click', () => showState('home'));
    });

    // const btnSkip = document.getElementById('btn-skip');
    // if (btnSkip) {
    //   btnSkip.addEventListener('click', () => window.close());
    // }

    const btnGuest = document.getElementById('btn-guest');
    if (btnGuest) {
      btnGuest.addEventListener('click', () => window.close());
    }

    const btnExit = document.getElementById('exit-btn');
    if (btnExit) {
      btnExit.addEventListener('click', () => window.close());
    }

  }); // end whenSessionReady

}); // end DOMContentLoaded


// --- Functions below can stay outside, since they don't touch the DOM until called ---

function showState(state) {
  const states = ['idle', 'registered', 'suspicious', 'unregistered', 'home', 'scanning'];
  states.forEach(s => {
    const el = document.getElementById(`state-${s}`);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById(`state-${state}`);
  if (target) target.classList.remove('hidden');
}

function applyAuthView() {
  const loggedIn = typeof isUserLoggedIn === 'function' ? isUserLoggedIn() : false;

  const guestBanner = document.getElementById('home-banner-guest');
  const userBanner = document.getElementById('home-banner-user');
  const complaintsBtn = document.getElementById('status-btn');
  const historyBtn = document.getElementById('history-btn');

  if (guestBanner) guestBanner.classList.toggle('hidden', loggedIn);
  if (userBanner) userBanner.classList.toggle('hidden', !loggedIn);

  [complaintsBtn, historyBtn].forEach(btn => {
    if (btn) btn.classList.toggle('btn-disabled-guest', !loggedIn);
  });

  if (loggedIn && typeof getCurrentUser === 'function') {
    const usernameEl = document.getElementById('home-username');
    if (usernameEl) usernameEl.textContent = getCurrentUser().username;
  }
}

// //auto-fill url
// document.addEventListener('DOMContentLoaded', async () => {
//     const { access_token } = await chrome.storage.local.get(['access_token']);
//     showView(access_token ? 'complaintContainer' : 'loginContainer');

//     // auto-fill shop URL field
//     try {
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
//         if (tab && tab.url && tab.url.startsWith('http')) {
//             document.getElementById('shopUrl').value = tab.url;
//         }
//     } catch (e) {
//         console.error('Could not read current tab URL:', e);
//     }
// });

// function sanitizeUrl(rawUrl) {
//     try {
//         const url = new URL(rawUrl);
//         const suspiciousPatterns = /token|session|auth|sp_atk|spm/i;
//         [...url.searchParams.keys()].forEach(key => {
//             if (suspiciousPatterns.test(key)) {
//                 url.searchParams.delete(key);
//             }
//         });
//         return url.toString();
//     } catch {
//         return rawUrl;
//     }
// }