// --- MODAL LOGIC ---
const leaveOohaBtn = document.getElementById('leave-ooha-btn');
const closeModalBtn = document.getElementById('close-modal');
const modal = document.getElementById('ooha-modal');

leaveOohaBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

// --- LIVE LOCATION API LOGIC ---

// Inputs & Datalists
const countryInput = document.getElementById('country-input');
const stateInput = document.getElementById('state-input');
const cityInput = document.getElementById('city-input');

const countriesList = document.getElementById('countries');
const statesList = document.getElementById('states');
const citiesList = document.getElementById('cities');

// Base API URL
const apiBase = "https://countriesnow.space/api/v0.1/countries";

// 1. Fetch Countries on Page Load
async function loadCountries() {
    try {
        countryInput.placeholder = "Loading Countries...";
        const response = await fetch(apiBase);
        const result = await response.json();
        
        if (!result.error) {
            result.data.forEach(item => {
                let option = document.createElement('option');
                option.value = item.country;
                countriesList.appendChild(option);
            });
            countryInput.placeholder = "Type or Select Country...";
        }
    } catch (error) {
        console.error("Error loading countries:", error);
        countryInput.placeholder = "Failed to load locations";
    }
}

// 2. Fetch States when Country is selected
countryInput.addEventListener('change', async () => {
    const selectedCountry = countryInput.value;
    
    // Clear lower dropdowns
    statesList.innerHTML = '';
    stateInput.value = '';
    citiesList.innerHTML = '';
    cityInput.value = '';
    cityInput.disabled = true;

    if (selectedCountry) {
        stateInput.disabled = false;
        stateInput.placeholder = "Loading States...";
        
        try {
            const response = await fetch(`${apiBase}/states`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: selectedCountry })
            });
            const result = await response.json();
            
            if (!result.error && result.data.states) {
                result.data.states.forEach(state => {
                    let option = document.createElement('option');
                    option.value = state.name;
                    statesList.appendChild(option);
                });
                stateInput.placeholder = "Type or Select State...";
            } else {
                stateInput.placeholder = "No states found";
            }
        } catch (error) {
            console.error("Error loading states:", error);
            stateInput.placeholder = "Error loading states";
        }
    } else {
        stateInput.disabled = true;
    }
});

// 3. Fetch Cities/Towns when State is selected
stateInput.addEventListener('change', async () => {
    const selectedCountry = countryInput.value;
    const selectedState = stateInput.value;
    
    // Clear lower dropdown
    citiesList.innerHTML = '';
    cityInput.value = '';

    if (selectedState) {
        cityInput.disabled = false;
        cityInput.placeholder = "Loading Cities...";
        
        try {
            const response = await fetch(`${apiBase}/state/cities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: selectedCountry, state: selectedState })
            });
            const result = await response.json();
            
            if (!result.error && result.data) {
                result.data.forEach(city => {
                    let option = document.createElement('option');
                    option.value = city;
                    citiesList.appendChild(option);
                });
                cityInput.placeholder = "Type or Select City/Town...";
            } else {
                cityInput.placeholder = "No cities found";
            }
        } catch (error) {
            console.error("Error loading cities:", error);
            cityInput.placeholder = "Error loading cities";
        }
    } else {
        cityInput.disabled = true;
    }
});

// Initialize the app by fetching countries
loadCountries();
