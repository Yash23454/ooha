// --- FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// --- DOM ELEMENTS ---
const leaveOohaBtn = document.getElementById('leave-ooha-btn');
const closeModalBtn = document.getElementById('close-modal');
const modal = document.getElementById('ooha-modal');
const submitOohaBtn = document.getElementById('submit-ooha-btn');
const lookupBtn = document.getElementById('lookup-btn');
const resultsSection = document.getElementById('results-section');

// --- HELPER FUNCTIONS ---
function removeAccents(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function maskName(name) {
    if (!name || name.trim() === '') return "Anonymous";
    const cleanName = name.trim();
    if (cleanName.length === 1) return cleanName.toUpperCase() + "*******";
    return cleanName.charAt(0).toUpperCase() + "*******";
}

// --- TWO-LAYER PROFANITY FILTER (VULGAR LANGUAGE CHECK) ---
async function checkProfanity(text) {
    // Layer 1: PurgoMalum API for Global/English Profanity
    try {
        const res = await fetch(`https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(text)}`);
        const isProfane = await res.text();
        if (isProfane === 'true') return true;
    } catch (e) {
        console.error("Profanity API Error", e);
    }

    // Layer 2: Regional/Desi Bad Words Filter (You can add more words here)
    const regionalBadWords = ["lanja", "puku", "modda", "dengu", "gudda", "madarchod", "bhenchod", "chutiya", "randi", "gandu"];
    
    // Removing spaces and special characters to catch sneaky spellings (e.g., "p u k u")
    const lowerText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return regionalBadWords.some(word => lowerText.includes(word));
}

// --- DYNAMIC FOMO SOCIAL TICKER (Real Location & Natural Timing) ---
async function setupDynamicTicker() {
    let localArea = "your area";
    let countryName = "your country";

    // Fetch user's actual location using Free IP API
    try {
        const locRes = await fetch("https://ipapi.co/json/");
        const locData = await locRes.json();
        if (locData.city) localArea = locData.city;
        if (locData.country_name) countryName = locData.country_name;
    } catch (e) {
        console.log("Could not fetch location, using defaults.");
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
    
    // Run ticker naturally (every 25 seconds instead of spamming)
    setInterval(() => {
        const randomText = tickerTexts[Math.floor(Math.random() * tickerTexts.length)];
        ticker.innerText = randomText;
        ticker.classList.remove('hidden');
        ticker.style.opacity = 1;
        
        setTimeout(() => {
            ticker.style.opacity = 0;
            setTimeout(() => ticker.classList.add('hidden'), 500); 
        }, 5000); // Stays visible for 5 seconds
    }, 25000); // 25 seconds wait time makes it look 100% organic and real
}
setupDynamicTicker();

// --- MULTI-PLATFORM VIRAL SHARE LOGIC ---
window.shareToApp = function(platform, targetName) {
    const url = window.location.href;
    const text = `Someone just dropped a Top Secret about ${targetName.toUpperCase()} on OOHA! Do you have the guts to check your vault? 👀👇`;
    
    // NATIVE SHARE FOR MOBILE (Auto-detects phone and opens IG/Snapchat/WhatsApp menus directly)
    if (navigator.share && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        navigator.share({
            title: 'OOHA Secret Vault',
            text: text,
            url: url
        }).catch(err => console.log('Share canceled', err));
        return;
    } 
    
    // DIRECT LINKS FOR DESKTOP/LAPTOP
    if (platform === 'fb') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, 'facebook-share-dialog', 'width=600,height=400');
    } else if (platform === 'Snapchat') {
        window.open(`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'Instagram') {
        navigator.clipboard.writeText(`${text} \n\nLink: ${url}`).then(() => {
            alert("🔥 Text and Link Copied! Open Instagram and paste it into your Story or DM.");
        }).catch(err => {
            alert("Copy your browser link and paste it on Instagram to dare your friends!");
        });
    }
}

function getShareButtonsHtml(name) {
    return `
        <div class="share-buttons-container">
            <button class="share-btn btn-ig" onclick="shareToApp('Instagram', '${name}')">📷 Dare on Instagram Story</button>
            <button class="share-btn btn-snap" onclick="shareToApp('Snapchat', '${name}')">👻 Snap your Friends</button>
            <button class="share-btn btn-fb" onclick="shareToApp('fb', '${name}')">📘 Share on Facebook</button>
        </div>
    `;
}

// --- MODAL LOGIC ---
leaveOohaBtn.addEventListener('click', () => {
    document.getElementById('modal-form-area').classList.remove('hidden');
    document.getElementById('success-message').classList.add('hidden');
    modal.classList.remove('hidden');
});
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

// --- SUBMIT OOHA (WITH PROFANITY FILTER) ---
submitOohaBtn.addEventListener('click', async () => {
    const targetName = document.getElementById('target-name').value.trim().toLowerCase();
    const oohaText = document.getElementById('ooha-text').value.trim();
    const city = document.getElementById('modal-city').value.trim().toLowerCase();
    
    const senderInput = document.getElementById('sender-name');
    const senderName = senderInput ? senderInput.value.trim() : "Anonymous";
    
    const vibeSelect = document.getElementById('vibe-select');
    const vibeValue = vibeSelect ? vibeSelect.value : "";

    if (!targetName || !oohaText || !city) {
        alert("Please fill all required details!");
        return;
    }

    // UX: Show loading state while checking profanity
    const originalBtnText = submitOohaBtn.innerText;
    submitOohaBtn.innerText = "Verifying Security...";
    submitOohaBtn.disabled = true;

    // Run Profanity Filter Check
    const isVulgar = await checkProfanity(oohaText);
    
    if (isVulgar) {
        alert("⚠️ ALERT: Offensive or vulgar language detected. Please keep your Ooha clean and respectful!");
        submitOohaBtn.innerText = originalBtnText;
        submitOohaBtn.disabled = false;
        return; // Stops submission
    }

    try {
        await addDoc(collection(db, "oohas"), {
            name: targetName,
            city: city,
            message: oohaText,
            sender: senderName,
            vibe: vibeValue,
            timestamp: new Date()
        });
        
        document.getElementById('modal-form-area').classList.add('hidden');
        document.getElementById('success-message').classList.remove('hidden');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.getElementById('target-name').value = '';
            document.getElementById('ooha-text').value = '';
            if(senderInput) senderInput.value = '';
            if(vibeSelect) vibeSelect.value = '';
            
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
    } catch (e) { 
        console.error(e); 
    } finally {
        submitOohaBtn.innerText = originalBtnText;
        submitOohaBtn.disabled = false;
    }
});

// --- LOOKUP OOHA (ELITE CARDS & VIRAL HOOK) ---
lookupBtn.addEventListener('click', async () => {
    const nameInput = document.getElementById('search-name');
    const name = nameInput.value.trim().toLowerCase();
    const city = document.getElementById('city-input').value.trim().toLowerCase();
    
    if (!name || !city) { alert("Enter Name and City!"); return; }

    lookupBtn.innerText = "Accessing the vault...";
    resultsSection.innerHTML = "";
    
    try {
        const q = query(collection(db, "oohas"), where("name", "==", name), where("city", "==", city));
        const querySnapshot = await getDocs(q);
        
        lookupBtn.innerText = "Reveal \"Ooha\"";
        
        if (querySnapshot.empty) {
            resultsSection.innerHTML = `
                <div class="provocative-msg">
                    <p style="color:var(--gold-primary); font-size: 1.2rem; font-weight: bold;">The vault is completely silent for ${name.toUpperCase()}...</p>
                    <p style="margin-top: 10px; font-size: 1rem; color: #ccc; line-height: 1.5;">Are people intimidated by you, or do they just not have the courage to say it?</p>
                    ${getShareButtonsHtml(name)}
                </div>
            `;
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const displayCity = data.city.charAt(0).toUpperCase() + data.city.slice(1);
                const maskedSender = maskName(data.sender);
                const vibeHtml = data.vibe ? `<span class="vibe-badge">${data.vibe}</span>` : '';

                resultsSection.innerHTML += `
                    <div class="ooha-card-premium">
                        ${vibeHtml}
                        <div class="card-header">Top Secret</div>
                        <p class="card-message">"${data.message}"</p>
                        <div class="card-footer">
                            <span style="color: var(--gold-hover);">Left by ${maskedSender}</span> <br>
                            Hidden in ${displayCity}
                        </div>
                    </div>
                `;
            });
            resultsSection.innerHTML += getShareButtonsHtml(name);
        }
        
        // Reset Search Fields
        nameInput.value = '';
        document.getElementById('country-input').value = '';
        document.getElementById('country-input').placeholder = "Select Country...";
        document.getElementById('state-input').value = '';
        document.getElementById('state-input').disabled = true;
        document.getElementById('state-input').placeholder = "Select Country First...";
        document.getElementById('city-input').value = '';
        document.getElementById('city-input').disabled = true;
        document.getElementById('city-input').placeholder = "Select State First...";

    } catch (e) {
        console.error(e);
        lookupBtn.innerText = "Reveal \"Ooha\"";
        resultsSection.innerHTML = "<p style='color:red;'>Connection Error. Check console.</p>";
    }
});

// --- AUTOCOMPLETE LOGIC ---
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

// --- FETCH LOCATIONS ---
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
