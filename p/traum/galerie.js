import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ziikbioeavgapnjumpju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
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

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const pw = container.querySelector('#galerie-pass').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) return alert("Login fehlgeschlagen");

    const { data: files } = await supabase.storage.from('bilder').list('', { limit: 100 });
    if (!files || files.length === 0) return alert("Keine Bilder gefunden");

    urls = [];
    files.sort((a, b) => a.name.localeCompare(b.name));
    for (const f of files) {
      const { data: signed } = await supabase.storage.from('bilder').createSignedUrl(f.name, 300);
      if (signed?.signedUrl) urls.push(signed.signedUrl);
    }

    form.style.display = 'none';
    galerie.style.display = 'block';
    rakete.style.display = 'block';
    index = 0;
    raketeState = 'links';
    rakete.style.transform = 'translateX(0)';
    zeigeBild(index, galerie);

    rakete.onclick = () => {
      index = (index + 1) % urls.length;
      zeigeBild(index, galerie);
      animateRakete();
    };
  });
}

export function cleanupGalerie() {
  if (rakete) rakete.onclick = null;
  urls = [];
  currentBild = null;
}

function zeigeBild(i, galerie) {
  const container = document.createElement('div');
  container.style = `
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

  container.appendChild(bild);
  container.appendChild(stern);
  galerie.appendChild(container);

  void container.offsetWidth;
  container.style.left = 'calc(50vw - 45vw)';

  if (currentBild) {
    currentBild.style.left = '-120vw';
    setTimeout(() => currentBild.remove(), 1200);
  }

  currentBild = container;
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
