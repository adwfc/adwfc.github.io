// passwordConfig.js

// Passwortschutz aktivieren/deaktivieren
const enablePasswordProtection = true;  // true = aktiv, false = inaktiv

// Der SHA-256 Hash des richtigen Passworts
const correctPasswordHash = "c6637ffab46701f1f145156dafcd21176a85a95c0f5ab71eecb03d15899efd05";

// Funktion zum Ändern des Passworts (z. B. für Admins)
function changePassword(newPassword) {
    const hashBuffer = sha256(newPassword);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Exportiere die Konfiguration
export { enablePasswordProtection, correctPasswordHash, changePassword };
