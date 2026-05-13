/* ===========================
   Hero — Mouse parallax on visual
   =========================== */
(function () {
  const visual = document.querySelector('[data-parallax]');
  const hero = document.getElementById('hero');
  if (!visual || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 860px)').matches) return;

  let raf = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    targetX = ((e.clientX - cx) / rect.width) * 24;
    targetY = ((e.clientY - cy) / rect.height) * 24;
    if (!raf) tick();
  });
  hero.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    if (!raf) tick();
  });

  function tick() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    visual.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  }
})();

/* ===========================
   Hero — Stats counter (animate when in view)
   =========================== */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => io.observe(el));
})();

/* ===========================
   Smooth in-page anchor scroll
   (header offset 보정)
   =========================== */
(function () {
  const headerH = 72;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ===========================
   Gallery tab filter (used on gallery.html)
   =========================== */
(function () {
  const tabs = document.querySelectorAll('[data-gallery-tab]');
  const items = document.querySelectorAll('[data-gallery-cat]');
  if (!tabs.length || !items.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.galleryTab;
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      items.forEach((item) => {
        const match = cat === 'all' || item.dataset.galleryCat === cat;
        item.style.display = match ? '' : 'none';
      });
    });
  });
})();

/* ===========================
   Notice tab filter (used on notice.html)
   =========================== */
(function () {
  const tabs = document.querySelectorAll('[data-notice-tab]');
  const rows = document.querySelectorAll('[data-notice-cat]');
  if (!tabs.length || !rows.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.noticeTab;
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      rows.forEach((row) => {
        const match = cat === 'all' || row.dataset.noticeCat === cat;
        row.style.display = match ? '' : 'none';
      });
    });
  });
})();

/* ===========================
   Contact form (frontend only — placeholder submit)
   =========================== */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const agree = form.querySelector('[name="agree"]');
    if (agree && !agree.checked) {
      alert('개인정보 수집·이용에 동의해 주세요.');
      return;
    }
    alert('문의가 정상적으로 접수되었습니다.\n빠른 시일 내에 회신 드리겠습니다.');
    form.reset();
  });
})();
