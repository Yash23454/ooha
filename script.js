// --- DOM ELEMENTS ---
const leaveOohaBtn = document.getElementById('leave-ooha-btn');
const closeModalBtn = document.getElementById('close-modal');
const modal = document.getElementById('ooha-modal');
const submitOohaBtn = document.getElementById('submit-ooha-btn');
const lookupBtn = document.getElementById('lookup-btn');
const resultsSection = document.getElementById('results-section');

// Helper function to remove special characters/accents (e.g., Tādepalle -> Tadepalle)
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- MODAL LOGIC & SUCCESS ACKNOWLEDGEMENT ---
leaveOohaBtn.addEventListener('click', () => {
    document.getElementById('modal-form-area').classList.remove('hidden');
    document.getElementById('success-message').classList.add('hidden');
    modal.classList.remove('hidden');
});
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

submitOohaBtn.addEventListener('click', () => {
    // Basic validation
    if(document.getElementById('target-name').value.trim() === '' || document.getElementById('ooha-text').value.trim() === '') {
        alert("Name and your 'Ooha' are required!");
        return;
    }
    // Show nice acknowledgement (Hides form, shows success text)
    document.getElementById('modal-form-area').classList.add('hidden');
    document.getElementById('success-message').classList.remove('hidden');
    
    // Auto-close modal after 3 seconds and reset
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('target-name').value = '';
        document.getElementById('ooha-text').value = '';
        document.getElementById('modal-country').value = '';
        document.getElementById('modal-state').value = '';
        document.getElementById('modal-city').value = '';
        document.getElementById('modal-state').disabled = true;
        document.getElementById('modal-city').disabled = true;
    }, 3000);
});

// --- REVEAL "OOHA" DUMMY LOGIC (Provocative) ---
lookupBtn.addEventListener('click', () => {
    const name = document.getElementById('search-name').value.trim().toLowerCase();
    
    if(!name) {
        alert("Enter a name to reveal their secrets!");
        return;
    }

    lookupBtn.innerText = "Searching the whispers...";
    resultsSection.innerHTML = "";

    setTimeout(() => {
        lookupBtn.innerText = "Reveal \"Ooha\"";
        
        // Dummy data check 
        if(name === 'yash') {
            resultsSection.innerHTML = `
                <div class="ooha-card" style="background: var(--card-bg); padding: 20px; border-left: 3px solid var(--gold-primary); border-radius: 8px; margin-top: 20px; text-align: left;">
                    <p style="color: #ccc; font-style: italic;">"He's secretly a genius when it comes to network routing... and he has a great taste in web design."</p>
                    <small style="color: var(--text-muted); display: block; margin-top: 10px;">- Left from somewhere in the world</small>
                </div>
            `;
        } else {
            // Provocative Empty State
            resultsSection.innerHTML = `
                <div class="provocative-msg" style="margin-top: 20px;">
                    <p>Looks like your board is completely silent.</p>
                    <p style="margin-top: 10px; font-size: 1.1rem;">No one is talking about you... <span class="highlight-text">yet.</span></p>
                    <p style="margin-top: 10px;">Share your link and let the secrets out! People only talk when they know where to drop the "Ooha".</p>
                </div>
            `;
        }
    }, 1500); 
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
        } else {
            list.style.display = 'none';
        }
    });

    newInput.addEventListener('focus', function() {
        if(dataArray.length > 0 && !this.value) {
            list.innerHTML = '';
            list.style.display = 'block';
            dataArray.slice(0, 100).forEach(match => {
                let div = document.createElement('div');
                div.innerHTML = match;
                div.addEventListener('click', () => {
                    newInput.value = match;
                    list.style.display = 'none';
                    if(onSelectCallback) onSelectCallback(match);
                });
                list.appendChild(div);
            });
        }
    });
}

document.addEventListener('click', function (e) {
    document.querySelectorAll('.autocomplete-list').forEach(list => {
        if (!list.parentNode.contains(e.target)) {
            list.style.display = 'none';
        }
    });
});

// --- FETCH LOCATIONS (Main Search & Modal) ---
let globalCountries = [];

async function loadCountries() {
    document.getElementById('country-input').placeholder = "Loading...";
    document.getElementById('modal-country').placeholder = "Loading...";
    
    try {
        const res = await fetch(apiBase);
        if (!res.ok) throw new Error("API Server Down");
        const data = await res.json();
        // Applied removeAccents here
        globalCountries = data.data.map(item => removeAccents(item.country));
    } catch (e) {
        console.error("Live API failed, loading backup data:", e);
        globalCountries = [
            "India", "United States", "United Kingdom", "Australia", 
            "Canada", "Germany", "United Arab Emirates", "Singapore", "New Zealand"
        ];
    }

    document.getElementById('country-input').placeholder = "Type Country...";
    document.getElementById('modal-country').placeholder = "Type Country...";

    setupAutocomplete('country-input', 'country-list', globalCountries, (selected) => {
        loadStates(selected, 'state-input', 'state-list', 'city-input', 'city-list');
    });

    setupAutocomplete('modal-country', 'modal-country-list', globalCountries, (selected) => {
        loadStates(selected, 'modal-state', 'modal-state-list', 'modal-city', 'modal-city-list');
    });
}

async function loadStates(country, stateInputId, stateListId, childCityInputId, childCityListId) {
    const stateInput = document.getElementById(stateInputId);
    const cityInput = document.getElementById(childCityInputId);
    
    stateInput.disabled = false;
    stateInput.value = '';
    stateInput.placeholder = "Loading States...";
    cityInput.disabled = true;
    cityInput.value = '';

    try {
        const res = await fetch(`${apiBase}/states`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: country })
        });
        if (!res.ok) throw new Error("States API failed");
        const data = await res.json();
        
        // Applied removeAccents here
        const states = data.data && data.data.states ? data.data.states.map(s => removeAccents(s.name)) : [];
        stateInput.placeholder = states.length ? "Type State..." : "No states found";
        
        setupAutocomplete(stateInputId, stateListId, states, (selected) => {
            loadCities(country, selected, childCityInputId, childCityListId);
        });
    } catch (e) { 
        console.error(e);
        stateInput.placeholder = "Type State Manually...";
        setupAutocomplete(stateInputId, stateListId, [], () => {
            cityInput.disabled = false;
            cityInput.placeholder = "Type City Manually...";
        });
    }
}

async function loadCities(country, state, cityInputId, cityListId) {
    const cityInput = document.getElementById(cityInputId);
    cityInput.disabled = false;
    cityInput.value = '';
    cityInput.placeholder = "Loading Cities...";

    try {
        const res = await fetch(`${apiBase}/state/cities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: country, state: state })
        });
        if (!res.ok) throw new Error("Cities API failed");
        const data = await res.json();
        
        // Applied removeAccents here
        const cities = data.data ? data.data.map(c => removeAccents(c)) : [];
        cityInput.placeholder = cities.length ? "Type City..." : "No cities found";
        
        setupAutocomplete(cityInputId, cityListId, cities);
    } catch (e) { 
        console.error(e);
        cityInput.placeholder = "Type City Manually...";
        setupAutocomplete(cityInputId, cityListId, []);
    }
}

loadCountries();
