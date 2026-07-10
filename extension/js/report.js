// report.js
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

function initAttachBoxes() {
  document.querySelectorAll('.report-attach-box').forEach(attachBox => {
    const attachInput = attachBox.querySelector('.report-attach-input');
    const attachText = attachBox.querySelector('.report-attach-text');
    const uploadIcon = attachBox.querySelector('.report-upload-icon');

    if (!attachInput) return;

    attachBox.addEventListener('click', () => attachInput.click());

    attachInput.addEventListener('change', () => {
      if (attachInput.files.length > 0) {
        const file = attachInput.files[0];

        let previewImg = attachBox.querySelector('.attach-preview-img');
        if (!previewImg) {
          previewImg = document.createElement('img');
          previewImg.className = 'attach-preview-img';
          attachBox.appendChild(previewImg);
        }
        previewImg.src = URL.createObjectURL(file);

        if (attachText) attachText.classList.add('hidden');
        if (uploadIcon) uploadIcon.classList.add('hidden');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  whenSessionReady(() => {
     initAttachBoxes();

    document.querySelectorAll('.report-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isGuest = !isUserLoggedIn();
        showReportView(isGuest ? 'report-cancelled-view-guest' : 'report-cancelled-view');
      });
    });

    document.querySelectorAll('.report-submit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isGuest = !isUserLoggedIn();
        showReportView(isGuest ? 'report-success-view-guest' : 'report-success-view');
      });
    });

    applyAuthView();

    chrome.storage.local.get(
      ['productTitle', 'productUrl', 'productStatus'],
      (data) => {
        const isGuest = !isUserLoggedIn();
        const status = data.productStatus;

        if (status === 'unregistered' || status === 'registered' || status === 'suspicious') {
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

