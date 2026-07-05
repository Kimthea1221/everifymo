document.addEventListener("DOMContentLoaded", () => {

  chrome.storage.local.get(
    ['productTitle', 'productPlatform', 'productUrl', 'productStatus'],
    (data) => {

      // TEMPORARY HARDCODE FOR TESTING — remove later
      const title = 'Maybelline Fit Me Foundation';
      const url = 'shopee.ph/Maybelline-Fit-Me-Foundation';
      const status = 'unregistered'; // change to: 'registered', 'unregistered', 'suspicious', 'home', 'idle', 'scanning'

       // Write the same test data into storage so report-complaint.html
      // (opened in a new tab) reads consistent values
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
      }

      else {
        showState('idle');
      }
    }
  );

  function showReportView(viewId) {
  const views = document.querySelectorAll('.report-view');
  views.forEach(view => {
    view.classList.toggle('hidden', view.id !== viewId);
  });
}

  const btnReport = document.getElementById('btn-report');
  if (btnReport) {
    btnReport.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/report-complaint.html') });
    });
  }

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
    btnComplaintHistory.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/history.html') });
    });
  }

  const btnSkip = document.getElementById('btn-skip');
  if (btnSkip) {
    btnSkip.addEventListener('click', () => window.close());
  }

});

const btnGuest = document.getElementById('btn-guest');
if (btnGuest) {
  btnGuest.addEventListener('click', () => {
    window.close(); // closes the tab, returns to extension
  });
}

const btnExit = document.getElementById('exit-btn');
if (btnExit) {
  btnExit.addEventListener('click', () => {
    window.close(); // closes the tab, returns to extension
  });
}

function showState(state) {
  const states = ['idle', 'registered', 'suspicious', 'unregistered', 'home', 'scanning'];
  states.forEach(s => {
    const el = document.getElementById(`state-${s}`);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById(`state-${state}`);
  if (target) target.classList.remove('hidden');
}