//content.js
console.log('FDA Checker content script loaded');
console.log("Hello World from content.js")

const verifyBtn = document.createElement("button");
verifyBtn.textContent = "Verify";
verifyBtn.style.position = "fixed";
verifyBtn.style.display = "none";
verifyBtn.style.zIndex = "9999";
verifyBtn.style.padding = "6px 12px";
verifyBtn.style.backgroundColor = "black";
verifyBtn.style.color = "white";
verifyBtn.style.border = "none";
verifyBtn.style.borderRadius = "5px";
verifyBtn.style.cursor = "pointer";
document.body.appendChild(verifyBtn);

let debounceTimer;

document.addEventListener("mouseup", () => {
    clearTimeout(debounceTimer);
 
    debounceTimer = setTimeout(() => {
        const selectedText = window.getSelection().toString();
 
        if (selectedText.length > 0) {
            const range = window.getSelection().getRangeAt(0).getBoundingClientRect();
 
            verifyBtn.style.left = range.left + "px";
            verifyBtn.style.top = (range.bottom + 8) + "px";
            verifyBtn.style.display = "block";
        } else {
            verifyBtn.style.display = "none";
        }
    }, 100);
});

// verifyBtn.addEventListener("click", () => {
//     const selectedText = window.getSelection().toString();
    
//     // Remove any existing modal first
//     document.getElementById('everifymo-modal')?.remove();

//     const modal = document.createElement('div');
//     modal.id = 'everifymo-modal';
//     modal.style.position = 'fixed';
//     modal.style.top = '20px';
//     modal.style.right = '20px';
//     modal.style.zIndex = '999999';
//     modal.style.background = 'white';
//     modal.style.padding = '16px';
//     modal.style.borderRadius = '8px';
//     modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
//     modal.innerHTML = `
//         <div>✅ FDA REGISTERED</div>
//         <div><strong>Product:</strong> ${selectedText}</div>
//         <div id="fda-close-btn" style="
//             position: absolute;
//             top: 8px;
//             right: 10px;
//             cursor: pointer;
//             font-size: 16px;
//             opacity: 0.8;
//         ">✕</div>
//     `;
    
//     document.body.appendChild(modal);

//     document.getElementById('fda-close-btn').addEventListener('click', () => {
//         modal.remove();
//     });
        
//     setTimeout(() => {
//         if (modal.parentElement) modal.remove();
//     }, 8001);

//     verifyBtn.style.display = "none";
  
    
//    // Send the selected text to the background script
//     chrome.runtime.sendMessage({
//         action: "extractedTitle",
//         title: selectedText,
//         platform: platform(location.href),
//         url: location.href
//     }, (response) => {
//         console.log("Response from background:", response);
//     });
// });

function platform(url) {
  if (url.includes("shopee")) return "shopee";
  if (url.includes("lazada")) return "lazada";
  if (url.includes("facebook")) return "facebook";
  if (url.includes("tiktok")) return "tiktok";
  return "unknown";
}

let modal = null;

