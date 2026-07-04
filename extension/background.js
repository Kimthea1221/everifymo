// act as middleman since content.js cant send data directly to the api

console.log('Background service worker started');

// mock server address
const mock_api_url = 'http://127.0.0.1:8000/check';

let latestResult = null;

// waiting to recieve the message/data from content.js
chrome.runtime.onMessage.addListener((messageData, sender, sendResult) => {

    if(messageData.action === 'titleExtracted') {
        console.log('Title recieved in background:', messageData.title);
        console.log('Tab ID:', sender.tab.id);

        checkWithMockAPI(messageData.title, messageData.platform, messageData.url, sender.tab.id);
    }

    // send latest result to the popup
    if (messageData.action === 'getLatestResult') {
        sendResult(latestResult);
    }

    // true to keep the message channel open for async responses/reply
    return true;
});

async function checkWithMockAPI(title, platform, url, tabId) {

    console.log('Sending to mock API:', title);

    try{
        const result = await fetch(mock_api_url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title, platform, url })
        });

        if (!result.ok){
            console.log('API error - status:', result.status);
            return;
        }

        const dataResult = await result.json();
        console.log('Mock API result :', result);

        // save result so popup can access it later
        latestResult = dataResult;

        //send result to the product page tab that will be show on the overlay by content.js
        chrome.tabs.sendMessage(tabId, {
            action: 'showResult',
            result: dataResult
        });
        
    } catch (error) {
        console.log('Could not reach mock API:', error.message);
        console.log('Is your mock server running?  (uvicorn mock_server:app --reload)');
    }
}