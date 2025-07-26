import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Initialisierung
const supabase = createClient(
  'https://ziikbioeavgapnjumpju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaWtiaW9lYXZnYXBuanVtcGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTc4MzIsImV4cCI6MjA2ODc5MzgzMn0.IK147XNWr8E8INYsgYZP45vME0CAASM2LBQWKuaJgyw'
);

// Statischer Login
const email = "test@example.com";

// Zustand
let index = 0;
let urls = [];
let currentBild = null;
let rakete = null;
let raketeState = 'links';

// === Galerie Initialisieren ===
export function initGalerie(container) {
  container.innerHTML = `
    <form id="galerie-login" style="text-align:center; color:white; margin-top:2rem;">
      <h1>✨ Zugang zur Galerie</h1>
      <input type="password" id="galerie-pass" placeholder="Passwort eingeben" required style="padding:1rem; font-size:1rem;" />
      <button type="submit" style="padding:1rem;">Start</button>
    </form>
    <div id="galerie-view" style="display:none; position:relative; width:100vw; height:90vh; overflow:hidden;"></div>
    <img id="rakete" src="rakete.png" style="display:none; position:fixed; bottom:1rem; left:1rem; width:50px; cursor:pointer;" />
  `;

  rakete = container.querySelector('#rakete');
  const form = container.querySelector('#galerie-login');
  const galerie = container.querySelector('#galerie-view');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const passwordInput = container.querySelector('#galerie-pass');
    if (!passwordInput) {
      console.error("❌ Passwortfeld nicht gefunden!");
      alert("Interner Fehler: Passwortfeld nicht gefunden.");
      return;
    }

    const password = passwordInput.value;

    try {
      // Login
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        console.error('❌ Login-Fehler:', loginError.message);
        alert("Login fehlgeschlagen: " + loginError.message);
        return;
      }

      // Bilderliste abrufen
      const { data: files, error: listErr } = await supabase.storage.from('bilder').list('', { limit: 100 });
      if (listErr || !files || files.length === 0) {
        console.error('❌ Fehler beim Abrufen der Bilder:', listErr?.message || "keine Daten");
        alert("Fehler beim Abrufen der Galerie oder keine Bilder gefunden.");
        return;
      }

      files.sort((a, b) => a.name.localeCompare(b.name));
      urls = [];

      for (const file of files) {
        const { data: signed, error: urlErr } = await supabase
          .storage
          .from('bilder')
          .createSignedUrl(file.name, 300);
        if (!urlErr && signed?.signedUrl) {
          urls.push(signed.signedUrl);
        } else {
          console.warn(`⚠️ Fehler bei ${file.name}: ${urlErr?.message}`);
        }
      }

      if (urls.length === 0) {
        alert("⚠️ Keine gültigen URLs gefunden.");
        return;
      }

      // Erstes Bild zeigen
      zeigeBild(index, galerie);
      form.style.display = 'none';
      galerie.style.display = 'block';
      rakete.style.display = 'block';
      raketeState = 'links';
      rakete.style.transform = 'translateX(0)';

      // Rakete aktivieren
      rakete.onclick = () => {
        index = (index + 1) % urls.length;
        zeigeBild(index, galerie);
        animateRakete();
      };

    } catch (err) {
      console.error('❌ Unerwarteter Fehler:', err);
      alert("Ein unerwarteter Fehler ist aufgetreten.");
    }
  });
}

// === Galerie Bereinigen ===
export function cleanupGalerie() {
  if (rakete) rakete.onclick = null;
  urls = [];
  currentBild = null;
}

// === Bild mit Preload und Fallback anzeigen ===
function zeigeBild(i, galerie) {
  const originalURL = urls[i];
  const fallbackURL = 'thumbnail.png';

  const testImage = new Image();
  testImage.onload = () => {
    baueBildContainer(originalURL, galerie);
  };
  testImage.onerror = () => {
    console.warn(`⚠️ Bild bei ${originalURL} fehlgeschlagen. Nutze fallback.`);
    baueBildContainer(fallbackURL, galerie);
  };
  testImage.src = originalURL;
}

// === Bildcontainer erzeugen ===
function baueBildContainer(imageSrc, galerie) {
  const neuerContainer = document.createElement('div');
  neuerContainer.style = `
    position: absolute;
    top: 50%;
    left: 120vw;
    width: 90vw;
    transform: translateY(-50%);
    transition: left 1.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const bild = document.createElement('img');
  bild.src = imageSrc;
  bild.style = 'width: 70%; z-index:2;';

  const stern = document.createElement('img');
  stern.src = 'stern.png';
  stern.style = 'position:absolute; width:90vw; z-index:3;';

  neuerContainer.appendChild(bild);
  neuerContainer.appendChild(stern);
  galerie.appendChild(neuerContainer);

  // Animation auslösen
  requestAnimationFrame(() => {
    neuerContainer.style.left = 'calc(50vw - 45vw)';
  });

  // Vorheriges Bild animiert entfernen
  if (currentBild && currentBild !== neuerContainer) {
    currentBild.style.left = '-120vw';
    const toRemove = currentBild;
    setTimeout(() => toRemove.remove(), 1300);
  }

  currentBild = neuerContainer;
}

// === Raketenanimation ===
function animateRakete() {
  if (!rakete) return;

  if (raketeState === 'links') {
    rakete.style.transform = 'translateX(70vw)';
    raketeState = 'mitte';
  } else if (raketeState === 'mitte') {
    rakete.style.transform = 'translateX(120vw)';
    raketeState = 'rechts';
    setTimeout(() => {
      rakete.style.transition = 'none';
      rakete.style.transform = 'translateX(-100px)';
      void rakete.offsetWidth;
      rakete.style.transition = 'transform 1s ease';
      rakete.style.transform = 'translateX(0)';
      raketeState = 'links';
    }, 300);
  }
                      }
        
