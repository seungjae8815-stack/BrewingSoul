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
   Lightbox (gallery image viewer)
   =========================== */
(function () {
  const triggers = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!triggers.length) return;

  // Build lightbox markup
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = `
    <span class="lb-counter" aria-live="polite">
      <span class="current">01</span><span class="total"> / 10</span>
    </span>
    <div class="lb-toolbar" role="toolbar" aria-label="줌 컨트롤">
      <button class="lb-tool lb-zoom-out" aria-label="축소">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M5 12h14"/></svg>
      </button>
      <span class="lb-zoom-percent">100%</span>
      <button class="lb-tool lb-zoom-in" aria-label="확대">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <span class="lb-divider"></span>
      <button class="lb-tool lb-zoom-reset" aria-label="원본 크기로 초기화">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/></svg>
      </button>
    </div>
    <button class="lb-btn lb-close" aria-label="닫기">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <button class="lb-btn lb-prev" aria-label="이전 이미지">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
    </button>
    <button class="lb-btn lb-next" aria-label="다음 이미지">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
    </button>
    <div class="lb-stage">
      <div class="lb-img-wrap">
        <img class="lb-img" alt="" draggable="false" />
      </div>
      <div class="lb-caption">
        <span class="tag"></span>
        <h4></h4>
        <span class="meta"></span>
      </div>
    </div>
    <div class="lb-hint">
      <span><kbd>←</kbd><kbd>→</kbd> 이동</span>
      <span><kbd>+</kbd><kbd>−</kbd> 줌</span>
      <span><kbd>0</kbd> 원본</span>
      <span><kbd>ESC</kbd> 닫기</span>
    </div>
  `;
  document.body.appendChild(lb);

  const $img = lb.querySelector('.lb-img');
  const $imgWrap = lb.querySelector('.lb-img-wrap');
  const $tag = lb.querySelector('.lb-caption .tag');
  const $title = lb.querySelector('.lb-caption h4');
  const $meta = lb.querySelector('.lb-caption .meta');
  const $cur = lb.querySelector('.lb-counter .current');
  const $tot = lb.querySelector('.lb-counter .total');
  const $percent = lb.querySelector('.lb-zoom-percent');
  const $zoomIn = lb.querySelector('.lb-zoom-in');
  const $zoomOut = lb.querySelector('.lb-zoom-out');
  const $zoomReset = lb.querySelector('.lb-zoom-reset');

  let currentList = [];
  let idx = 0;

  // ===== Zoom state =====
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 5;
  const ZOOM_STEP = 0.5;
  let scale = 1;
  let tx = 0, ty = 0;
  let dragging = false;
  let dragStartX = 0, dragStartY = 0;
  let dragStartTx = 0, dragStartTy = 0;

  function applyTransform(animated = true) {
    $img.style.transition = animated
      ? 'opacity 0.3s ease, transform 0.32s cubic-bezier(0.2, 0.7, 0.2, 1)'
      : 'opacity 0.3s ease';
    $img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    $img.classList.toggle('is-zoomed', scale > 1);
    lb.classList.toggle('is-zoomed', scale > 1);
    $percent.textContent = Math.round(scale * 100) + '%';
    $zoomOut.disabled = scale <= ZOOM_MIN;
    $zoomIn.disabled = scale >= ZOOM_MAX;
    $zoomReset.disabled = scale === 1 && tx === 0 && ty === 0;
  }

  function resetZoom(animated = true) {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform(animated);
  }

  function clampPan() {
    // Limit pan so image edges roughly stay within view
    const rect = $img.getBoundingClientRect();
    const limitX = Math.max(0, (rect.width - $imgWrap.clientWidth) / 2);
    const limitY = Math.max(0, (rect.height - $imgWrap.clientHeight) / 2);
    tx = Math.max(-limitX, Math.min(limitX, tx));
    ty = Math.max(-limitY, Math.min(limitY, ty));
  }

  function zoomTo(newScale, animated = true) {
    newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale));
    if (newScale === scale) return;
    scale = newScale;
    if (scale === 1) { tx = 0; ty = 0; }
    else clampPan();
    applyTransform(animated);
  }

  const visible = () => triggers.filter((t) => t.offsetParent !== null);

  function open(trigger) {
    currentList = visible();
    idx = currentList.indexOf(trigger);
    if (idx < 0) idx = 0;
    resetZoom(false);
    update();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => resetZoom(false), 300);
  }
  function next() {
    if (!currentList.length) return;
    idx = (idx + 1) % currentList.length;
    resetZoom(false);
    update();
  }
  function prev() {
    if (!currentList.length) return;
    idx = (idx - 1 + currentList.length) % currentList.length;
    resetZoom(false);
    update();
  }
  function update() {
    const item = currentList[idx];
    if (!item) return;
    lb.classList.add('is-loading');

    const tmp = new Image();
    tmp.onload = () => {
      $img.src = tmp.src;
      $img.alt = item.dataset.title || '';
      lb.classList.remove('is-loading');
    };
    tmp.onerror = () => lb.classList.remove('is-loading');
    tmp.src = item.dataset.src;

    $tag.textContent = item.dataset.tag || '';
    $title.textContent = item.dataset.title || '';
    $meta.textContent = item.dataset.meta || '';

    const pad = (n) => String(n).padStart(2, '0');
    $cur.textContent = pad(idx + 1);
    $tot.textContent = ' / ' + pad(currentList.length);
  }

  // Wire triggers
  triggers.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      open(t);
    });
  });

  // Controls
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  lb.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); next(); });
  $zoomIn.addEventListener('click', (e) => { e.stopPropagation(); zoomTo(scale + ZOOM_STEP); });
  $zoomOut.addEventListener('click', (e) => { e.stopPropagation(); zoomTo(scale - ZOOM_STEP); });
  $zoomReset.addEventListener('click', (e) => { e.stopPropagation(); resetZoom(); });

  // Backdrop click → close (only if click is on lightbox bg, not children)
  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });

  // ===== Click image to toggle zoom =====
  $img.addEventListener('click', (e) => {
    e.stopPropagation();
    if (scale === 1) zoomTo(2);
    else resetZoom();
  });
  $img.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (scale < 3) zoomTo(3);
    else resetZoom();
  });

  // ===== Wheel zoom =====
  $imgWrap.addEventListener('wheel', (e) => {
    if (!lb.classList.contains('is-open')) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    zoomTo(scale + delta);
  }, { passive: false });

  // ===== Mouse drag to pan =====
  $img.addEventListener('mousedown', (e) => {
    if (scale === 1) return;
    e.preventDefault();
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTx = tx;
    dragStartTy = ty;
    $img.classList.add('is-dragging');
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    tx = dragStartTx + (e.clientX - dragStartX);
    ty = dragStartTy + (e.clientY - dragStartY);
    clampPan();
    applyTransform(false);
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    $img.classList.remove('is-dragging');
  });

  // ===== Touch: pinch-zoom + drag pan + swipe =====
  let touchStartX = 0, touchStartY = 0;
  let pinchStartDist = 0, pinchStartScale = 1;
  let panning = false;
  let panStartTx = 0, panStartTy = 0;

  const dist = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  lb.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchStartDist = dist(e.touches[0], e.touches[1]);
      pinchStartScale = scale;
    } else if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      if (scale > 1) {
        panning = true;
        panStartTx = tx;
        panStartTy = ty;
      }
    }
  }, { passive: true });

  lb.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = dist(e.touches[0], e.touches[1]);
      const ratio = d / pinchStartDist;
      zoomTo(pinchStartScale * ratio, false);
    } else if (e.touches.length === 1 && panning) {
      e.preventDefault();
      tx = panStartTx + (e.touches[0].clientX - touchStartX);
      ty = panStartTy + (e.touches[0].clientY - touchStartY);
      clampPan();
      applyTransform(false);
    }
  }, { passive: false });

  lb.addEventListener('touchend', (e) => {
    if (panning) {
      panning = false;
      return;
    }
    // Swipe nav (only when not zoomed)
    if (scale === 1 && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      }
    }
  }, { passive: true });

  // ===== Keyboard =====
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomTo(scale + ZOOM_STEP); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomTo(scale - ZOOM_STEP); }
    else if (e.key === '0') { e.preventDefault(); resetZoom(); }
  });

  // Init button state
  applyTransform(false);
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
   Contact form (FormSubmit.co integration)
   =========================== */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const agree = form.querySelector('[name="개인정보동의"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

  // Pre-submit validation (allow native submit if OK)
  form.addEventListener('submit', (e) => {
    // 동의 체크 확인
    if (agree && !agree.checked) {
      e.preventDefault();
      alert('개인정보 수집·이용에 동의해 주세요.');
      agree.focus();
      return;
    }
    // HTML5 native required 검증
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    // 전송 중 표시
    submitBtn.disabled = true;
    submitBtn.classList.add('is-sending');
    if (btnText) btnText.textContent = '전송 중...';
    // (form will now submit naturally to FormSubmit.co)
  });

  // ?sent=1 일 때 성공 토스트 표시
  if (new URLSearchParams(window.location.search).get('sent') === '1') {
    const toast = document.createElement('div');
    toast.className = 'form-toast';
    toast.innerHTML = `
      <span class="form-toast-ico">✓</span>
      <div>
        <strong>문의가 정상적으로 접수되었습니다.</strong>
        <p>영업일 기준 2~3일 내에 회신 드리겠습니다.</p>
      </div>
      <button class="form-toast-close" aria-label="닫기">×</button>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-shown'));

    const close = () => {
      toast.classList.remove('is-shown');
      setTimeout(() => toast.remove(), 400);
      // URL에서 ?sent=1 제거
      const url = new URL(window.location.href);
      url.searchParams.delete('sent');
      history.replaceState({}, '', url);
    };
    toast.querySelector('.form-toast-close').addEventListener('click', close);
    setTimeout(close, 6000);

    // 문의 폼 영역으로 스크롤
    setTimeout(() => {
      const target = document.getElementById('contactForm');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
})();
