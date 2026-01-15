// products.js
// Handles product detail modal population and simple related-products logic

document.addEventListener('DOMContentLoaded', function () {
  const modalEl = document.getElementById('productModal');
  const modalTitle = document.getElementById('productModalTitle');
  const modalImage = document.getElementById('productModalImage');
  const modalDesc = document.getElementById('productModalDesc');
  const modalSpecs = document.getElementById('productModalSpecs');
  const productRelated = document.getElementById('productRelated');
  const productQuoteBtn = document.getElementById('productQuoteBtn');
  const bsModal = modalEl ? new bootstrap.Modal(modalEl, { keyboard: true }) : null;

  // Utility: safely parse JSON or return object with raw string
  function safeParseSpec(specStr) {
    try {
      const parsed = typeof specStr === 'string' ? JSON.parse(specStr) : specStr;
      return parsed && typeof parsed === 'object' ? parsed : { info: String(specStr) };
    } catch (e) {
      return { info: String(specStr) };
    }
  }

  // Collect product items for related lookup
  const productCards = Array.from(document.querySelectorAll('#productsGrid > [data-category]'));

  // Open modal and populate
  function openProductModal(data) {
    modalTitle.textContent = data.title || 'รายละเอียดสินค้า';
    modalImage.src = data.image || '';
    modalImage.alt = data.title || 'product image';
    modalDesc.textContent = data.desc || '';
    // Specs
    modalSpecs.innerHTML = '';
    const specs = safeParseSpec(data.spec);
    if (specs && typeof specs === 'object') {
      for (const key of Object.keys(specs)) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${specs[key]}`;
        modalSpecs.appendChild(li);
      }
    } else {
      const li = document.createElement('li');
      li.textContent = String(specs);
      modalSpecs.appendChild(li);
    }

    // Quote button: keep linking to contact with prefilled query (optional)
    if (productQuoteBtn) {
      // include product title in mailto or contact query param (simple)
      productQuoteBtn.href = `contact.html?product=${encodeURIComponent(data.title || '')}`;
    }

    // Show related products (same category, exclude itself)
    productRelated.innerHTML = '';
    if (data.category) {
      const related = productCards
        .filter(card => card.dataset.category === data.category && card.dataset.title !== data.title)
        .slice(0, 3);

      if (related.length === 0) {
        productRelated.innerHTML = '<div class="smaller-text text-muted">ไม่มีสินค้าที่เกี่ยวข้อง</div>';
      } else {
        related.forEach(rel => {
          const relTitle = rel.dataset.title || '';
          const relImage = rel.querySelector('img')?.getAttribute('src') || '';
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'product-related-item btn';
          item.setAttribute('aria-label', `ดู ${relTitle}`);
          item.innerHTML = `
            <img src="${relImage}" alt="${relTitle}">
            <div class="text-truncate">${relTitle}</div>
          `;
          // clicking a related item populates modal with that product's data
          item.addEventListener('click', function () {
            const newData = {
              title: rel.dataset.title,
              image: rel.dataset.image || relImage,
              desc: rel.dataset.desc || '',
              spec: rel.dataset.spec || '{}',
              category: rel.dataset.category || ''
            };
            openProductModal(newData);
            // keep modal open (refresh content)
          });
          productRelated.appendChild(item);
        });
      }
    }

    // Show modal
    if (bsModal) bsModal.show();
  }

  // Attach click handlers to detail buttons
  document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const dataset = btn.dataset || {};
      const data = {
        title: dataset.title || btn.closest('[data-title]')?.dataset.title || '',
        image: dataset.image || btn.closest('[data-image]')?.dataset.image || '',
        desc: dataset.desc || '',
        spec: dataset.spec || dataset.specs || '{}',
        category: dataset.category || btn.closest('[data-category]')?.dataset.category || ''
      };
      openProductModal(data);
    });
  });

  // Also allow opening modal when pressing Enter on the card (accessibility)
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const btn = card.querySelector('.btn-detail');
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      }
    });
  });

  // Optional: Filtering/search (basic, non-intrusive)
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const filter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('#productsGrid > [data-category]').forEach(col => {
        if (filter === 'all' || col.dataset.category === filter) {
          col.style.display = '';
        } else {
          col.style.display = 'none';
        }
      });
    });
  });

  const searchInput = document.getElementById('productSearch');
  const clearBtn = document.getElementById('clearProductSearch');
  if (searchInput) {
    let debounceTimer = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = (searchInput.value || '').toLowerCase().trim();
        document.querySelectorAll('#productsGrid > [data-title]').forEach(col => {
          const title = (col.dataset.title || '').toLowerCase();
          const terms = (col.dataset.search || '').toLowerCase();
          if (!q || title.includes(q) || terms.includes(q)) {
            col.style.display = '';
          } else {
            col.style.display = 'none';
          }
        });
      }, 180);
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      // trigger input event
      searchInput?.dispatchEvent(new Event('input'));
    });
  }
});