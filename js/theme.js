'use strict';
// UI preference only. Financial records remain in IndexedDB.
(function () {
    let theme = 'light';
    try { theme = localStorage.getItem('daftar-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (_) {}
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
})();
function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('daftar-theme', dark ? 'dark' : 'light'); } catch (_) {}
    const button = document.getElementById('theme-toggle');
    if (button) {
        button.textContent = dark ? '☀' : '☾';
        button.setAttribute('aria-pressed', String(dark));
        button.setAttribute('aria-label', dark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي');
        button.title = button.getAttribute('aria-label');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0E1523' : '#1F4A8F';
}
function updateHeaderClock(now = new Date()) {
    const el = document.getElementById('header-datetime');
    if (!el) return;
    const pad = n => String(n).padStart(2, '0');
    el.textContent = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} · ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    el.dateTime = now.toISOString();
    el.title = 'التاريخ والوقت المحلي للجهاز · يوم/شهر/سنة';
}
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(document.documentElement.dataset.theme);
    document.getElementById('theme-toggle').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
    updateHeaderClock();
    setInterval(updateHeaderClock, 1000);
});
