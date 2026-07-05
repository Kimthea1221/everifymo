chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'titleExtracted') {

    // For now status is always 'registered' until backend is connected
    const status = 'unregistered';

    // Store the extracted product info in chrome.storage
    chrome.storage.local.set({
      productTitle: message.title,
      productPlatform: message.platform,
      productUrl: message.url,
      productStatus: status
    }, () => {
      console.log('Product info stored:', message.title);
    });

    updateBadge(status, sender.tab.id);
  }

});

function updateBadge(status, tabId) {
  const badgeConfig = {
    registered:   { text: '✓', color: '#16A34A' }, // green
    unregistered: { text: '!', color: '#DC2626' }, // red
    unverified:   { text: '?', color: '#D97706' }, // amber
    idle:         { text: '',  color: '#000000' }  // clears badge
  };

  const config = badgeConfig[status] || badgeConfig.idle;

  chrome.action.setBadgeText({ text: config.text, tabId: tabId });
  chrome.action.setBadgeBackgroundColor({ color: config.color, tabId: tabId });
}

// Clear the badge when the user navigates away or closes the tab,
// so it doesn't show a stale result on a page with no product
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.action.setBadgeText({ text: '', tabId: tabId });
});