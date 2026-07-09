function showReportView(viewId) {
  const views = document.querySelectorAll('.report-view, .report-view-guest');
  views.forEach(view => {
    view.classList.toggle('hidden', view.id !== viewId);
  });
}

function populateDetectedProduct(title, url) {
  const nameEl = document.getElementById('complaint-product-name');
  const urlEl = document.getElementById('complaint-product-url');
  if (nameEl) nameEl.textContent = title;
  if (urlEl) urlEl.textContent = url;
}

document.addEventListener('DOMContentLoaded', () => {
  whenSessionReady(() => {
    const cancelBtn = document.getElementById('cancel-btn');
    const submitBtn = document.getElementById('submit-report-btn');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        showReportView('report-cancelled-view');
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        showReportView('report-success-view');
      });
    }

    applyAuthView();

    chrome.storage.local.get(
      ['productTitle', 'productUrl', 'productStatus'],
      (data) => {
        const isGuest = !isUserLoggedIn(); // real check, not hardcoded

        if (data.productStatus === 'unregistered') {
          populateDetectedProduct(data.productTitle, data.productUrl);
          showReportView(isGuest ? 'report-form-view-guest' : 'report-form-view');
        } else {
          showReportView(isGuest ? 'report-default-view-guest' : 'report-default-view');
        }
      }
    );
  });
});

function applyAuthView() {
  const loggedIn = typeof isUserLoggedIn === 'function' ? isUserLoggedIn() : false;

  if (loggedIn && typeof getCurrentUser === 'function') {
    const usernameEl = document.getElementById('home-username');
    if (usernameEl) usernameEl.textContent = getCurrentUser().username;
  }
}