function createModal() {
  if (modal) return modal;
 
  modal = document.createElement('div');
  modal.id = 'everifymo-modal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = '20px';
  modal.style.right = '20px';
  modal.style.zIndex = '999999';
  modal.style.background = 'white';
  modal.style.padding = '16px';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  modal.style.maxWidth = '360px';
  modal.style.maxHeight = '80vh';
  modal.style.overflowY = 'auto';
 
  modal.innerHTML = `
    <main class="main-content">
 
      <div class="state hidden" id="state-loading">
        <div class="loading-copy">
          <div class="spinner"></div>
          <p class="state-message">Verifying product…</p>
        </div>
      </div>
 
      <div class="state hidden" id="state-idle">
        <p class="state-message">Open a product page on Shopee, Lazada, TikTok Shop, or Facebook Marketplace to verify.</p>
      </div>
 
      <div class="state hidden" id="state-registered">
        <div class="registered-banner">
          <div class="registered-copy">
            <div class="registered-title">✅ Registered Product!</div>
            <div class="registered-product">Product: <span id="product-name-registered"></span></div>
          </div>
        </div>
 
        <div class="top-matches">
          <div class="top-matches-title">Top Matches</div>
          <div class="match-list">
            <div class="match-card">
              <div class="rank-badge">#1</div>
              <div class="match-content">
                <div class="match-title"></div>
                <div class="progress-bar"><div class="progress-fill" style="width:0%;"></div></div>
              </div>
              <div class="match-score"><span class="match-percent"></span></div>
            </div>
            <div class="match-card">
              <div class="rank-badge">#2</div>
              <div class="match-content">
                <div class="match-title"></div>
                <div class="progress-bar"><div class="progress-fill" style="width:0%;"></div></div>
              </div>
              <div class="match-score"><span class="match-percent"></span></div>
            </div>
            <div class="match-card">
              <div class="rank-badge">#3</div>
              <div class="match-content">
                <div class="match-title"></div>
                <div class="progress-bar"><div class="progress-fill" style="width:0%;"></div></div>
              </div>
              <div class="match-score"><span class="match-percent"></span></div>
            </div>
            <div class="match-card">
              <div class="rank-badge">#4</div>
              <div class="match-content">
                <div class="match-title"></div>
                <div class="progress-bar"><div class="progress-fill" style="width:0%;"></div></div>
              </div>
              <div class="match-score"><span class="match-percent"></span></div>
            </div>
            <div class="match-card">
              <div class="rank-badge">#5</div>
              <div class="match-content">
                <div class="match-title"></div>
                <div class="progress-bar"><div class="progress-fill" style="width:0%;"></div></div>
              </div>
              <div class="match-score"><span class="match-percent"></span></div>
            </div>
          </div>
 
          <div class="action-buttons-green action-buttons">
            <button class="btn-skip-green btn-skip" type="button">Skip</button>
          </div>
        </div>
      </div>
 
      <div class="state hidden" id="state-suspicious">
        <div class="not-found-banner">
          <div class="not-found-copy">
            <div class="not-found-title">⚠️ Product Not Found!</div>
            <div class="not-found-product">Product: <span id="product-name-suspicious"></span></div>
          </div>
        </div>
 
        <div class="further-checking-section">
          <div class="further-checking-title">Further Checking Required</div>
          <div class="further-checking-text">Product not found in our database and
            may not be a cosmetic item the system checks. Registration status
            can't be guaranteed — manual verification is recommended.</div>
        </div>
 
        <div class="action-buttons-orange action-buttons">
            <button class="btn-report-orange btn-report" type="button">Report</button>
            <button class="btn-skip-orange btn-skip" type="button">Skip</button>
        </div>
      </div>
 
      <div class="state hidden" id="state-unregistered">
        <div class="unregistered-banner">
          <div class="unregistered-copy">
            <div class="unregistered-title">❌ Unregistered Product!</div>
            <div class="unregistered-message">Product: <span id="product-name-unregistered"></span></div>
          </div>
        </div>
 
        <div class="top-matches-red">
          <div class="top-matches-title-red">Top Matches</div>
          <div class="match-list-red">
            <div class="match-card-red">
              <div class="rank-badge-red">#1</div>
              <div class="match-content-red">
                <div class="match-title-red"></div>
                <div class="progress-bar-red"><div class="progress-fill-red" style="width:0%;"></div></div>
              </div>
              <div class="match-score-red"><span class="match-percent-red"></span></div>
            </div>
            <div class="match-card-red">
              <div class="rank-badge-red">#2</div>
              <div class="match-content-red">
                <div class="match-title-red"></div>
                <div class="progress-bar-red"><div class="progress-fill-red" style="width:0%;"></div></div>
              </div>
              <div class="match-score-red"><span class="match-percent-red"></span></div>
            </div>
            <div class="match-card-red">
              <div class="rank-badge-red">#3</div>
              <div class="match-content-red">
                <div class="match-title-red"></div>
                <div class="progress-bar-red"><div class="progress-fill-red" style="width:0%;"></div></div>
              </div>
              <div class="match-score-red"><span class="match-percent-red"></span></div>
            </div>
            <div class="match-card-red">
              <div class="rank-badge-red">#4</div>
              <div class="match-content-red">
                <div class="match-title-red"></div>
                <div class="progress-bar-red"><div class="progress-fill-red" style="width:0%;"></div></div>
              </div>
              <div class="match-score-red"><span class="match-percent-red"></span></div>
            </div>
            <div class="match-card-red">
              <div class="rank-badge-red">#5</div>
              <div class="match-content-red">
                <div class="match-title-red"></div>
                <div class="progress-bar-red"><div class="progress-fill-red" style="width:0%;"></div></div>
              </div>
              <div class="match-score-red"><span class="match-percent-red"></span></div>
            </div>
          </div>
 
          <div class="action-buttons-red action-buttons">
            <button class="btn-report-red btn-report" type="button">Report</button>
            <button class="btn-skip-red btn-skip" type="button">Skip</button>
          </div>
        </div>
      </div>
 
    </main>
  `;
 
  document.body.appendChild(modal);
 
  modal.querySelectorAll('.btn-skip').forEach(btn => {
    btn.addEventListener('click', () => { modal.style.display = 'none'; });
  });
 
  return modal;
}

function showState(stateId) {
  modal.style.display = 'block';  
  modal.querySelectorAll('.state').forEach(el => {
    el.classList.add('hidden');
    el.style.display = 'none';
  });
  const target = modal.querySelector(`#${stateId}`);
  target.classList.remove('hidden');
  target.style.display = 'block';
}
 
function renderResult(status, productTitle, results = []) {
  const stateId = ['registered', 'suspicious', 'unregistered'].includes(status)
    ? `state-${status}`
    : 'state-suspicious';
 
  const nameSpan = modal.querySelector(`#product-name-${status}`);
  if (nameSpan) nameSpan.textContent = productTitle;
 
  if (status === 'registered' || status === 'unregistered') {
    populateMatches(stateId, results);
  }
 
  showState(stateId);
}

function populateMatches(stateId, results) {
  const suffix = stateId === 'state-unregistered' ? '-red' : '';
  const cards = modal.querySelectorAll(`#${stateId} .match-card${suffix}`);
 
  cards.forEach((card, i) => {
    const match = results[i];
    if (!match) { card.style.display = 'none'; return; }
    card.style.display = '';
    card.querySelector(`.match-title${suffix}`).textContent = match.title;
    const pct = Math.round(match.cosine_similarity * 100);
    card.querySelector(`.match-percent${suffix}`).textContent = `${pct}%`;
    card.querySelector(`.progress-fill${suffix}`).style.width = `${pct}%`;
  });
}

verifyBtn.addEventListener("click", () => {
  const selectedText = window.getSelection().toString();
  verifyBtn.style.display = "none";
 
  createModal();
  showState('state-loading');
 
  chrome.runtime.sendMessage({
    action: "extractedTitle",
    title: selectedText,
    platform: platform(location.href),
    url: location.href
  }, (response) => {
    console.log("Response from background:", response);
 
    const status = response?.data?.status || 'unregistered';
    const results = response?.data?.results || [];
    renderResult(status, selectedText, results);
  });
});
