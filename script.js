const topbar = document.getElementById('topbar');
const navLinks = Array.from(document.querySelectorAll('.nav__link[data-link]'));

const photosGrid = document.getElementById('photosGrid');
const videosGrid = document.getElementById('videosGrid');

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');

function headerHeight(){
  return topbar?.offsetHeight ?? 0;
}


let lockActiveUntil = 0;
let scrollEndTimer = null;

function lockActive(ms = 700){
  lockActiveUntil = Date.now() + ms;
}
function isLocked(){
  return Date.now() < lockActiveUntil;
}

function smoothScrollTo(selector){
  const el = document.querySelector(selector);
  if (!el) return;

  const y = el.getBoundingClientRect().top + window.scrollY - headerHeight() - 14;

  lockActive(900);
  window.scrollTo({ top: y, behavior: 'smooth' });

  // дебаунс: когда скролл реально остановится — обновим active/theme
  if (scrollEndTimer) clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(() => updateSectionByScroll(true), 950);
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-scroll]');
  if (a){
    e.preventDefault();
    smoothScrollTo(a.getAttribute('data-scroll'));
  }

  const close = e.target.closest('[data-close="1"]');
  if (close) closeModal();

  const nav = e.target.closest('.nav__link[data-link], .nav__brand[data-link]');
  if (nav){
    const id = nav.getAttribute('data-link');
    if (id){
      e.preventDefault();
      
      setActiveNav(id, true);
      setTheme(id);
      smoothScrollTo(`#${id}`);
    }
  }
});

/* ========= MODAL ========= */
function openModal(node){
  modalContent.innerHTML = '';
  modalContent.appendChild(node);

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(){
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalContent.innerHTML = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});

/* ========= WORKS ========= */
const photos = [
  { src: 'assets/works/avatar.jpg' },
  { src: 'assets/works/menu.png' },

  { src: 'assets/works/mp_1.png' },
  { src: 'assets/works/mp_2.png' },
  { src: 'assets/works/mp_3.png' },
  { src: 'assets/works/mp_4.png' },
  { src: 'assets/works/mp_5.png' },
  { src: 'assets/works/mp_6.png' },
  { src: 'assets/works/mp_7.png' },

  { src: 'assets/works/work_7.png' },
  { src: 'assets/works/work_9.png' },
  { src: 'assets/works/work_11.png' },
];

const videos = [
  { video: 'assets/works/vid_1.mp4', preview: 'assets/works/vid_1priev.jpg' },
  { video: 'assets/works/vid_2.mp4', preview: 'assets/works/vid_2priev.jpg' },
  { video: 'assets/works/vid_3.mp4', preview: 'assets/works/vid_3priev.jpg' },
];

function makePhotoTile(item){
  const tile = document.createElement('div');
  tile.className = 'tile';

  const img = document.createElement('img');
  img.className = 'tile__img';
  img.src = item.src;
  img.alt = '';

  tile.appendChild(img);

  tile.addEventListener('click', () => {
    const big = document.createElement('img');
    big.className = 'modal__img';
    big.src = item.src;
    big.alt = '';
    openModal(big);
  });

  return tile;
}

function makeVideoTile(item){
  const tile = document.createElement('div');
  tile.className = 'tile';

  const img = document.createElement('img');
  img.className = 'tile__img';
  img.src = item.preview;
  img.alt = '';

  const play = document.createElement('div');
  play.className = 'tile__play';

  tile.appendChild(img);
  tile.appendChild(play);

  tile.addEventListener('click', () => {
    const v = document.createElement('video');
    v.className = 'modal__video';
    v.src = item.video;
    v.controls = true;

    
    v.autoplay = true;
    v.muted = true;
    v.playsInline = true;

    openModal(v);
    v.play().catch(() => {});
  });

  return tile;
}

function renderWorks(){
  photosGrid.innerHTML = '';
  videosGrid.innerHTML = '';
  photos.forEach(p => photosGrid.appendChild(makePhotoTile(p)));
  videos.forEach(v => videosGrid.appendChild(makeVideoTile(v)));
}

/* ========= THEME + ACTIVE NAV ========= */
const sections = Array.from(document.querySelectorAll('.section[data-theme]'));

let currentTheme = 'home';
let currentActive = 'home';

function setTheme(themeId){
  const theme = (themeId === 'home' || themeId === 'works' || themeId === 'price') ? themeId : 'home';
  if (theme === currentTheme) return;
  currentTheme = theme;
  document.body.dataset.theme = theme;
}

function setActiveNav(id, force = false){
  if (!force && id === currentActive) return;
  currentActive = id;
  navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('data-link') === id));
}

function updateSectionByScroll(force = false){
  if (!force && isLocked()) return; 

  const marker = window.scrollY + headerHeight() + 140;
  let active = sections[0];

  for (const sec of sections){
    if (sec.offsetTop <= marker) active = sec;
  }

  const id = active?.id || 'home';
  setActiveNav(id);
  setTheme(id);
}

let rafLock = false;
window.addEventListener('scroll', () => {
  if (rafLock) return;
  rafLock = true;

  
  if (scrollEndTimer) clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(() => updateSectionByScroll(true), 140);

  requestAnimationFrame(() => {
    updateSectionByScroll(false);
    rafLock = false;
  });
});

/* ========= INIT ========= */
renderWorks();
updateSectionByScroll(true);
