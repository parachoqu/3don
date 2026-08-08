// Home interactions moved from index.html
document.addEventListener('DOMContentLoaded', () => {

      // Touch detection
      const isTouch = matchMedia('(hover: none) and (pointer: coarse)').matches;

      // Scroll Progress Bar
      const scrollFill = document.getElementById('scrollFill');
      function updateScrollProgress() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        scrollFill.style.width = pct + '%';
      }

      // Intersection Observer for scroll reveal, with a visible fallback
      const reveals = document.querySelectorAll('.reveal');
      if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        reveals.forEach(el => observer.observe(el));
      } else {
        reveals.forEach(el => el.classList.add('active'));
      }
      window.setTimeout(() => reveals.forEach(el => el.classList.add('active')), 900);

      // Touch Ripple System
      document.querySelectorAll('.ripple-host').forEach(host => {
        if (host.dataset.rippleReady === 'true') return;
        host.dataset.rippleReady = 'true';
        const spawnRipple = (e) => {
          const rect = host.getBoundingClientRect();
          const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
          const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
          const size = Math.max(rect.width, rect.height);
          const ring = document.createElement('span');
          ring.className = 'ripple-ring';
          ring.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;`;
          host.appendChild(ring);
          ring.addEventListener('animationend', () => ring.remove());
        };
        host.addEventListener('touchstart', spawnRipple, { passive: true });
        host.addEventListener('mousedown', spawnRipple);
      });

      // Button Press Feedback
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('touchstart', () => btn.classList.add('touch-press'), { passive: true });
        btn.addEventListener('touchend', () => btn.classList.remove('touch-press'), { passive: true });
        btn.addEventListener('touchcancel', () => btn.classList.remove('touch-press'), { passive: true });
      });

      // Card Touch & Tilt Interactions
      const cards = document.querySelectorAll('.cat-card');
      cards.forEach(card => {
        const updateGlow = (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
          const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        };

        card.addEventListener('mousemove', updateGlow);

        if (isTouch) {
          card.addEventListener('touchstart', (e) => {
            card.classList.add('tilting', 'glow-active');
            updateGlow(e);
          }, { passive: true });

          card.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (t.clientX - cx) / (rect.width / 2);
            const dy = (t.clientY - cy) / (rect.height / 2);
            const tiltX = dy * -6;
            const tiltY = dx * 6;
            card.style.transform = `perspective(400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
            card.style.borderColor = 'rgba(255, 106, 0, 0.45)';
            card.style.boxShadow = '0 14px 32px -8px rgba(0,0,0,0.7), 0 0 24px rgba(255,106,0,0.2)';
            updateGlow(e);
          }, { passive: true });

          card.addEventListener('touchend', () => {
            card.classList.remove('tilting', 'glow-active');
            card.style.transform = '';
            card.style.borderColor = '';
            card.style.boxShadow = '';
          }, { passive: true });

          card.addEventListener('touchcancel', () => {
            card.classList.remove('tilting', 'glow-active');
            card.style.transform = '';
            card.style.borderColor = '';
            card.style.boxShadow = '';
          }, { passive: true });
        }
      });

      // Mobile category card details (only one card open at a time)
      const cardMobileLayout = matchMedia('(max-width: 600px)');
      const cardDetailButtons = document.querySelectorAll('.card-details-toggle');

      function setHomeCardExpanded(card, expanded) {
        const button = card.querySelector('.card-details-toggle');
        if (!button) return;
        card.classList.toggle('is-expanded', expanded);
        button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        button.querySelector('span').textContent = expanded ? 'Ocultar detalhes' : 'Ver detalhes';
      }

      function closeHomeCardDetails(exceptCard = null) {
        cards.forEach(card => {
          if (card !== exceptCard) setHomeCardExpanded(card, false);
        });
      }

      cardDetailButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          if (!cardMobileLayout.matches) return;
          const card = button.closest('.cat-card');
          const shouldExpand = !card.classList.contains('is-expanded');
          closeHomeCardDetails(card);
          setHomeCardExpanded(card, shouldExpand);
        });
      });

      cardMobileLayout.addEventListener('change', () => closeHomeCardDetails());

      // Catalog Swipe Dots
      const catalogEl = document.getElementById('catalogScroll');
      const dots = document.querySelectorAll('#scrollDots .dot-item');
      if (catalogEl) {
        const catalogCards = [...catalogEl.querySelectorAll('.cat-card')];
        let catalogFrame = null;

        const updateCatalogHighlight = () => {
          catalogFrame = null;
          if (!catalogCards.length) return;

          const catalogRect = catalogEl.getBoundingClientRect();
          const catalogCenter = catalogRect.left + catalogRect.width / 2;
          let activeIndex = 0;
          let closestDistance = Infinity;

          catalogCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(cardCenter - catalogCenter);
            if (distance < closestDistance) {
              closestDistance = distance;
              activeIndex = index;
            }
          });

          catalogEl.classList.add('has-featured-card');
          catalogCards.forEach((card, index) => {
            card.classList.toggle('is-featured', index === activeIndex);
          });
          dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
            dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
          });
        };

        const requestCatalogHighlight = () => {
          if (catalogFrame !== null) return;
          catalogFrame = requestAnimationFrame(updateCatalogHighlight);
        };

        catalogEl.addEventListener('scroll', requestCatalogHighlight, { passive: true });
        window.addEventListener('resize', requestCatalogHighlight);
        requestCatalogHighlight();
      }

      // Floating WhatsApp Visibility & Footer avoid
      const floatingWsp = document.getElementById('floatingWsp');
      const footerEl = document.querySelector('footer');

      function updateFloating() {
        if (!floatingWsp || !footerEl) {
          updateScrollProgress();
          return;
        }
        const sy = window.scrollY;
        const footerTop = footerEl.getBoundingClientRect().top;
        const nearPageEnd = sy + window.innerHeight >= document.documentElement.scrollHeight - 120;
        if (sy > 280) {
          floatingWsp.classList.add('show');
        } else {
          floatingWsp.classList.remove('show');
        }
        if (footerTop < window.innerHeight + 40 || nearPageEnd) {
          floatingWsp.classList.add('near-footer');
        } else {
          floatingWsp.classList.remove('near-footer');
        }
        updateScrollProgress();
      }

      window.addEventListener('scroll', updateFloating, { passive: true });
      updateFloating();

      // Material Selector Logic
      const matDesc = document.getElementById('matDesc');
      const materialPills = document.querySelectorAll('.mat-pill');
      const selectMaterial = (pill) => {
          materialPills.forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-pressed', 'false');
          });
          pill.classList.add('active');
          pill.setAttribute('aria-pressed', 'true');
          matDesc.classList.add('fading');
          setTimeout(() => {
            matDesc.textContent = pill.dataset.desc;
            matDesc.classList.remove('fading');
          }, 180);
      };

      materialPills.forEach(pill => {
        pill.addEventListener('click', () => selectMaterial(pill));
        pill.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectMaterial(pill);
          }
        });
      });

      // FAQ Accordion Logic
      document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.parentElement;
          const isOpen = item.classList.contains('open');
          document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('open');
            i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });

    });

