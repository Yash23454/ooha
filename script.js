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

// --- HELPER ---
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- MODAL LOGIC ---
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

    if (!targetName || !oohaText || !city) {
        alert("Please fill all details!");
        return;
    }

    try {
        await addDoc(collection(db, "oohas"), {
            name: targetName,
            city: city,
            message: oohaText,
            timestamp: new Date()
        });
        
        document.getElementById('modal-form-area').classList.add('hidden');
        document.getElementById('success-message').classList.remove('hidden');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.getElementById('target-name').value = '';
            document.getElementById('ooha-text').value = '';
            document.getElementById('modal-country').value = '';
            document.getElementById('modal-state').value = '';
            document.getElementById('modal-city').value = '';
            document.getElementById('modal-form-area').classList.remove('hidden');
            document.getElementById('success-message').classList.add('hidden');
        }, 2000);
    } catch (e) { console.error(e); }
});

// --- LOOKUP OOHA ---
lookupBtn.addEventListener('click', async () => {
    const nameInput = document.getElementById('search-name');
    const name = nameInput.value.trim().toLowerCase();
    const city = document.getElementById('city-input').value.trim().toLowerCase();
    
    if (!name || !city) { alert("Enter Name and City!"); return; }

    lookupBtn.innerText = "Searching...";
    resultsSection.innerHTML = "";
    
    try {
        const q = query(collection(db, "oohas"), where("name", "==", name), where("city", "==", city));
        const querySnapshot = await getDocs(q);
        
        lookupBtn.innerText = "Reveal \"Ooha\"";
        
        if (querySnapshot.empty) {
            resultsSection.innerHTML = `
                <div class="provocative-msg">
                    <p style="color:var(--gold-primary); font-size: 1.2rem;">The vault is silent for ${name.toUpperCase()}...</p>
                    <p style="margin-top: 10px;">Maybe everyone is too afraid to talk, or maybe they just don't know you exist yet. Start the conversation!</p>
                </div>`;
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                resultsSection.innerHTML += `
                    <div class="ooha-card-premium">
                        <div class="card-header">Secret Thought</div>
                        <p class="card-message">"${data.message}"</p>
                    </div>`;
            });
        }
        
        // Reset Search Fields
        nameInput.value = '';
        document.getElementById('country-input').value = '';
        document.getElementById('state-input').value = '';
        document.getElementById('city-input').value = '';
    } catch (e) {
        console.error(e);
        lookupBtn.innerText = "Reveal \"Ooha\"";
        resultsSection.innerHTML = "Check Firebase Index in Console!";
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
    document.getElementById('country-input').placeholder = "Select Country";
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
    stateInput.placeholder = "Loading...";
    const res = await fetch(`${apiBase}/states`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({country})});
    const data = await res.json();
    const states = data.data.states.map(s => removeAccents(s.name));
    stateInput.placeholder = "Select State";
    setupAutocomplete(stateId, stateList, states, (s) => loadCities(country, s, cityId, cityList));
}

async function loadCities(country, state, cityId, cityList) {
    const cityInput = document.getElementById(cityId);
    cityInput.placeholder = "Loading...";
    const res = await fetch(`${apiBase}/state/cities`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({country, state})});
    const data = await res.json();
    const cities = data.data.map(c => removeAccents(c));
    cityInput.placeholder = "Select City";
    setupAutocomplete(cityId, cityList, cities);
}

loadCountries();
