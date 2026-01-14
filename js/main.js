// main.js - ฟังก์ชันที่ใช้ร่วมกัน (news listing, search, load more, contact form UX)
// รวม: scroll-reveal (IntersectionObserver) และ tilt (mouse parallax)
// ปรับปรุง: สร้าง detail link และ normalize image path ให้ถูกต้องเมื่ออยู่ใน /news/ หรือ root

document.addEventListener('DOMContentLoaded', () => {
  // elements
  const newsListEl = document.getElementById('newsList');
  const searchEl = document.getElementById('searchNews');
  const clearSearchBtn = document.getElementById('clearSearch');
  const loadMoreBtn = document.getElementById('loadMore');
  const newsCountEl = document.getElementById('newsCount');

  let allNews = [];
  let displayedCount = 6;
  const pageSize = 6;

  // --- fallback data ---
  const newsFallback = [
    {
      "id": "003",
      "title": "เตรียมเปิดสายการผลิตสูตรใหม่สำหรับลูกสุนัข",
      "date": "2026-01-12",
      "summary": "โรงงานของเราขยายสายการผลิตด้วยสูตรพิเศษสำหรับลูกสุนัข เพื่อช่วยการเจริญเติบโตที่แข็งแรง",
      "content": "<p>เราได้พัฒนาสูตรใหม่ร่วมกับนักโภชนาการสัตว์ เพื่อให้โปรตีนและแร่ธาตุที่เหมาะสมสำหรับลูกสุนัขทุกสายพันธุ์ โดยมุ่งเน้นความปลอดภัยและความสามารถในการย่อยอาหาร</p><p>สนใจติดต่อฝ่ายขายเพื่อรับข้อมูลรายละเอียดและตัวอย่างฟรี</p>",
      "image": "../assets/images/news-puppy.jpg",
      "category": "ผลิตภัณฑ์",
      "sticky": false
    },
    {
      "id": "002",
      "title": "รับรองมาตรฐาน HACCP และ GMP ในกระบวนการผลิต",
      "date": "2026-01-05",
      "summary": "โรงงานผ่านการตรวจประเมินและได้รับการรับรองมาตรฐาน HACCP และ GMP เพื่อยืนยันคุณภาพการผลิต",
      "content": "<p>การรับรองนี้ช่วยยืนยันว่าโรงงานของเรามีกระบวนการควบคุมคุณภาพตั้งแต่การคัดเลือกวัตถุดิบจนถึงการจัดส่งสินค้า</p>",
      "image": "../assets/images/news-cert.jpg",
      "category": "ข่าวบริษัท",
      "sticky": true
    },
    {
      "id": "001",
      "title": "บริการ OEM/ODM พร้อมออกแบบบรรจุภัณฑ์",
      "date": "2025-12-20",
      "summary": "เรารับงาน OEM/ODM สำหรับแบรนด์อาหารสัตว์ พร้อมบริการออกแบบฉลากและบรรจุภัณฑ์",
      "content": "<p>หากคุณมีแบรนด์และต้องการผลิตอาหารสัตว์ตามสูตรของคุณ ทีม R&amp;D และฝ่ายออกแบบของเราพร้อมให้คำปรึกษาตั้งแต่การพัฒนาสูตรจนถึงการออกแบบบรรจุภัณฑ์</p>",
      "image": "../assets/images/news-oem.jpg",
      "category": "บริการ",
      "sticky": false
    }
  ];

  // --- helpers for path normalization ---
  const isInNewsDir = window.location.pathname.includes('/news/');
  function normalizeImagePath(img) {
    const defaultImg = 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1200&auto=format&fit=crop';
    if (!img) return defaultImg;
    if (img.startsWith('http')) return img;

    // Cases:
    // - data uses "../assets/..." which is correct for pages inside /news/
    // - when rendering on root (e.g., index.html), we should remove leading "../"
    // - when data uses "assets/..." and we are in /news/, prefix "../"
    if (img.startsWith('../')) {
      return isInNewsDir ? img : img.replace(/^(\.\.\/)+/, '');
    }
    if (img.startsWith('./')) {
      return isInNewsDir ? img : img.replace(/^\.\//, '');
    }
    if (img.startsWith('assets/')) {
      return isInNewsDir ? ('../' + img) : img;
    }
    // fallback: return as-is
    return img;
  }

  // --- load news JSON with fallback ---
  function loadNewsJson() {
    const path = isInNewsDir ? '../news-data.json' : 'news-data.json';

    if (window.location.protocol === 'file:') {
      console.info('Running from file:// - using fallback news data');
      allNews = newsFallback.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
      renderNews();
      return;
    }

    fetch(path).then(r => {
      if (!r.ok) throw new Error('ไม่สามารถโหลดข่าว (HTTP ' + r.status + ')');
      return r.json();
    }).then(data => {
      if (!Array.isArray(data)) throw new Error('news-data.json ไม่ใช่ array');
      allNews = data.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
      renderNews();
    }).catch(err => {
      console.warn('ไม่สามารถโหลด news-data.json:', err);
      allNews = newsFallback.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
      renderNews();
    });
  }

  if (newsListEl) loadNewsJson();

  // --- render news list ---
  function renderNews(filtered = null) {
    const source = filtered || allNews;
    newsListEl.innerHTML = '';

    if (newsCountEl) newsCountEl.textContent = `ทั้งหมด ${source.length} ข่าว`;

    const toShow = source.slice(0, displayedCount);
    if (toShow.length === 0) {
      newsListEl.innerHTML = '<div class="col-12"><p class="text-muted">ไม่พบข่าวสาร</p></div>';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    toShow.forEach((item, idx) => {
      const col = document.createElement('div');
      col.className = 'col-md-4';

      const imageUrl = normalizeImagePath(item.image);
      // generate safe id and correct detail URL based on current page
      const safeId = String(item.id).replace(/[^a-z0-9\-]/gi,'').padStart(3, '0');
      // If we are already in /news/ (news/index.html) the detail pages sit in same folder:
      //   news/index.html -> detail should be "news-003.html"
      // If we are on root or other page, detail should be "news/news-003.html"
      const detailUrl = isInNewsDir ? `news-${safeId}.html` : `news/news-${safeId}.html`;

      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm" data-tilt data-reveal>
          <img src="${imageUrl}" alt="${escapeHtml(item.title)}" class="news-card-img w-100" loading="lazy">
          <div class="card-body">
            <h5 class="card-title">${escapeHtml(item.title)}</h5>
            <p class="card-text text-muted small">${escapeHtml(item.summary || '')}</p>
            <p class="text-muted small mb-2">${formatDate(item.date)}</p>
            <a href="${detailUrl}" class="btn btn-sm btn-outline-danger read-more">อ่านเพิ่มเติม</a>
          </div>
        </div>
      `;
      newsListEl.appendChild(col);
    });

    if (loadMoreBtn) {
      loadMoreBtn.style.display = (source.length > displayedCount) ? 'inline-block' : 'none';
    }

    // init UX
    initTilt();
    initScrollReveal();
  }

  // --- search / controls ---
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.trim().toLowerCase();
      displayedCount = pageSize;
      if (!q) {
        renderNews();
        return;
      }
      const filtered = allNews.filter(n => (n.title + ' ' + (n.summary || '') + ' ' + (n.content || '')).toLowerCase().includes(q));
      renderNews(filtered);
    });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchEl) searchEl.value = '';
      displayedCount = pageSize;
      renderNews();
    });
  }
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      displayedCount += pageSize;
      renderNews();
    });
  }

  // --- contact form UX (feedback only) ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const formAlert = document.getElementById('formAlert');
    contactForm.addEventListener('submit', (e) => {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังส่ง...';
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ส่งข้อความ';
        if (formAlert) {
          formAlert.style.display = 'block';
          formAlert.className = 'alert alert-success';
          formAlert.textContent = 'ส่งข้อความเรียบร้อย (ตัวอย่างแสดงผล) โปรดตั้งค่า Formspree endpoint ของคุณในฟอร์ม';
        }
      }, 1200);
      // do not preventDefault so actual submission will work if action is valid
    });
  }

  // --- Utilities & UX features (scroll reveal, tilt) ---
  function escapeHtml(str = '') {
    return String(str)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }
  function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('th-TH', { year:'numeric', month:'short', day:'numeric' });
  }

  // Scroll reveal
  let revealObserver = null;
  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!revealObserver) {
      const options = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 };
      revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, options);
    }
    const nodes = Array.from(document.querySelectorAll('section, .card, .hero, [data-reveal]'));
    nodes.forEach((el, idx) => {
      if (el.classList.contains('is-visible')) return;
      if (!el.style.getPropertyValue('--reveal-delay')) {
        const base = Math.min(200, idx * 40);
        el.style.setProperty('--reveal-delay', `${base}ms`);
      }
      revealObserver.observe(el);
    });
  }

  // Tilt
  function initTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tiltEls = document.querySelectorAll('[data-tilt]');
    tiltEls.forEach(el => {
      if (el._hasTilt) return;
      el._hasTilt = true;
      const max = parseFloat(el.dataset.tiltMax) || 8;
      const scale = parseFloat(el.dataset.tiltScale) || 1.02;
      let rect = null;
      function onMove(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        rect = rect || el.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width;
        const py = (clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * (max * 2) * -1;
        const rotateX = (py - 0.5) * (max * 2);
        el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`;
      }
      function onLeave() {
        el.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 450);
      }
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('touchmove', onMove, {passive: true});
      el.addEventListener('touchend', onLeave);
    });
  }

  // initialize UX features once on load
  initScrollReveal();
  initTilt();

  window.addEventListener('resize', () => {
    document.querySelectorAll('[data-tilt]').forEach(el => { el._hasTilt = false; });
    initTilt();
  });
});