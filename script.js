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
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function maskName(name) {
    if (!name || name.trim() === '') return "Anonymous";
    const cleanName = name.trim();
    if (cleanName.length === 1) return cleanName.toUpperCase() + "*******";
    return cleanName.charAt(0).toUpperCase() + "*******";
}

// --- MODAL LOGIC & SUCCESS ACKNOWLEDGEMENT ---
leaveOohaBtn.addEventListener('click', () => {
    document.getElementById('modal-form-area').classList.remove('hidden');
    document.getElementById('success-message').classList.add('hidden');
    modal.classList.remove('hidden');
});
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

// --- SUBMIT OOHA ---
submitOohaBtn.addEventListener('click', async () => {
    const targetName = document.getElementById('target-name').value.trim().toLowerCase();
    const oohaText = document.getElementById('ooha-text').value.trim();
    const city = document.getElementById('modal-city').value.trim().toLowerCase();
    
    // Capture Sender Name (if field exists, else Anonymous)
    const senderInput = document.getElementById('sender-name');
    const senderName = senderInput ? senderInput.value.trim() : "Anonymous";

    if (!targetName || !oohaText || !city) {
        alert("Please fill all details!");
        return;
    }

    try {
        await addDoc(collection(db, "oohas"), {
            name: targetName,
            city: city,
            message: oohaText,
            sender: senderName, // Saving sender to DB for future monetization
            timestamp: new Date()
        });
        
        document.getElementById('modal-form-area').classList.add('hidden');
        document.getElementById('success-message').classList.remove('hidden');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            // Reset all values cleanly
            document.getElementById('target-name').value = '';
            document.getElementById('ooha-text').value = '';
            if(senderInput) senderInput.value = '';
            
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
        console.error("Error adding document: ", e);
    }
});

// --- LOOKUP OOHA (THE PREMIUM UNBOXING & VIRAL HOOK) ---
lookupBtn.addEventListener('click', async () => {
    const nameInput = document.getElementById('search-name');
    const name = nameInput.value.trim().toLowerCase();
    const city = document.getElementById('city-input').value.trim().toLowerCase();
    
    if (!name || !city) {
        alert("Enter Name and City!");
        return;
    }

    lookupBtn.innerText = "Accessing the vault...";
    resultsSection.innerHTML = "";
    
    try {
        const q = query(collection(db, "oohas"), where("name", "==", name), where("city", "==", city));
        const querySnapshot = await getDocs(q);
        
        lookupBtn.innerText = "Reveal \"Ooha\"";
        
        if (querySnapshot.empty) {
            // VIRAL PROVOCATIVE MESSAGE
            resultsSection.innerHTML = `
                <div class="provocative-msg">
                    <p style="color:var(--gold-primary); font-size: 1.2rem; font-weight: bold;">The vault is completely silent for ${name.toUpperCase()}...</p>
                    <p style="margin-top: 10px; font-size: 1rem; color: #ccc; line-height: 1.5;">Are people intimidated by you, or do they just not have the courage to say it? <br><br><span style="color: #fff;">Share your link and challenge them to break the silence. Let's see who drops the first "Ooha".</span></p>
                </div>
            `;
        } else {
            // ELITE PREMIUM CARDS WITH MASKED NAME
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const displayCity = data.city.charAt(0).toUpperCase() + data.city.slice(1);
                
                // Fetch and mask the sender name
                const maskedSender = maskName(data.sender);

                resultsSection.innerHTML += `
                    <div class="ooha-card-premium">
                        <div class="card-header">Top Secret</div>
                        <p class="card-message">"${data.message}"</p>
                        <div class="card-footer">
                            <span style="color: var(--gold-hover);">Left by ${maskedSender}</span> <br>
                            Hidden in ${displayCity}
                        </div>
                    </div>
                `;
            });
        }
        
        // Reset Search Fields and Lock Dropdowns
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
        resultsSection.innerHTML = "<p style='color:red;'>Error connecting to vault. Check console.</p>";
    }
});

// --- CUSTOM AUTOCOMPLETE DROPDOWN LOGIC ---
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

// --- FETCH LOCATIONS (WITH EXACT PLACEHOLDERS) ---
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
