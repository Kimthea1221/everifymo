//content.js
console.log('FDA Checker content script loaded');

let lastUrl = location.href;

// checking if its in the product page
function isProductPage() {

    const currentUrl = location.href;

    if (currentUrl.includes("shopee.ph") && currentUrl.includes("-i.")) {
        console.log("Product page of shopee");
        return true;
    }    

    if (currentUrl.includes("lazada.com.ph/products/") && currentUrl.includes(".html")){
        console.log("Product page of lazada");
        return true;
    } 

    if (currentUrl.includes("facebook.com/marketplace/item/")) {
        console.log("Product page of facebook");
        return true;  
    } 

    if (currentUrl.includes("shop.tiktok.com/ph/pdp")) {
        console.log("Product page of tiktok");
        return true;
    }   

    return false;
}

function whatPlatform() {
    
    const currentUrl = location.href;

    if (currentUrl.includes('shopee.ph')) return 'shopee';
    if (currentUrl.includes('lazada.com.ph')) return 'lazada';
    if (currentUrl.includes('facebook.com')) return 'facebook';
    if (currentUrl.includes('shop.tiktok.com')) return 'tiktok';

    return null;
}

// ==== for SPA navigation ====

// responsible for checking/re-checking for page changes
function checkPage() {

    const currentUrl = location.href;
    console.log("URL:", currentUrl);

    if (currentUrl !== lastUrl) {
        console.log("User changed DOM");
        lastUrl = currentUrl;

        tryExtract();
    }
}

let timer;

//check page every 300ms (incase the user changed page)
const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(checkPage, 300);
});

// checking any changes in the DOM (that didnt undergo refresh page)
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// ==== Product title Extraction ====

// A list of generic/placeholder values that are NOT real titles
const INVALID_TITLES = ['marketplace', 'facebook', ''];

function isValidTitle(title) {
    if (!title) return false;
    const normalized = title.trim().toLowerCase();
    return !INVALID_TITLES.includes(normalized);
}

function shopeeExtraction() {

    // extract through the h1 tag
    const h1 = document.querySelector('h1');
    if (h1?.textContent?.trim()) return h1.textContent.trim();

    // extract span that is inside h1
    const spanInH1 = document.querySelector('h1 span');
    if (spanInH1?.textContent?.trim()) return spanInH1.textContent.trim();

    // extract in the title inside meta tag
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle?.getAttribute('content')?.trim()) {
        return metaTitle.getAttribute('content').replace(/\s*[\|\-–]\s*Shopee.*$/i, '').trim();
    }

    // extract through page title
    return document.title.split('|')[0].split('-')[0].trim() || null;
}

function lazadaExtraction() {

    // extract through class name for the product title
    const pdpTitle = document.querySelector('[class*="pdp-mod-product-badge-title-v2');
    if (pdpTitle?.textContent?.trim()) return pdpTitle.textContent.trim();

    // extract through h1
    const h1 = document.querySelector('h1');
    if (h1?.textContent.trim()) return h1.textContent.trim();

    // extract in the title inside meta tag
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle?.getAttribute('content')?.trim()) {
        return metaTitle.getAttribute('content').replace(/\s*[\|\-–]\s*Lazada.*$/i, '').trim();
    }

    return null;
}

function tiktokExtraction() {
    
    // extract through span inside h1
    const spanInH1 = document.querySelector('h1 span');
    if (spanInH1?.textContent?.trim()) return spanInH1.textContent.trim();

    // extract through h1
    const h1 = document.querySelector('h1');
    if (h1?.textContent?.trim()) return h1.textContent.trim();

    // extract through class name for the product title
    const byClass = document.querySelector('[class*="H2-Semibold"], [class*="UIText1Display"]');
    if (byClass?.textContent?.trim()) return byClass.textContent.trim();

    // extract through page title
    return document.title.split('|')[0].split('-')[0].trim() || null;
}

function facebookExtraction() {

    const pageTitle = document.title;
    if (pageTitle.includes('Buy and Sell in') || pageTitle === 'Facebook' || !pageTitle) {
        return null;
    }
    
    // remove facebook branding (Facebook markeplace after |)
    let title = pageTitle.split('|')[0].trim();
    title = title.split(' - ')[0].trim();
    
    if (title && title !== 'Marketplace') return title;

    // extract span inside h1
    const spanInH1 = document.querySelector('h1 span');
    const spanText = spanInH1?.textContent?.trim();
    if (isValidTitle(spanText)) return spanText;

    // extract through meta tags
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle?.getAttribute('content')?.trim()) {
        const content = metaTitle.getAttribute('content').replace(/\s*[\|\-–]\s*Facebook.*$/i, '')
            .replace(/\s*\|\s*Marketplace.*$/i, '')
            .trim();
        
        if (isValidTitle(content)) return content;
    }

    return null;
}

