chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'titleExtracted') {

    // Store the extracted product info in chrome.storage
    chrome.storage.local.set({
      productTitle: message.title,
      productPlatform: message.platform,
      productUrl: message.url,
      // For now status is always 'registered' until 
      // backend is connected
      productStatus: 'registered'
    }, () => {
      console.log('Product info stored:', message.title);
    });

    // Update the extension badge to show it detected something
    chrome.action.setBadgeText({ 
      text: '!',
      tabId: sender.tab.id 
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: '#66BB6A',
      tabId: sender.tab.id
    });
  }

});
