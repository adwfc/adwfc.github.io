import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ziikbioeavgapnjumpju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaWtiaW9lYXZnYXBuanVtcGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTc4MzIsImV4cCI6MjA2ODc5MzgzMn0.IK147XNWr8E8INYsgYZP45vME0CAASM2LBQWKuaJgyw'
);

const email = "test@example.com";
let index = 0;
let urls = [];
let currentBild = null;
let rakete = null;
let raketeState = 'links';

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
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.error('❌ Login-Fehler:', loginError.message);
      alert("Login fehlgeschlagen: " + loginError.message);
      return;
    }

    const { data: files, error: listErr } = await supabase
      .storage
      .from('bilder')
      .list('', { limit: 100 });

    if (listErr) {
      console.error('❌ Fehler beim Abrufen der Bilder:', listErr.message);
      alert("Fehler beim Abrufen der Galerie: " + listErr.message);
      return;
    }

    if (!files || files.length === 0) {
      alert("⚠️ Keine Bilder gefunden.");
      return;
    }

    files.sort((a, b) => a.name.localeCompare(b.name));
    urls = [];

    for (const file of files) {
      const { data: signed, error: urlErr } = await supabase
        .storage
        .from('bilder')
        .createSignedUrl(file.name, 300);
      if (urlErr) {
        console.warn(`⚠️ Fehler beim URL-Generieren für ${file.name}:`, urlErr.message);
        continue;
      }
      urls.push(signed.signedUrl);
    }

    if (urls.length === 0) {
      alert("⚠️ Keine gültigen URLs konnten erzeugt werden.");
      return;
    }

zeigeBild(index, galerie);
form.style.display = 'none';
galerie.style.display = 'block';
rakete.style.display = 'block';
raketeState = 'links';
rakete.style.transform = 'translateX(0)';

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

export function cleanupGalerie() {
  if (rakete) rakete.onclick = null;
  urls = [];
  currentBild = null;
}

function zeigeBild(i, galerie) {
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
  bild.src = urls[i];
  bild.style = 'width: 70%; z-index:2;';

  const stern = document.createElement('img');
  stern.src = 'stern.png';
  stern.style = 'position:absolute; width:90vw; z-index:3;';

  neuerContainer.appendChild(bild);
  neuerContainer.appendChild(stern);
  galerie.appendChild(neuerContainer);

  // Trigger animation
  requestAnimationFrame(() => {
    neuerContainer.style.left = 'calc(50vw - 45vw)';
  });

  // Entferne vorheriges Bild NACH der Animation
  if (currentBild && currentBild !== neuerContainer) {
    currentBild.style.left = '-120vw';
    const toRemove = currentBild;
    setTimeout(() => {
      toRemove.remove();
    }, 1300);
  }

  currentBild = neuerContainer;
}

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
