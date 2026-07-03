// act as middleman since content.js cant send data directly to the api

console.log('Background service worker started');

// mock server address
const mock_api_url = 'http://127.0.0.1:8000/check';

let latestResult = null;

// waiting to recieve the message/data from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if(message.action === 'titleExtracted') {
        console.log('Title recieved in background:', message.title);
        console.log('Tab ID:', sender.tab.id);

        checkWithMockAPI(message.title, message.platform, message.url, sender.tab.id);
    }

    // send latest result to the popup
    if (message.action === 'getLatestResult') {
        sendResponse(latestResult);
    }

    // true to keep the message channel open for async responses
    return true;
});

async function checkWithMockAPI(title, platform, url, tabId) {

    console.log('Sending to mock API:', title);

    try{
        const response = await fetch(mock_api_url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title, platform, url })
        });

        if (!response.ok){
            console.log('API error - status:', response.status);
            return;
        }

        const result = await response.json();
        console.log('Mock API result :', result);

        // save result so popup can access it later
        latestResult = result;

        //send result to the product page tab that will be show on the overlay by content.js
        chrome.tabs.sendMessage(tabId, {
            action: 'showResult',
            result: result
        });
        
    } catch (error) {
        console.log('Could not reach mock API:', error.message);
        console.log('Is your mock server running?  (uvicorn mock_server:app --reload)');
    }
}