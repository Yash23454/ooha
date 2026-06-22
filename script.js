// --- DOM ELEMENTS ---
const leaveOohaBtn = document.getElementById('leave-ooha-btn');
const closeModalBtn = document.getElementById('close-modal');
const modal = document.getElementById('ooha-modal');
const submitOohaBtn = document.getElementById('submit-ooha-btn');
const lookupBtn = document.getElementById('lookup-btn');
const resultsSection = document.getElementById('results-section');

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
    // Show nice acknowledgement
    document.getElementById('modal-form-area').classList.add('hidden');
    document.getElementById('success-message').classList.remove('hidden');
    
    // Auto-close modal after 3 seconds
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('target-name').value = '';
        document.getElementById('ooha-text').value = '';
    }, 3000);
});

// --- REVEAL "OOHA" DUMMY LOGIC (Provocative) ---
lookupBtn.addEventListener('click', () => {
    const name = document.getElementById('search-name').value.trim().toLowerCase();
    const city = document.getElementById('city-input').value.trim().toLowerCase();
    
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
    }, 1500); // Fake delay for dramatic effect
});

// --- CUSTOM AUTOCOMPLETE DROPDOWN LOGIC ---
const apiBase = "https://countriesnow.space/api/v0.1/countries";

// Reusable function to handle custom dropdowns
function setupAutocomplete(inputId, listId, dataArray, onSelectCallback) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    // Clear previous event listeners by cloning
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

    // Show all options when focused
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

// Close dropdowns when clicking outside
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
        globalCountries = data.data.map(item => item.country);
    } catch (e) {
        console.error("Live API failed, loading backup data:", e);
        // Fallback safety net
        globalCountries = [
            "India", "United States", "United Kingdom", "Australia", 
            "Canada", "Germany", "United Arab Emirates", "Singapore", "New Zealand"
        ];
    }

    document.getElementById('country-input').placeholder = "Type Country...";
    document.getElementById('modal-country').placeholder = "Type Country...";

    // Setup Main Search Country
    setupAutocomplete('country-input', 'country-list', globalCountries, (selected) => {
        loadStates(selected, 'state-input', 'state-list', 'city-input');
    });

    // Setup Modal Country
    setupAutocomplete('modal-country', 'modal-country-list', globalCountries, (selected) => {
        loadStates(selected, 'modal-state', 'modal-state-list', 'modal-city');
    });
}

async function loadStates(country, stateInputId, stateListId, childCityInputId) {
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
        
        const states = data.data && data.data.states ? data.data.states.map(s => s.name) : [];
        stateInput.placeholder = states.length ? "Type State..." : "No states found";
        
        setupAutocomplete(stateInputId, stateListId, states, (selected) => {
            loadCities(country, selected, childCityInputId, childCityInputId.replace('-input', '-list'));
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
        
        const cities = data.data || [];
        cityInput.placeholder = cities.length ? "Type City..." : "No cities found";
        
        setupAutocomplete(cityInputId, cityListId, cities);
    } catch (e) { 
        console.error(e);
        cityInput.placeholder = "Type City Manually...";
        setupAutocomplete(cityInputId, cityListId, []);
    }
}

// Initialize the app by fetching countries
loadCountries();