// for cleaning the title 

function cleanTitle(rawTitle) {
  let clean = rawTitle;

  clean = clean.replace(/【[^】]*】/g, '');      // remove 【AUTHENTIC】
  clean = clean.replace(/\[[^\]]*\]/g, '');      // remove [FREE SHIPPING]
  clean = clean.replace(/free shipping/gi, '');
  clean = clean.replace(/\bCOD\b/g, '');
  clean = clean.replace(/on sale/gi, '');
  clean = clean.replace(/[\u{1F300}-\u{1FFFF}]/gu, ''); // remove emoji
  clean = clean.replace(/[\u{2600}-\u{26FF}]/gu, '');   // remove emoji
  clean = clean.replace(/\s+/g, ' ');            // collapse extra spaces
  clean = clean.trim();

  return clean;
}

let lastSeenTitle = null;
let stableCount = 0;

function tryExtract(attempt = 1) {

    console.log('tryExtract() called, attempt:', attempt);

    console.log('Current URL:', location.href);
    console.log('isProductPage result:', isProductPage());
    console.log('platform:', whatPlatform());

    if (!isProductPage()) return;
 
    const platform = whatPlatform();
    if (!platform) {
        console.log ('Platform not recognized');
        return;
    }

    let rawTitle = null;

    if (platform === 'shopee') rawTitle = shopeeExtraction();
    if (platform === 'lazada') rawTitle = lazadaExtraction();
    if (platform === 'facebook') rawTitle = facebookExtraction();
    if (platform === 'tiktok') rawTitle = tiktokExtraction();

    console.log('Current candidate title:', rawTitle);

    // Check if this title is the same as the last check
    if (rawTitle === lastSeenTitle) {
        stableCount++;
    } else {
        stableCount = 0;
        lastSeenTitle = rawTitle;
    }

    // We want the title to stay the SAME for 2 consecutive checks
    // before we trust it — this means the page has stopped changing
    const isStable = stableCount >= 1;

    if (!rawTitle || !isStable) {
        if (attempt < 10) {
            console.log('Title not stable yet, retrying in 500ms... (attempt', attempt, ')');
            setTimeout(() => tryExtract(attempt + 1), 500);
        } else {
            console.log('Gave up after 10 attempts');
        }
        return;
    }

    // Reset tracking for next time
    lastSeenTitle = null;
    stableCount = 0;

    console.log('Raw title (stable):', rawTitle);

    const cleanedTitle = cleanTitle(rawTitle);
    if (!cleanedTitle) return;

    console.log('Clean title:', cleanedTitle);

    console.log('Sending extracted title to background:', cleanedTitle, platform, location.href);

    try {
        chrome.runtime.sendMessage({
            action: 'titleExtracted',
            title: rawTitle,
            platform: platform,
            url: location.href
        });
        console.log('Message sent to backend');
    } catch (error) {
        console.error('Error sending message to backend:', error);
    }
}

tryExtract();












// const PRODUCT_PATTERNS = [
//     'shopee.ph',
//     'lazada.com.ph',
//     'facebook.com/marketplace/item',
//     'tiktok.com'
// ];

// function isProductPage(url) {
//     return PRODUCT_PATTERNS.some(pattern => url.includes(pattern));
// }

// let lastUrl = location.href;
// let debounceTimer = null;

// function tryExtract() {
//     const url = location.href;
//     if (isProductPage(url)) {
//         console.log('Product page detected, requesting extraction:', url);
//         chrome.runtime.sendMessage({ action: 'extractTitle' });
//     }
// }

// function onPageChange() {
//     const currentUrl = location.href;

//     if (currentUrl === lastUrl) return;
//     lastUrl = currentUrl;

//     console.log('SPA navigation detected:', currentUrl);
//     tryExtract();
// }

// const observer = new MutationObserver(() => {
//     clearTimeout(debounceTimer);
//     debounceTimer = setTimeout(onPageChange, 300);
// });

// observer.observe(document.body, {
//     childList: true,
//     subtree: true
// });

// tryExtract();
