import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- MODAL & LOGIC ELEMENTS ---
const leaveOohaBtn = document.getElementById('leave-ooha-btn');
const closeModalBtn = document.getElementById('close-modal');
const modal = document.getElementById('ooha-modal');
const submitOohaBtn = document.getElementById('submit-ooha-btn');
const lookupBtn = document.getElementById('lookup-btn');
const resultsSection = document.getElementById('results-section');

// --- SUBMIT OOHA TO FIRESTORE ---
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
            location.reload(); // Refresh to clean state
        }, 2000);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
});

// --- LOOKUP OOHA FROM FIRESTORE ---
lookupBtn.addEventListener('click', async () => {
    const name = document.getElementById('search-name').value.trim().toLowerCase();
    const city = document.getElementById('city-input').value.trim().toLowerCase();
    
    if (!name || !city) {
        alert("Enter Name and City!");
        return;
    }

    resultsSection.innerHTML = "Searching...";
    
    try {
        const q = query(collection(db, "oohas"), where("name", "==", name), where("city", "==", city));
        const querySnapshot = await getDocs(q);
        
        resultsSection.innerHTML = "";
        if (querySnapshot.empty) {
            resultsSection.innerHTML = `<p class="provocative-msg">No "Ooha" found for ${name} in ${city}. You're safe!</p>`;
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                resultsSection.innerHTML += `
                    <div class="ooha-card">
                        <p>"${data.message}"</p>
                    </div>
                `;
            });
        }
    } catch (e) {
        console.error(e);
        resultsSection.innerHTML = "Error fetching data.";
    }
});

// ... (Autocomplete functions remain same as before) ...
