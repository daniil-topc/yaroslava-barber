// Ярослава, барбер: меню, поява секцій, слоган по словах, закріплена кнопка, активний пункт меню.
// Усе на IntersectionObserver, без обробників scroll, щоб не навантажувати телефон.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Перемикач теми ---------- */
const root = document.documentElement;
const themeBtn = document.querySelector('.theme-toggle');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function savedTheme() {
  try { return localStorage.getItem('theme'); } catch (e) { return null; }
}
function applyTheme(theme, animate) {
  if (animate && !reduceMotion) {
    root.classList.add('theme-anim');
    setTimeout(() => root.classList.remove('theme-anim'), 400);
  }
  root.setAttribute('data-theme', theme);
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
  // Колір панелі браузера на телефоні
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff'));
}
applyTheme(root.getAttribute('data-theme'), false);

themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
  try { localStorage.setItem('theme', next); } catch (e) {}
});
// Поки людина сама не обрала тему, сайт іде за системою
systemDark.addEventListener('change', (e) => {
  if (!savedTheme()) applyTheme(e.matches ? 'dark' : 'light', true);
});

/* ---------- Мобільне меню ---------- */
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  document.body.classList.toggle('menu-open', open);
  if (open) {
    menu.hidden = false;
    // Кадр затримки, щоб браузер встиг показати меню до старту переходу
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
  } else {
    menu.classList.remove('is-open');
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 300);
  }
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });

/* ---------- Поява секцій (один раз) ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Слоган: слова проявляються по черзі, коли перетинають лінію на 65% висоти екрана ---------- */
const tagline = document.querySelector('[data-words]');
if (tagline && !reduceMotion) {
  // Розбиваємо текст на слова, зберігаючи перенос <br>
  const parts = tagline.innerHTML.split(/(<br\s*\/?>)/i);
  tagline.innerHTML = parts.map((part) => (
    /^<br/i.test(part) ? part : part.split(/(\s+)/).map((w) => (w.trim() ? `<span class="w">${w}</span>` : w)).join('')
  )).join('');

  const wordObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        wordObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -35% 0px', threshold: 1 });
  tagline.querySelectorAll('.w').forEach((w) => wordObserver.observe(w));
}

/* ---------- Закріплена кнопка запису: видно, коли кнопка hero пішла з екрана ---------- */
const heroCta = document.getElementById('hero-cta');
const sticky = document.getElementById('sticky-cta');
const stickyLink = sticky.querySelector('a');
new IntersectionObserver(([entry]) => {
  const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
  sticky.classList.toggle('is-visible', show);
  sticky.setAttribute('aria-hidden', String(!show));
  stickyLink.tabIndex = show ? 0 : -1;
}).observe(heroCta);

/* ---------- Активний пункт меню ---------- */
const navLinks = [...document.querySelectorAll('.nav__links a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
// Секція вважається поточною, коли перетинає смугу посередині екрана
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => {
      if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => s && sectionObserver.observe(s));
