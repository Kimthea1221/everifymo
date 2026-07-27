// report.js
function showReportView(viewId) {
  const views = document.querySelectorAll('.report-view, .report-view-guest');
  views.forEach(view => {
    view.classList.toggle('hidden', view.id !== viewId);
  });
}

function populateDetectedProduct(title, url) {
  ['report-form-view', 'report-form-view-guest'].forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const nameEl = container.querySelector('#complaint-product-name');
    const urlEl = container.querySelector('#complaint-product-url');
    if (nameEl) nameEl.value = title;
    if (urlEl) urlEl.value = url;
  });
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
        const reader = new FileReader();

        reader.onload = () => {
          let previewImg = attachBox.querySelector('.attach-preview-img');
          if (!previewImg) {
            previewImg = document.createElement('img');
            previewImg.className = 'attach-preview-img';
            attachBox.appendChild(previewImg);
          }
          previewImg.src = reader.result; // data URL — portable across chrome.storage.local and other pages

          if (attachText) attachText.classList.add('hidden');
          if (uploadIcon) uploadIcon.classList.add('hidden');
        };

        reader.readAsDataURL(file);
      }
    });
  });
}

function collectReportFormData(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const productName = container.querySelector('#complaint-product-name')?.value.trim() || '';
  const link = container.querySelector('#complaint-product-url')?.value.trim() || '';
  const storeName = container.querySelector('#store-name')?.value.trim() || '';
  const description = container.querySelector('#complaint-description')?.value.trim() || '';
  const previewImg = container.querySelector('.attach-preview-img');
  const attachment = previewImg ? previewImg.src : null; // demo-only object URL; not persisted past this session

  return { productName, link, storeName, description, attachment };
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

        if (!isGuest) {
          const reportData = collectReportFormData('report-form-view');
          if (reportData && reportData.productName) {
            addComplaintToStatus(reportData, () => {
              showReportView('report-success-view');
            });
            return;
          }
        }

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