// Catalog interactions moved from the catalog page
document.addEventListener('DOMContentLoaded', () => {
      const hasCatalogPage = document.getElementById('catGrid') && document.getElementById('productModal');
      if (!hasCatalogPage) return;

      // Scroll Progress Bar
      const scrollFill = document.getElementById('scrollFill');
      function updateScrollProgress() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        scrollFill.style.width = pct + '%';
      }
      window.addEventListener('scroll', updateScrollProgress, { passive: true });
      updateScrollProgress();

      // Intersection Observer, with a visible fallback
      const reveals = document.querySelectorAll('.reveal');
      if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
          });
        }, { threshold: 0.08 });
        reveals.forEach(el => observer.observe(el));
      } else {
        reveals.forEach(el => el.classList.add('active'));
      }
      window.setTimeout(() => reveals.forEach(el => el.classList.add('active')), 900);

      // Touch Ripples
      document.querySelectorAll('.ripple-host').forEach(host => {
        if (host.dataset.rippleReady === 'true') return;
        host.dataset.rippleReady = 'true';
        const spawnRipple = (e) => {
          const rect = host.getBoundingClientRect();
          const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
          const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
          const size = Math.max(rect.width, rect.height);
          const ring = document.createElement('span');
          ring.className = 'ripple-ring';
          ring.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;`;
          host.appendChild(ring);
          ring.addEventListener('animationend', () => ring.remove());
        };
        host.addEventListener('touchstart', spawnRipple, { passive: true });
        host.addEventListener('mousedown', spawnRipple);
      });

      // Filter and Search System
      const searchInput = document.getElementById('searchInput');
      const filterPillsEl = document.getElementById('filterPills');
      const filterPills = document.querySelectorAll('.filter-pill');
      const cards = document.querySelectorAll('.cat-card-full');
      const noResults = document.getElementById('noResults');
      const resultsCount = document.getElementById('resultsCount');
      const categoryContext = document.getElementById('categoryContext');
      const filterPillsMobileLayout = matchMedia('(max-width: 600px)');
      const productModal = document.getElementById('productModal');
      const productModalShell = productModal.querySelector('.product-modal-shell');
      const productModalClose = document.getElementById('productModalClose');
      const productModalImage = document.getElementById('productModalImage');
      const productModalCaption = document.getElementById('productModalCaption');
      const productModalCategory = document.getElementById('productModalCategory');
      const productModalNumber = document.getElementById('productModalNumber');
      const productModalTitle = document.getElementById('productModalTitle');
      const productModalDescription = document.getElementById('productModalDescription');
      const productModalSpecs = document.getElementById('productModalSpecs');
      const productModalCta = document.getElementById('productModalCta');
      let lastModalTrigger = null;

      function openProductModal(card, trigger) {
        const cardImage = card.querySelector('.product-media img');
        const cardCaption = card.querySelector('.product-media figcaption');
        const cardDescription = card.querySelector('.product-card-details p');

        lastModalTrigger = trigger;
        productModalImage.src = cardImage.getAttribute('src');
        productModalImage.alt = cardImage.alt;
        productModalCaption.textContent = cardCaption?.textContent || 'Referência visual';
        productModalCategory.textContent = card.querySelector('.category-badge')?.textContent || '';
        productModalNumber.textContent = card.querySelector('.layer-tag')?.textContent || '';
        productModalTitle.textContent = card.querySelector('h3')?.textContent || card.dataset.product;
        productModalDescription.textContent = cardDescription?.textContent || '';
        productModalCta.href = card.dataset.ctaHref;
        productModalCta.setAttribute(
          'aria-label',
          card.dataset.ctaLabel || `Solicitar orçamento de ${card.dataset.product} pelo WhatsApp`
        );

        productModalSpecs.replaceChildren();
        card.querySelectorAll('.spec-chip').forEach(cardChip => {
          const modalChip = document.createElement('span');
          modalChip.className = 'spec-chip';
          modalChip.textContent = cardChip.textContent;
          productModalSpecs.appendChild(modalChip);
        });

        productModalShell.scrollTop = 0;
        document.body.classList.add('product-modal-open');
        if (typeof productModal.showModal === 'function') {
          productModal.showModal();
        } else {
          productModal.setAttribute('open', '');
        }
        requestAnimationFrame(() => productModalClose.focus());
      }

      function restorePageAfterModal() {
        document.body.classList.remove('product-modal-open');
        if (lastModalTrigger?.isConnected) lastModalTrigger.focus();
        lastModalTrigger = null;
      }

      function closeProductModal() {
        if (!productModal.open) return;
        if (typeof productModal.close === 'function') {
          productModal.close();
        } else {
          productModal.removeAttribute('open');
          restorePageAfterModal();
        }
      }

      cards.forEach(card => {
        const cardButton = card.querySelector('.product-card-toggle');
        const cardCta = card.querySelector('.card-act-btn');

        if (cardCta) {
          card.dataset.ctaHref = cardCta.getAttribute('href');
          card.dataset.ctaLabel = cardCta.getAttribute('aria-label') || '';
          cardCta.remove();
        }

        cardButton.removeAttribute('aria-expanded');
        cardButton.setAttribute('aria-controls', 'productModal');
        cardButton.setAttribute('aria-haspopup', 'dialog');
        cardButton.setAttribute('aria-label', `Ver detalhes de ${card.dataset.product}`);

        cardButton.addEventListener('click', (event) => {
          event.stopPropagation();
          openProductModal(card, cardButton);
        });

        card.addEventListener('click', (event) => {
          if (event.target.closest('a, button')) return;
          openProductModal(card, cardButton);
        });
      });

      productModalClose.addEventListener('click', closeProductModal);
      productModal.addEventListener('click', (event) => {
        if (event.target === productModal) closeProductModal();
      });
      productModal.addEventListener('close', restorePageAfterModal);

      let activeCategory = 'all';
      let searchQuery = '';

      const categoryInfo = {
        escritorio: {
          label: 'Escritório & Home Office',
          description: 'Soluções funcionais para quem trabalha, estuda ou passa boa parte do dia no computador.'
        },
        oficina: {
          label: 'Oficina & Ferramentas',
          description: 'Organização para oficina, bancada e ferramentas do dia a dia.'
        },
        churrasco: {
          label: 'Churrasco',
          description: 'Acessórios práticos para deixar o preparo e o momento do churrasco mais organizados.'
        },
        carro: {
          label: 'Carro',
          description: 'Peças funcionais para deixar o carro mais organizado e prático.'
        },
        cafe: {
          label: 'Café & Bebidas',
          description: 'Acessórios que tornam o preparo e o momento das bebidas mais organizados e agradáveis.'
        },
        geek: {
          label: 'Geek & Tecnologia',
          description: 'Acessórios para quem gosta de tecnologia, games e gadgets.'
        },
        personalizados: {
          label: 'Personalizados',
          description: 'Produtos que podem receber nome, mensagem ou uma identidade própria.'
        },
        jardinagem: {
          label: 'Jardinagem',
          description: 'Soluções para quem gosta de plantas, jardim, horta e cultivo em casa.'
        }
      };

      function normalizeSearchText(value = '') {
        return value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();
      }

      function updateCategoryContext(visibleCount) {
        const title = categoryContext.querySelector('h2');
        const description = categoryContext.querySelector('span');

        if (activeCategory === 'all') {
          title.textContent = searchQuery ? 'Resultados da busca' : 'Todos os produtos';
          description.textContent = searchQuery
            ? `${visibleCount} ${visibleCount === 1 ? 'produto encontrado' : 'produtos encontrados'} para sua busca.`
            : 'Explore 44 soluções para diferentes espaços, rotinas e ideias.';
          return;
        }

        const info = categoryInfo[activeCategory];
        title.textContent = info.label;
        description.textContent = info.description;
      }

      function centerActiveFilterPill(pill, behavior = 'smooth', shouldScroll = true) {
        if (!filterPillsEl || !pill) return;

        if (filterPillsMobileLayout.matches) {
          const edgeSpace = Math.max(0, filterPillsEl.clientWidth / 2 - pill.offsetWidth / 2);
          filterPillsEl.style.setProperty('--filter-edge-space', `${edgeSpace}px`);
          if (shouldScroll) {
            pill.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
          }
        } else {
          filterPillsEl.style.removeProperty('--filter-edge-space');
        }
      }

      function filterItems() {
        let visibleCount = 0;

        cards.forEach(card => {
          const cat = card.dataset.category;
          const title = normalizeSearchText(card.dataset.title);
          const keywords = normalizeSearchText(card.dataset.keywords);
          const category = normalizeSearchText(categoryInfo[cat]?.label);
          const description = normalizeSearchText(card.querySelector('.product-card-details p')?.textContent);
          const tags = normalizeSearchText(
            [...card.querySelectorAll('.spec-chip')].map(tag => tag.textContent).join(' ')
          );

          const matchesCat = (activeCategory === 'all' || cat === activeCategory);
          const matchesSearch = !searchQuery || [title, category, description, tags, keywords]
            .some(value => value.includes(searchQuery));

          if (matchesCat && matchesSearch) {
            card.hidden = false;
            card.classList.add('active');
            visibleCount++;
          } else {
            card.hidden = true;
            card.classList.remove('active');
          }
        });

        resultsCount.textContent = `Exibindo ${visibleCount} ${visibleCount === 1 ? 'item' : 'itens'}`;
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        updateCategoryContext(visibleCount);
      }

      filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          filterPills.forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-pressed', 'false');
          });
          pill.classList.add('active');
          pill.setAttribute('aria-pressed', 'true');
          activeCategory = pill.dataset.cat;
          filterItems();
          centerActiveFilterPill(pill);
        });
      });

      const handleFilterPillViewportChange = () => {
        centerActiveFilterPill(document.querySelector('.filter-pill.active'), 'auto');
      };
      if (filterPillsMobileLayout.addEventListener) {
        filterPillsMobileLayout.addEventListener('change', handleFilterPillViewportChange);
      } else {
        filterPillsMobileLayout.addListener(handleFilterPillViewportChange);
      }
      centerActiveFilterPill(document.querySelector('.filter-pill.active'), 'auto', false);

      searchInput.addEventListener('input', (e) => {
        searchQuery = normalizeSearchText(e.target.value);
        filterItems();
      });

      // View Mode Switcher (Grid vs List)
      const catGrid = document.getElementById('catGrid');
      const gridBtn = document.getElementById('gridBtn');
      const listBtn = document.getElementById('listBtn');
      const wideLayout = matchMedia('(min-width: 601px)');
      let userSelectedView = false;

      function setViewMode(mode, fromUser = false) {
        const nextMode = wideLayout.matches ? mode : 'grid';
        const useGrid = nextMode === 'grid';
        catGrid.classList.toggle('grid-mode', useGrid);
        catGrid.classList.toggle('list-mode', !useGrid);
        gridBtn.classList.toggle('active', useGrid);
        listBtn.classList.toggle('active', !useGrid);
        gridBtn.setAttribute('aria-pressed', useGrid ? 'true' : 'false');
        listBtn.setAttribute('aria-pressed', useGrid ? 'false' : 'true');
        if (fromUser && wideLayout.matches) userSelectedView = true;
      }

      setViewMode('grid');

      gridBtn.addEventListener('click', () => {
        setViewMode('grid', true);
      });

      listBtn.addEventListener('click', () => {
        setViewMode('list', true);
      });

      wideLayout.addEventListener('change', (event) => {
        if (!event.matches) {
          userSelectedView = false;
          setViewMode('grid');
        } else if (!userSelectedView) {
          setViewMode('grid');
        }
      });

      filterItems();

      // Mouse Glow Effect on cards
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
      });

    });

// Single HTML SPA Routing logic
function setView(viewName, shouldScroll = true) {
  const isCatalog = viewName === 'catalog';
  document.body.setAttribute('data-view', isCatalog ? 'catalog' : 'home');

  if (isCatalog) {
    document.title = 'Catálogo de Produtos · 3D On Impressões 3D';
  } else {
    document.title = '3D On Impressões · Impressão 3D em Teófilo Otoni/MG';
  }

  const activeContainer = isCatalog ? document.getElementById('viewCatalog') : document.getElementById('viewHome');
  if (activeContainer) {
    const reveals = activeContainer.querySelectorAll('.reveal');
    reveals.forEach(el => el.classList.add('active'));
  }

  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  const scrollFill = document.getElementById('scrollFill');
  if (scrollFill) {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    scrollFill.style.width = pct + '%';
  }
}

function handleRoute() {
  const path = window.location.pathname;
  const hash = window.location.hash;

  if (hash === '#catalogo-completo' || hash === '#catalogo-page' || path.endsWith('/catalogo') || path.endsWith('/catalogo.html')) {
    setView('catalog', true);
  } else {
    setView('home', hash === '#inicio' || hash === '#topo');
  }
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('popstate', handleRoute);
document.addEventListener('DOMContentLoaded', handleRoute);

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const targetHash = link.getAttribute('href');
  if (targetHash === '#catalogo-completo' || targetHash === '#catalogo-page') {
    e.preventDefault();
    if (window.location.hash !== '#catalogo-completo') {
      history.pushState(null, '', '#catalogo-completo');
    }
    setView('catalog', true);
  } else if (targetHash === '#inicio' || targetHash === '#topo') {
    e.preventDefault();
    if (window.location.hash !== '#inicio') {
      history.pushState(null, '', '#inicio');
    }
    setView('home', true);
  }
});
