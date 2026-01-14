// products.js - small script for products page
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('productsGrid');
  if (!grid) return; // only run on products page

  const filterBtns = Array.from(document.querySelectorAll('[data-filter]'));
  const searchInput = document.getElementById('productSearch');
  const clearSearchBtn = document.getElementById('clearProductSearch');
  const cards = Array.from(grid.querySelectorAll('[data-category]'));

  // Filter function
  function applyFilter(category) {
    filterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === category));
    let shown = 0;
    cards.forEach(cardCol => {
      const cat = cardCol.getAttribute('data-category') || 'all';
      const matches = (category === 'all') || (cat === category);
      cardCol.style.display = matches ? '' : 'none';
      if (matches) shown++;
    });
    showNoProductsIfNeeded(shown);
  }

  // Search function (client-side)
  function applySearch(q) {
    q = (q||'').trim().toLowerCase();
    let shown = 0;
    cards.forEach(cardCol => {
      const title = (cardCol.getAttribute('data-title') || '').toLowerCase();
      const extra = (cardCol.getAttribute('data-search') || '').toLowerCase();
      const categoryVisible = cardCol.style.display !== 'none';
      const match = q === '' || title.includes(q) || extra.includes(q);
      cardCol.style.display = match && categoryVisible ? '' : 'none';
      if (match && categoryVisible) shown++;
    });
    showNoProductsIfNeeded(shown);
  }

  function showNoProductsIfNeeded(shownCount) {
    const existing = document.querySelector('.no-products');
    if (shownCount === 0) {
      if (!existing) {
        const el = document.createElement('div');
        el.className = 'no-products col-12';
        el.innerHTML = '<p class="mb-0"><strong>ไม่พบสินค้า</strong><br><small class="text-muted">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</small></p>';
        grid.appendChild(el);
      }
    } else {
      if (existing) existing.remove();
    }
  }

  // Bind filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-filter');
      applyFilter(cat);
      // clear search when switching filter
      if (searchInput) {
        searchInput.value = '';
      }
    });
  });

  // Bind search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      // first ensure category filter applied (active btn)
      const activeBtn = filterBtns.find(b => b.classList.contains('active'));
      const category = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
      applyFilter(category);
      applySearch(e.target.value);
    });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      const activeBtn = filterBtns.find(b => b.classList.contains('active'));
      applyFilter(activeBtn ? activeBtn.getAttribute('data-filter') : 'all');
    });
  }

  // Product detail modal
  const productModalEl = document.getElementById('productModal');
  const bsProductModal = productModalEl ? new bootstrap.Modal(productModalEl, {}) : null;
  const modalTitle = document.getElementById('productModalTitle');
  const modalImage = document.getElementById('productModalImage');
  const modalDesc = document.getElementById('productModalDesc');
  const modalSpecs = document.getElementById('productModalSpecs');
  const downloadSpec = document.getElementById('downloadSpec');

  // attach event to detail buttons
  grid.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const t = e.currentTarget;
      const title = t.dataset.title || '';
      const image = t.dataset.image || '';
      const desc = t.dataset.desc || '';
      const specRaw = t.dataset.spec || '{}';
      let specs = {};
      try { specs = JSON.parse(specRaw); } catch(ignore){ specs = { note: specRaw }; }

      if (modalTitle) modalTitle.textContent = title;
      if (modalImage) {
        modalImage.src = image;
        modalImage.alt = title;
      }
      if (modalDesc) modalDesc.innerHTML = desc;
      if (modalSpecs) {
        modalSpecs.innerHTML = '';
        Object.entries(specs).forEach(([k, v]) => {
          const li = document.createElement('li');
          const key = k.charAt(0).toUpperCase() + k.slice(1);
          li.innerHTML = `<strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(v))}`;
          modalSpecs.appendChild(li);
        });
      }
      if (downloadSpec) {
        // point to an example PDF; update to real spec file per product if available
        downloadSpec.href = 'assets/specs/sample-product-spec.pdf';
      }
      if (bsProductModal) bsProductModal.show();
    });
  });

  // small helper
  function escapeHtml(s='') {
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  // init: set default filter = all
  applyFilter('all');

  // keyboard accessibility: open modal on Enter when card focused
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const btn = card.querySelector('.btn-detail');
        if (btn) btn.click();
      }
    });
  });
});