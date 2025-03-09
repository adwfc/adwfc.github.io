const fetch = require('node-fetch');  // Installiere node-fetch mit `npm install node-fetch`

exports.handler = async function(event, context) {
    // Setze hier deine Auth0 Informationen (mit Environment Variables)
    const CLIENT_ID = process.env.CLIENT_ID;  // Client ID aus den Umgebungsvariablen
    const CLIENT_SECRET = process.env.CLIENT_SECRET;  // Client Secret aus den Umgebungsvariablen
    const DOMAIN = "dev-8ywvc6vxej5g5aok.eu.auth0.com"; // Deine Auth0-Domain
    const API_URL = `https://${DOMAIN}/api/v2/users/`;

    // Überprüfe, ob die Anfrage ein POST-Request ist
    if (event.httpMethod === 'POST') {
        const { username, oldPassword, newPassword } = JSON.parse(event.body);

        try {
            // Holen des Access Tokens, um mit der Auth0 API zu kommunizieren
            const tokenResponse = await fetch(`https://${DOMAIN}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    audience: `https://${DOMAIN}/api/v2/`,
                    grant_type: 'client_credentials'
                })
            });

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Suchen des Benutzers anhand des Benutzernamens
            const userResponse = await fetch(`${API_URL}by-username/${username}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!userResponse.ok) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Benutzer nicht gefunden." })
                };
            }

            const user = await userResponse.json();
            const userId = user.user_id;

            // Passwort-Änderung anfordern
            const updateResponse = await fetch(`${API_URL}${userId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: newPassword
                })
            });

            if (updateResponse.ok) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: "Passwort erfolgreich geändert." })
                };
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Fehler bei der Passwortänderung." })
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Serverfehler." })
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method not allowed" })
    };
};
