// script.js


// Passwortschutz aktivieren/deaktivieren
const enablePasswordProtection = false; // true = aktiv, false = inaktiv

// Der SHA-256 Hash des richtigen Passworts
const correctPasswordHash = "fe7c8b93142029fafe356ee9b2dd09766e6f266141c0c1340b262fc633c16e10";

// Auto-Logout
function autoLogout() {
    setTimeout(function() {
        sessionStorage.removeItem('loggedIn');
        document.getElementById('protectedContent').style.display = 'none';
        document.getElementById('passwordForm').style.display = 'block';
        alert("LOL - automatische Abmeldung nach 20min - Technikgott (auf keinen Fall aus'm Internet geklaut ;)");
    }, 1200000); // 1200000 Millisekunden = 20 Minuten
}

// PW
async function checkPassword() {
    const enteredPassword = document.getElementById("passwordInput").value;

    const hashBuffer = await sha256(enteredPassword);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const enteredPasswordHash = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    if (enteredPasswordHash === correctPasswordHash) {
        document.getElementById("passwordForm").style.display = "none";
        document.getElementById("protectedContent").style.display = "block";
        sessionStorage.setItem('loggedIn', 'true');
        autoLogout(); 
    } else {
        alert("Falsches Passwort!");
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
window.onload = function() {
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
        setTimeout(hideCookieBanner, 30000); // 30 Sek
    }

    // Enter-Taste
    document.getElementById("passwordInput").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            checkPassword(); 
        }
    });
};


// Funktion, um den Banner manuell zu schließen
function hideCookieBanner() {
    document.getElementById("cookieBanner").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("cookieBanner").style.display = "none";
        // Speichern, dass der Banner geschlossen wurde
        localStorage.setItem('cookieBannerClosed', 'true');
    }, 1000); // Verzögerung, damit die Ausblendung sichtbar ist
}