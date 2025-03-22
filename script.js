const enablePasswordProtection = false; // true = aktiv, false = inaktiv
const correctPasswordHash = "fe7c8b93142029fafe356ee9b2dd09766e6f266141c0c1340b262fc633c16e10";

// Auto-Logout
function autoLogout() {
    setTimeout(function() {
        sessionStorage.removeItem('loggedIn');
        document.getElementById('protectedContent').style.display = 'none';
        document.getElementById('passwordForm').style.display = 'block';
        alert("LOL - automatische Abmeldung nach 20min - Technikgott (auf keinen Fall aus'm Internet geklaut ;)");
    }, 1200000);
}

// PW
async function checkPassword() {
    const enteredPassword = document.getElementById("passwordInput")?.value;

    const hashBuffer = await sha256(enteredPassword);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const enteredPasswordHash = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    if (enteredPasswordHash === correctPasswordHash) {
        document.getElementById("passwordForm").style.display = "none";
        document.getElementById("protectedContent").style.display = "block";
        sessionStorage.setItem('loggedIn', 'true');
        autoLogout();
    } else {
        alert("LOL - frage doch den mächtigen Guru (V)");
    }
}

// Hash
async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return hashBuffer;
}

// Inhalte + Cookies
document.addEventListener("DOMContentLoaded", () => {
    if (!enablePasswordProtection) {
        document.getElementById('protectedContent').style.display = 'block';
        document.getElementById('passwordForm').style.display = 'none';
    } else {
        if (sessionStorage.getItem('loggedIn') === 'true') {
            document.getElementById('protectedContent').style.display = 'block';
            document.getElementById('passwordForm').style.display = 'none';
            autoLogout();
        } else {
            document.getElementById('passwordForm').style.display = 'block';
            document.getElementById('protectedContent').style.display = 'none';
        }
    }

    const cookieBannerClosed = localStorage.getItem('cookieBannerClosed');
    
    if (cookieBannerClosed === 'true') {
        document.getElementById("cookieBanner").style.display = "none";
    } else {
        setTimeout(hideCookieBanner, 30000);
    }

    document.getElementById("passwordInput")?.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            checkPassword();
        }
    });

    fetchResults();
});

// manuelles Schließen Cookies
function hideCookieBanner() {
    document.getElementById("cookieBanner").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("cookieBanner").style.display = "none";
        localStorage.setItem('cookieBannerClosed', 'true');
    }, 1000);
}

// Darkmode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);

    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.setAttribute("name", "theme-color");
        document.head.appendChild(themeColor);
    }
    themeColor.setAttribute("content", isDarkMode ? "#121212" : "#ffffff");
}

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");

        let themeColor = document.querySelector('meta[name="theme-color"]');
        if (!themeColor) {
            themeColor = document.createElement('meta');
            themeColor.setAttribute("name", "theme-color");
            document.head.appendChild(themeColor);
        }
        themeColor.setAttribute("content", "#070f1b");
    }
});


// Abstimmungen
const API_URL = "https://api.jsonstorage.net/v1/json/cc0ffdd9-2174-49c8-b6d0-8cd42b2f79c5/eb0a6cf0-5f4c-4f6e-a090-d267f10c5e39";
const API_KEY = "b6fd1da2-69cc-4768-a9ff-102b5b50db2e";

function hasVoted() {
    return localStorage.getItem("hasVoted") === "true";
}

async function fetchResults() {
    const response = await fetch(API_URL);
    const data = await response.json();
    const totalVotes = data.ja + data.nein;

    if (hasVoted()) {
        document.getElementById("results").style.display = "block";
    }

    const jaPercent = (data.ja / totalVotes) * 100 || 0;
    const neinPercent = (data.nein / totalVotes) * 100 || 0;

    document.getElementById('ja-bar').style.width = jaPercent + "%";
    document.getElementById('nein-bar').style.width = neinPercent + "%";
    document.getElementById('status').innerText = `Ja: ${Math.round(jaPercent)}% | Nein: ${Math.round(neinPercent)}%`;

    if (hasVoted()) {
        disableButtons();
    }
}

async function vote(choice) {
    if (hasVoted()) {
        return;
    }

    localStorage.setItem("hasVoted", "true");

    const response = await fetch(API_URL);
    let data = await response.json();
    data[choice]++;

    await fetch(`${API_URL}?apiKey=${API_KEY}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    document.getElementById("results").style.display = "block";
    fetchResults();
}

function disableButtons() {
    document.getElementById("imp-ja").disabled = true;
    document.getElementById("imp-nein").disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
    fetchResults();
    
    document.getElementById("imp-ja").addEventListener("click", () => vote("ja"));
    document.getElementById("imp-nein").addEventListener("click", () => vote("nein"));
});
