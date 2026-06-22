// Firebase SDKs (Modern Modular Approach)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ⚠️ Ikkada mana actual Firebase project details pettali (Next step lo create cheddam)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements Selection
const leaveOohaBtn = document.getElementById('leave-ooha-btn');
const closeModalBtn = document.getElementById('close-modal');
const modal = document.getElementById('ooha-modal');
const submitOohaBtn = document.getElementById('submit-ooha-btn');
const lookupBtn = document.getElementById('lookup-btn');
const resultsSection = document.getElementById('results-section');

// --- MODAL LOGIC (Open / Close Form) ---
leaveOohaBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Close modal if user clicks outside the box
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// --- SUBMIT A OOHA (Save to Database) ---
submitOohaBtn.addEventListener('click', async () => {
    const targetName = document.getElementById('target-name').value.trim().toLowerCase();
    const oohaText = document.getElementById('ooha-text').value.trim();
    // For now, attaching dummy location, later we will take from dropdowns
    const targetCity = "anantapur";

    if (targetName === "" || oohaText === "") {
        alert("Peru, Ooha rendu enter cheyali mowa!");
        return;
    }

    try {
        submitOohaBtn.innerText = "Sending...";
        // Save to Firebase 'oohas' collection
        await addDoc(collection(db, "oohas"), {
            name: targetName,
            city: targetCity,
            message: oohaText,
            timestamp: new Date()
        });

        alert("Nee Ooha secret ga save aipoyindi!");
        modal.classList.add('hidden');
        document.getElementById('target-name').value = '';
        document.getElementById('ooha-text').value = '';
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Database inka connect avvaledu mowa, config update cheyali.");
    } finally {
        submitOohaBtn.innerText = "Submit Ooha";
    }
});

// --- LOOKUP (Search from Database) ---
lookupBtn.addEventListener('click', async () => {
    const searchName = document.getElementById('search-name').value.trim().toLowerCase();

    if (searchName === "") {
        alert("Evari peru vethakalo enter chey!");
        return;
    }

    resultsSection.innerHTML = "<p style='color: #00f3ff;'>Searching the secrets...</p>";

    try {
        // Query Firebase for matching name
        const q = query(collection(db, "oohas"), where("name", "==", searchName));
        const querySnapshot = await getDocs(q);

        resultsSection.innerHTML = ""; // Clear searching text

        if (querySnapshot.empty) {
            resultsSection.innerHTML = "<p style='color: #777;'>Ee peru meeda elanti Ooha ledu. You are safe (for now)!</p>";
            return;
        }

        // Display results
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const oohaCard = document.createElement('div');
            oohaCard.classList.add('ooha-card');
            oohaCard.innerHTML = `<p>"${data.message}"</p>`;
            resultsSection.appendChild(oohaCard);
        });

    } catch (e) {
        console.error("Error fetching documents: ", e);
        resultsSection.innerHTML = "<p style='color: #ff0055;'>Database error. API keys check chesko.</p>";
    }
});

// --- LOCATION DROPDOWNS (Mock Logic for UI Testing) ---
// Ivi just datalists ni populate cheyadaniki basic logic. 
const countriesList = document.getElementById('countries');
const dummyCountries = ["India", "USA", "UK", "Australia"];

dummyCountries.forEach(country => {
    let option = document.createElement('option');
    option.value = country;
    countriesList.appendChild(option);
});

const countryInput = document.getElementById('country-input');
const stateInput = document.getElementById('state-input');

countryInput.addEventListener('change', () => {
    if (countryInput.value) {
        stateInput.disabled = false;
        // In real app, fetch states here based on countryInput.value
    } else {
        stateInput.disabled = true;
    }
});
