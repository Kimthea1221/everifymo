// popup.js
// This runs when the user clicks the extension icon

// Ask background.js for the latest result
chrome.runtime.sendMessage({ action: 'getLatestResult' }, (result) => {

    const container = document.getElementById('content');

    // No result yet — user hasn't visited a product page
    if (!result) {
        container.innerHTML = `
            <div class="waiting">
                Navigate to a product page to see FDA verification results.
            </div>
        `;
        return;
    }

    // Decide which style to use
    let boxClass, icon, statusText;

    if (result.registered === true) {
        boxClass = 'registered';
        icon = '✅';
        statusText = 'FDA REGISTERED';
    } else if (result.registered === false) {
        boxClass = 'not-registered';
        icon = '❌';
        statusText = 'NOT FDA REGISTERED';
    } else {
        boxClass = 'unknown';
        icon = '⚠️';
        statusText = 'COULD NOT VERIFY';
    }

    // Build the popup content
    container.innerHTML = `
        <div class="status-box ${boxClass}">
            <div class="status-label">${icon} ${statusText}</div>
        </div>
        <div class="product-name">
            <strong>Product:</strong> ${result.title}
        </div>
        ${result.fda_number ? `
        <div class="detail">
            <strong>FDA No:</strong> ${result.fda_number}
        </div>` : ''}
        ${result.company_name ? `
        <div class="detail">
            <strong>Company:</strong> ${result.company_name}
        </div>` : ''}
        <div class="detail" style="margin-top: 8px;">
            ${result.message}
        </div>
    `;
});