// --- FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDQDSY9yFWOJ3MFl7_GefbzJQgyskvlBa8",
    authDomain: "ooha-d3576.firebaseapp.com",
    projectId: "ooha-d3576",
    storageBucket: "ooha-d3576.firebasestorage.app",
    messagingSenderId: "938771332786",
    appId: "1:938771332786:web:9dd69f81fca6eaa99093ab",
    measurementId: "G-RQJCZBZ9N8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const leaveOohaBtn = document.getElementById('leave-ooha-btn');
const closeModalBtn = document.getElementById('close-modal');
const modal = document.getElementById('ooha-modal');
const submitOohaBtn = document.getElementById('submit-ooha-btn');
const lookupBtn = document.getElementById('lookup-btn');
const resultsSection = document.getElementById('results-section');

function removeAccents(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function maskName(name) {
    if (!name || name.trim() === '') return "Anonymous";
    const cleanName = name.trim();
    if (cleanName.length === 1) return cleanName.toUpperCase() + "*******";
    return cleanName.charAt(0).toUpperCase() + "*******";
}

async function getClientInfo() {
    let ip = "Unknown";
    let location = "Unknown";
    try {
        const res1 = await fetch("https://ipwho.is/");
        const data1 = await res1.json();
        if (data1.success) {
            return { ip: data1.ip, location: `${data1.city}, ${data1.region}, ${data1.country}` };
        }
    } catch (e1) {
        try {
            const res2 = await fetch("https://api.ipify.org?format=json");
            const data2 = await res2.json();
            if (data2.ip) ip = data2.ip;
        } catch (e2) {
            console.log("Client has strict tracking enabled.");
        }
    }
    return { ip, location };
}

async function checkProfanity(text) {
    try {
        const res = await fetch(`https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(text)}`);
        const isProfane = await res.text();
        if (isProfane === 'true') return true;
    } catch (e) { console.error("Profanity API Error", e); }
    const regionalBadWords = ["lanja", "puku", "modda", "dengu", "gudda", "madarchod", "bhenchod", "chutiya", "randi", "gandu"];
    const lowerText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    return regionalBadWords.some(word => lowerText.includes(word));
}

async function setupDynamicTicker() {
    const clientData = await getClientInfo();
    let localArea = "your area";
    let countryName = "your country";

    if (clientData.location !== "Unknown") {
        const parts = clientData.location.split(',');
        localArea = parts[0].trim(); 
        countryName = parts[parts.length - 1].trim(); 
    }

    const tickerTexts = [
        `🔥 A secret was just dropped near ${localArea}...`,
        `👁️ Someone is checking their vault in ${countryName}...`,
        `🖤 A Secret Admirer confessed near ${localArea}...`,
        `🐍 A Betrayal was revealed nearby...`,
        `👑 Someone earned respect in ${countryName}...`
    ];

    const ticker = document.getElementById('social-ticker');
    if (!ticker) return;
    
    setInterval(() => {
        const randomText = tickerTexts[Math.floor(Math.random() * tickerTexts.length)];
        ticker.innerText = randomText;
        ticker.classList.remove('hidden');
        ticker.style.opacity = 1;
        setTimeout(() => {
            ticker.style.opacity = 0;
            setTimeout(() => ticker.classList.add('hidden'), 500); 
        }, 5000); 
    }, 25000); 
}
setupDynamicTicker();

// --- IMAGE GENERATOR FOR IG STORY ---
window.exportStoryImage = function(message, vibe, city) {
    const container = document.getElementById('export-container');
    container.innerHTML = `
        <div class="story-export-card" id="story-card-element">
            <div style="color: #d4af37; font-size: 0.9rem; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">
                Top Secret ${vibe ? ' | ' + vibe : ''}
            </div>
            <p style="font-size: 1.6rem; font-style: italic; line-height: 1.5; margin-bottom: 25px;">"${message}"</p>
            <div style="font-size: 0.9rem; color: #888c96;">📍 Hidden in ${city}</div>
            <div class="story-watermark">Get yours at ooha.vercel.app</div>
        </div>
    `;

    html2canvas(document.getElementById('story-card-element'), {
        backgroundColor: null,
        scale: 3
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'My-OOHA-Story.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        container.innerHTML = ''; 
        alert("📸 Image saved! You can now upload it to your Instagram or Snapchat Story.");
    });
}

// --- REPORT OOHA SYSTEM (Tier 2 Anti-Spam) ---
window.reportOoha = async function(docId) {
    if (!confirm("Are you sure you want to report this message for abusive content?")) return;
    
    try {
        const docRef = doc(db, "oohas", docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            let currentReports = docSnap.data().reports || 0;
            currentReports += 1;
            let shouldHide = currentReports >= 3; // Hide if 3 or more reports
            
            await updateDoc(docRef, { reports: currentReports, isHidden: shouldHide });
            
            alert("🚩 Report submitted. Thank you for keeping OOHA...!! safe.");
            if (shouldHide) location.reload(); // Refresh to hide the message
        }
    } catch(e) {
        console.log("Error reporting", e);
    }
}

window.shareToApp = function(platform, targetName, targetCity) {
    const shareUrl = new URL(window.location.origin + window.location.pathname);
    shareUrl.searchParams.set('name', targetName);
    shareUrl.searchParams.set('city', targetCity);
    const url = shareUrl.toString();
    
    const text = `Someone just dropped a Top Secret about ${targetName.toUpperCase()} on OOHA...!! Do you have the guts to check your vault? 👀👇`;
    
    if (navigator.share && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        navigator.share({ title: 'OOHA...!! Secret Vault', text: text, url: url }).catch(err => console.log('Share canceled', err));
        return;
    } 
    
    if (platform === 'fb') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, 'facebook-share-dialog', 'width=600,height=400');
    } else if (platform === 'Snapchat') {
        window.open(`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'Instagram') {
        navigator.clipboard.writeText(`${text} \n\nLink: ${url}`).then(() => {
            alert("🔥 Text and Link Copied! Open Instagram and paste it into your Story or DM.");
        }).catch(err => { alert("Copy your browser link and paste it on Instagram to dare your friends!"); });
    }
}

function getShareButtonsHtml(name, city) {
    return `
        <div class="share-buttons-container">
            <button class="share-btn btn-ig" onclick="shareToApp('Instagram', '${name}', '${city}')">📷 Dare on Instagram Story</button>
            <button class="share-btn btn-snap" onclick="shareToApp('Snapchat', '${name}', '${city}')">👻 Snap your Friends</button>
            <button class="share-btn btn-fb" onclick="shareToApp('fb', '${name}', '${city}')">📘 Share on Facebook</button>
        </div>
    `;
}

// --- TIMER LOOP ---
setInterval(() => {
    document.querySelectorAll('.timer-badge').forEach(badge => {
        const expires = parseInt(badge.getAttribute('data-expires'));
        const now = new Date().getTime();
        const diff = expires - now;
        
        if (diff <= 0) {
            const card = badge.closest('.ooha-card-premium');
            card.querySelector('.card-message').innerHTML = '<span class="destructed-msg">💥 This OOHA...!! has self-destructed.</span>';
            badge.innerText = "Destructed";
            badge.classList.remove('timer-badge');
        } else {
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            badge.innerText = `⏱️ ${h}h ${m}m ${s}s left`;
        }
    });
}, 1000);

leaveOohaBtn.addEventListener('click', () => {
    document.getElementById('modal-form-area').classList.remove('hidden');
    document.getElementById('success-message').classList.add('hidden');
    modal.classList.remove('hidden');
});
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

// --- SUBMIT OOHA (WITH ANTI-SPAM ARCHITECTURE) ---
submitOohaBtn.addEventListener('click', async () => {
    const targetName = document.getElementById('target-name').value.trim().toLowerCase();
    const oohaText = document.getElementById('ooha-text').value.trim();
    const city = document.getElementById('modal-city').value.trim().toLowerCase();
    const senderInput = document.getElementById('sender-name');
    const senderName = senderInput ? senderInput.value.trim() : "Anonymous";
    const vibeSelect = document.getElementById('vibe-select');
    const vibeValue = vibeSelect ? vibeSelect.value : "";
    
    const destructCheck = document.getElementById('self-destruct-check');
    const isDestructing = destructCheck ? destructCheck.checked : false;

    if (!targetName || !oohaText || !city) { alert("Please fill all required details!"); return; }

    const originalBtnText = submitOohaBtn.innerText;
    submitOohaBtn.innerText = "Verifying Security...";
    submitOohaBtn.disabled = true;

    // Filter 1: Profanity
    const isVulgar = await checkProfanity(oohaText);
    if (isVulgar) {
        alert("Oops! 🙊 We love juicy secrets, but let's keep the vibe classy. The vault rejects toxic words. Phrase it differently! ✨");
        submitOohaBtn.innerText = originalBtnText;
        submitOohaBtn.disabled = false;
        return; 
    }

    const clientInfo = await getClientInfo();

    // Filter 2 & 3: IP Blacklist and Rate Limiting
    try {
        if (clientInfo.ip !== "Unknown") {
            // Check Blacklist
            const banQ = query(collection(db, "banned_ips"), where("ip", "==", clientInfo.ip));
            const banSnap = await getDocs(banQ);
            if (!banSnap.empty) {
                alert("🚫 Your device has been restricted for violating community guidelines.");
                submitOohaBtn.innerText = originalBtnText;
                submitOohaBtn.disabled = false;
                return;
            }

            // Check Velocity (Rate Limit)
            const rateQ = query(collection(db, "oohas"), where("senderIp", "==", clientInfo.ip));
            const rateSnap = await getDocs(rateQ);
            let recentPosts = 0;
            const fiveMinsAgo = new Date().getTime() - (5 * 60 * 1000);
            
            rateSnap.forEach(doc => {
                if (doc.data().timestamp && doc.data().timestamp.toDate().getTime() > fiveMinsAgo) {
                    recentPosts++;
                }
            });

            if (recentPosts >= 3) {
                alert("⏳ Take a breath! You are posting too fast. Please wait a few minutes.");
                submitOohaBtn.innerText = originalBtnText;
                submitOohaBtn.disabled = false;
                return;
            }
        }
    } catch(e) { console.log("Spam check bypassed due to adblocker."); }

    try {
        await addDoc(collection(db, "oohas"), {
            name: targetName,
            city: city,
            message: oohaText,
            sender: senderName,
            vibe: vibeValue,
            timestamp: new Date(),
            senderIp: clientInfo.ip,
            senderLocation: clientInfo.location,
            isDestructing: isDestructing,
            reports: 0, // Initialize reporting count
            isHidden: false
        });
        
        document.getElementById('modal-form-area').classList.add('hidden');
        document.getElementById('success-message').classList.remove('hidden');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.getElementById('target-name').value = '';
            document.getElementById('ooha-text').value = '';
            if(senderInput) senderInput.value = '';
            if(vibeSelect) vibeSelect.value = '';
            if(destructCheck) destructCheck.checked = false;
            
            document.getElementById('modal-country').value = '';
            document.getElementById('modal-country').placeholder = "Select Country...";
            document.getElementById('modal-state').value = '';
            document.getElementById('modal-state').disabled = true;
            document.getElementById('modal-state').placeholder = "Select Country First...";
            document.getElementById('modal-city').value = '';
            document.getElementById('modal-city').disabled = true;
            document.getElementById('modal-city').placeholder = "Select State First...";
            
            document.getElementById('modal-form-area').classList.remove('hidden');
            document.getElementById('success-message').classList.add('hidden');
        }, 2000);
    } catch (e) { console.error(e); } finally { submitOohaBtn.innerText = originalBtnText; submitOohaBtn.disabled = false; }
});

async function performSearch(name, city) {
    lookupBtn.innerText = "Accessing the vault...";
    resultsSection.innerHTML = "";
    
    const newUrl = new URL(window.location.origin + window.location.pathname);
    newUrl.searchParams.set('name', name);
    newUrl.searchParams.set('city', city);
    window.history.pushState({}, '', newUrl);

    try {
        const q = query(collection(db, "oohas"), where("name", "==", name), where("city", "==", city), where("isHidden", "==", false)); // Filter out reported posts
        const querySnapshot = await getDocs(q);
        
        lookupBtn.innerText = "Reveal OOHA...!!";
        
        if (querySnapshot.empty) {
            resultsSection.innerHTML = `
                <div class="provocative-msg">
                    <p style="color:var(--gold-primary); font-size: 1.2rem; font-weight: bold;">The vault is completely silent for ${name.toUpperCase()}...</p>
                    <p style="margin-top: 10px; font-size: 1rem; color: #ccc; line-height: 1.5;">Are people intimidated by you, or do they just not have the courage to say it?</p>
                    ${getShareButtonsHtml(name, city)}
                </div>
            `;
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Check if hidden (just in case query didn't catch it)
                if(data.isHidden) return;

                const displayCity = data.city.charAt(0).toUpperCase() + data.city.slice(1);
                const maskedSender = maskName(data.sender);
                const vibeHtml = data.vibe ? `<span class="vibe-badge">${data.vibe}</span>` : '';
                
                let timerHtml = '';
                let displayMessage = `"${data.message}"`;
                
                if (data.isDestructing && data.timestamp) {
                    const docTime = data.timestamp.toDate().getTime();
                    const expiresTime = docTime + (24 * 60 * 60 * 1000); 
                    const now = new Date().getTime();
                    
                    if (now >= expiresTime) {
                        displayMessage = '<span class="destructed-msg">💥 This OOHA...!! has self-destructed.</span>';
                    } else {
                        timerHtml = `<span class="timer-badge" data-expires="${expiresTime}">⏱️ Calculating...</span>`;
                    }
                }

                const safeMessage = data.message.replace(/'/g, "\\'");

                resultsSection.innerHTML += `
                    <div class="ooha-card-premium">
                        ${vibeHtml}
                        <div class="card-header">Top Secret ${timerHtml}</div>
                        <p class="card-message">${displayMessage}</p>
                        <div class="card-footer">
                            <span style="color: var(--gold-hover);">Left by ${maskedSender}</span> <br>
                            Hidden in ${displayCity}
                        </div>
                        <div class="card-actions">
                            <button class="export-btn" onclick="exportStoryImage('${safeMessage}', '${data.vibe || ''}', '${displayCity}')">📸 Save for IG Story</button>
                            <button class="report-btn" onclick="reportOoha('${doc.id}')">🚩 Report</button>
                        </div>
                    </div>
                `;
            });
            resultsSection.innerHTML += getShareButtonsHtml(name, city);
        }
    } catch (e) {
        console.error(e);
        // Fallback if index error occurs for isHidden
        lookupBtn.innerText = "Reveal OOHA...!!";
        resultsSection.innerHTML = "<p style='color:var(--text-muted);'>Vault opened. If you see this message, the backend is optimizing. Please try again in a few minutes.</p>";
    }
}

// --- SEARCH RESET LOGIC ---
lookupBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('search-name');
    const name = nameInput.value.trim().toLowerCase();
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value.trim().toLowerCase();
    
    if (!name || !city) { alert("Enter Name and City!"); return; }

    performSearch(name, city);
    
    // Explicitly reset all fields immediately after search
    nameInput.value = '';
    
    const countryInput = document.getElementById('country-input');
    countryInput.value = '';
    countryInput.placeholder = "Select Country...";
    
    const stateInput = document.getElementById('state-input');
    stateInput.value = '';
    stateInput.disabled = true;
    stateInput.placeholder = "Select Country First...";
    
    cityInput.value = '';
    cityInput.disabled = true;
    cityInput.placeholder = "Select State First...";
});

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlName = urlParams.get('name');
    const urlCity = urlParams.get('city');
    if (urlName && urlCity) { performSearch(urlName.toLowerCase(), urlCity.toLowerCase()); }
});

const apiBase = "https://countriesnow.space/api/v0.1/countries";

function setupAutocomplete(inputId, listId, dataArray, onSelectCallback) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    newInput.addEventListener('input', function() {
        list.innerHTML = '';
        const val = this.value;
        if (!val) { list.style.display = 'none'; return; }
        const matches = dataArray.filter(item => item.toLowerCase().includes(val.toLowerCase())).slice(0, 100);
        if(matches.length > 0) {
            list.style.display = 'block';
            matches.forEach(match => {
                let div = document.createElement('div');
                div.innerHTML = match;
                div.addEventListener('click', () => {
                    newInput.value = match;
                    list.style.display = 'none';
                    if(onSelectCallback) onSelectCallback(match);
                });
                list.appendChild(div);
            });
        } else { list.style.display = 'none'; }
    });
}

async function loadCountries() {
    document.getElementById('country-input').placeholder = "Select Country...";
    document.getElementById('modal-country').placeholder = "Select Country...";
    try {
        const res = await fetch(apiBase);
        const data = await res.json();
        const countries = data.data.map(item => removeAccents(item.country));
        setupAutocomplete('country-input', 'country-list', countries, (s) => loadStates(s, 'state-input', 'state-list', 'city-input', 'city-list'));
        setupAutocomplete('modal-country', 'modal-country-list', countries, (s) => loadStates(s, 'modal-state', 'modal-state-list', 'modal-city', 'modal-city-list'));
    } catch (e) { console.error(e); }
}

async function loadStates(country, stateId, stateList, cityId, cityList) {
    const stateInput = document.getElementById(stateId);
    stateInput.disabled = false;
    stateInput.placeholder = "Loading States..."; 
    const res = await fetch(`${apiBase}/states`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({country})});
    const data = await res.json();
    const states = data.data.states.map(s => removeAccents(s.name));
    stateInput.placeholder = "Select State...";
    setupAutocomplete(stateId, stateList, states, (s) => loadCities(country, s, cityId, cityList));
}

async function loadCities(country, state, cityId, cityList) {
    const cityInput = document.getElementById(cityId);
    cityInput.disabled = false;
    cityInput.placeholder = "Loading Cities..."; 
    const res = await fetch(`${apiBase}/state/cities`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({country, state})});
    const data = await res.json();
    const cities = data.data.map(c => removeAccents(c));
    cityInput.placeholder = "Select City...";
    setupAutocomplete(cityId, cityList, cities);
}

loadCountries();
