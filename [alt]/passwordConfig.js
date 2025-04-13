// passwordConfig.js

// Passwortschutz aktivieren/deaktivieren
const enablePasswordProtection = false;  // true = aktiv, false = inaktiv

// Der SHA-256 Hash des richtigen Passworts (Beispiel)
const correctPasswordHash = "c6637ffab46701f1f145156dafcd21176a85a95c0f5ab71eecb03d15899efd05";

// Funktion zum Ändern des Passworts (z. B. für Admins)
function changePassword(newPassword) {
    const hashBuffer = sha256(newPassword);  // SHA-256 Hash berechnen
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Exportiere die Konfiguration
export { enablePasswordProtection, correctPasswordHash, changePassword };

// Hilfsfunktion zur Berechnung des SHA-256 Hashes
async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return hashBuffer;
}
