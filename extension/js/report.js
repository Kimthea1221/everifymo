function showReportView(viewId) {
  // Hides every view (both signed-in and guest sets), then shows only the matching one
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

  // Decide which view to show on load, based on real detection data
  chrome.storage.local.get(
    ['productTitle', 'productUrl', 'productStatus'],
    (data) => {
      // TEMPORARY hardcode for testing login state — replace with real auth check later
      const isGuest = false; // flip to true to preview guest views

      if (data.productStatus === 'unregistered') {
        populateDetectedProduct(data.productTitle, data.productUrl);
        showReportView(isGuest ? 'report-form-view-guest' : 'report-form-view');
      } else {
        showReportView(isGuest ? 'report-default-view-guest' : 'report-default-view');
      }
    }
  );
});