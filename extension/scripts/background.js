console.log("Background service worker started");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
console.log('Background received message:', message);
  if (message.action === 'extractedTitle') {
    //
    (async () => {
      try {
        const response = await fetch('http://localhost:8001/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: message.title, top_k: 5 })
        });

        const data = await response.json().catch(() => null);
        console.log('Backend response:', data);
        
        const status = data?.status || 'unregistered';

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
        sendResponse({ status: 'success', data: data });
      } catch (error) {
        //
        console.error('Error sending title to backend:', error);
        const status = 'unregistered';
        chrome.storage.local.set({
          productTitle: message.title,
          productPlatform: message.platform,
          productUrl: message.url,
          productStatus: status
        }, () => {
          console.log('Product info stored with error fallback:', message.title);
        });

        updateBadge(status, sender.tab.id);
        sendResponse({ status: 'error', data: null });
      }
    })();

    return true;
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
