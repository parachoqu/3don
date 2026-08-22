// Home interactions
document.addEventListener('DOMContentLoaded', () => {

      // Scroll Progress Bar
      const scrollFill = document.getElementById('scrollFill');
      function updateScrollProgress() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        scrollFill.style.width = pct + '%';
      }

      // Intersection Observer for scroll reveal
      const reveals = document.querySelectorAll('.reveal');
      if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
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
        if (sy > 220) {
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

      // FAQ Editorial Accordion Logic
      // No desktop as respostas abrem por padrão e cada item alterna sozinho:
      // acordeão existe para economizar altura, e lá a seção ocupa a tela toda.
      // Abaixo de 1024px segue exclusivo — abrir um fecha os demais.
      const faqExclusiveMedia = window.matchMedia('(max-width: 1023.98px)');
      const faqItems = Array.from(document.querySelectorAll('.faq-editorial-item'));

      function setFaqItem(item, open) {
        item.classList.toggle('open', open);
        const question = item.querySelector('.faq-editorial-question');
        if (question) question.setAttribute('aria-expanded', open ? 'true' : 'false');
        const icon = item.querySelector('.faq-icon');
        if (icon) icon.textContent = open ? '−' : '+';
      }

      function syncFaqDefaults() {
        const openByDefault = !faqExclusiveMedia.matches;
        faqItems.forEach(item => setFaqItem(item, openByDefault));
      }

      faqItems.forEach(item => {
        const btn = item.querySelector('.faq-editorial-question');
        if (!btn) return;
        btn.addEventListener('click', () => {
          const willOpen = !item.classList.contains('open');
          if (faqExclusiveMedia.matches) {
            faqItems.forEach(other => {
              if (other !== item) setFaqItem(other, false);
            });
          }
          setFaqItem(item, willOpen);
        });
      });

      listenToMediaQuery(faqExclusiveMedia, syncFaqDefaults);
      syncFaqDefaults();
      // Automatic Horizontal Carousel for Hero Delivered Projects (Clean Loop)
      function initHeroCarousel() {
        const carousel = document.getElementById('heroVisualCarousel');
        const track = document.getElementById('heroCarouselTrack');
        const badgeTitle = document.getElementById('heroCarouselBadgeTitle');
        const badgeNum = document.getElementById('heroCarouselBadgeNum');

        if (!carousel || !track) return;

        const slides = track.querySelectorAll('.hero-carousel-slide');
        const totalSlides = slides.length;
        if (totalSlides === 0) return;

        let currentIndex = 0;
        let timer = null;
        const intervalTime = 3500; // 3.5s loop

        function goToSlide(index) {
          if (index < 0) {
            currentIndex = totalSlides - 1;
          } else if (index >= totalSlides) {
            currentIndex = 0;
          } else {
            currentIndex = index;
          }

          track.style.transform = `translateX(-${currentIndex * 100}%)`;

          slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
          });

          if (badgeTitle && slides[currentIndex]) {
            const title = slides[currentIndex].getAttribute('data-title') || '';
            const numStr = String(currentIndex + 1).padStart(2, '0');
            badgeTitle.style.opacity = '0';
            if (badgeNum) badgeNum.style.opacity = '0';
            setTimeout(() => {
              if (badgeNum) {
                badgeNum.textContent = numStr;
                badgeNum.style.opacity = '1';
              }
              badgeTitle.textContent = title;
              badgeTitle.style.opacity = '1';
            }, 160);
          }
        }

        function startAutoplay() {
          stopAutoplay();
          timer = setInterval(() => {
            goToSlide(currentIndex + 1);
          }, intervalTime);
        }

        function stopAutoplay() {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
        }

        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        carousel.addEventListener('touchstart', stopAutoplay, { passive: true });
        carousel.addEventListener('touchend', startAutoplay, { passive: true });

        // Touch Swipe
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches.length > 0) {
            touchStartX = e.touches[0].clientX;
          }
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
          if (e.changedTouches && e.changedTouches.length > 0) {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 35) {
              if (diff > 0) {
                goToSlide(currentIndex + 1);
              } else {
                goToSlide(currentIndex - 1);
              }
              startAutoplay();
            }
          }
        }, { passive: true });

        goToSlide(0);
        startAutoplay();
      }

      initHeroCarousel();

      // Carrossel horizontal de destaques (mobile): indicadores + sincronia com o scroll
      function initHighlightsCarousel() {
        const track = document.getElementById('highlightsCarousel');
        const dotsWrap = document.getElementById('highlightsDots');
        if (!track || !dotsWrap) return;

        const cards = Array.from(track.querySelectorAll('.highlight-card'));
        if (cards.length < 2) return;

        const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

        const centerOf = (el) => {
          const rect = el.getBoundingClientRect();
          return rect.left + rect.width / 2;
        };

        const dots = cards.map((card, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'highlights-dot';
          dot.setAttribute('aria-label', `Ir para o destaque ${i + 1} de ${cards.length}`);
          dot.addEventListener('click', () => {
            track.scrollBy({
              left: centerOf(card) - centerOf(track),
              behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
          });
          dotsWrap.appendChild(dot);
          return dot;
        });

        function syncActiveDot() {
          const trackCenter = centerOf(track);
          let activeIndex = 0;
          let shortest = Infinity;
          cards.forEach((card, i) => {
            const distance = Math.abs(centerOf(card) - trackCenter);
            if (distance < shortest) {
              shortest = distance;
              activeIndex = i;
            }
          });
          dots.forEach((dot, i) => {
            const isActive = i === activeIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
          });
        }

        let ticking = false;
        function requestSync() {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            ticking = false;
            syncActiveDot();
          });
        }

        track.addEventListener('scroll', requestSync, { passive: true });
        window.addEventListener('resize', requestSync, { passive: true });
        syncActiveDot();
      }

      initHighlightsCarousel();

      // Showroom interativo de Destaques (desktop): produto principal + lista
      // lateral. Os 4 .highlight-card continuam a única fonte de dados — o
      // stage só lê o DOM do card clicado/hover, nada é duplicado em JS.
      function initHighlightsShowroom() {
        const showroom = document.getElementById('highlightsShowroom');
        const list = document.getElementById('highlightsCarousel');
        if (!showroom || !list) return;

        const cards = Array.from(list.querySelectorAll('.highlight-card'));
        if (cards.length === 0) return;

        const stageImage = document.getElementById('showroomImage');
        const stageTag = document.getElementById('showroomTag');
        const stageTitle = document.getElementById('showroomTitle');
        const stageDesc = document.getElementById('showroomDesc');
        const stageCta = document.getElementById('showroomCta');

        let activeIndex = -1;
        let hoverTimer = null;

        function selectCard(index) {
          if (index === activeIndex) return;
          const card = cards[index];
          if (!card) return;

          const media = card.querySelector('.highlight-media img');
          const tag = card.querySelector('.highlight-tag');
          const title = card.querySelector('.highlight-body h3');
          const desc = card.querySelector('.highlight-body p');
          const cta = card.querySelector('.highlight-cta');
          if (!media || !title || !desc || !cta) return;

          stageImage.src = media.getAttribute('src');
          stageImage.alt = media.alt;
          stageTag.textContent = tag ? tag.textContent : '';
          stageTitle.textContent = title.textContent;
          stageDesc.textContent = desc.textContent;
          stageCta.setAttribute('href', cta.getAttribute('href'));

          activeIndex = index;
          cards.forEach((c, i) => {
            const isActive = i === index;
            c.classList.toggle('is-active', isActive);
            c.setAttribute('aria-current', isActive ? 'true' : 'false');
          });
        }

        cards.forEach((card, index) => {
          card.setAttribute('tabindex', '0');
          card.setAttribute('aria-current', 'false');

          card.addEventListener('click', () => selectCard(index));

          card.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => selectCard(index), 90);
          });

          card.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
          });

          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
              e.preventDefault();
              selectCard(index);
            }
          });
        });

        const desktopShowroomMedia = window.matchMedia('(min-width: 1024px)');
        function syncShowroomState() {
          if (desktopShowroomMedia.matches && activeIndex === -1) {
            selectCard(0);
          }
        }
        listenToMediaQuery(desktopShowroomMedia, syncShowroomState);
        syncShowroomState();
      }

      initHighlightsShowroom();
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
      const filterPillsMobileLayout = matchMedia('(max-width: 600px)');
      const productModal = document.getElementById('productModal');
      const productModalShell = productModal.querySelector('.product-modal-shell');
      const productModalClose = document.getElementById('productModalClose');
      const productModalImage = document.getElementById('productModalImage');
      const productModalCaption = document.getElementById('productModalCaption');
      const productModalCategory = document.getElementById('productModalCategory');
      const productModalTitle = document.getElementById('productModalTitle');
      const productModalDescription = document.getElementById('productModalDescription');
      const productModalSpecs = document.getElementById('productModalSpecs');
      const productModalMaterial = document.getElementById('productModalMaterial');
      const productModalPrice = document.getElementById('productModalPrice');
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
        const cardMaterial = card.querySelector('.material-tag');
        if (cardMaterial) {
          productModalMaterial.textContent = cardMaterial.textContent;
          productModalMaterial.style.removeProperty('display');
        } else {
          productModalMaterial.textContent = '';
          productModalMaterial.style.display = 'none';
        }
        // O card mostra o nome curto; o modal é onde o nome completo cabe. Ler o h3
        // aqui encurtaria o título do modal junto com o do card.
        productModalTitle.textContent = card.dataset.title || card.dataset.product;
        productModalDescription.textContent = cardDescription?.textContent || '';
        // O preço tem estrutura ("R$" em .currency + numeral), então clona os nós
        // em vez de copiar o texto — textContent perderia o tratamento tipográfico.
        const cardPrice = card.querySelector('.price-label');
        if (cardPrice) {
          productModalPrice.replaceChildren(
            ...[...cardPrice.childNodes].map(node => node.cloneNode(true))
          );
        } else {
          productModalPrice.textContent = 'Orçamento';
        }
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
        const cardButton = card.querySelector('.card-open');
        const cardCta = card.querySelector('.card-act-btn');

        // O CTA permanece no card; o modal reaproveita destino e rótulo dele.
        if (cardCta) {
          card.dataset.ctaHref = cardCta.getAttribute('href');
          card.dataset.ctaLabel = cardCta.getAttribute('aria-label') || '';
        }

        cardButton.setAttribute('aria-controls', 'productModal');
        cardButton.setAttribute('aria-haspopup', 'dialog');

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
        'gadgets-e-dispositivos': {
          label: 'Acessórios para Dispositivos Móveis e Gadgets',
          description: 'Suportes e acessórios para smartphones, áudio, setups e pequenos gadgets do dia a dia.'
        },
        'utensilios-domesticos': {
          label: 'Utensílios Domésticos e Utilidades',
          description: 'Utilidades funcionais para cozinha, organização doméstica e pequenas rotinas da casa.'
        },
        'organizacao-de-escritorio': {
          label: 'Organização de Escritório',
          description: 'Organizadores de mesa e acessórios para manter cabos, canetas e setups em ordem.'
        },
        'articulados-e-fidgets': {
          label: 'Dispositivos Articulados e Fidgets',
          description: 'Peças articuladas, sensoriais e colecionáveis com movimento e resposta tátil.'
        },
        'acessorios-pessoais-e-chaveiros': {
          label: 'Acessórios Pessoais e Chaveiros',
          description: 'Chaveiros personalizados, miniaturas leves e acessórios de uso pessoal.'
        }
      };

      function normalizeSearchText(value = '') {
        return value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();
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

        resultsCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'peça' : 'peças'}`;
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
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
      const catalogViewStorageKey = '3don_catalog_view_mode';

      function getStoredViewMode() {
        try {
          const storedMode = localStorage.getItem(catalogViewStorageKey);
          return storedMode === 'list' || storedMode === 'grid' ? storedMode : 'list';
        } catch {
          return 'list';
        }
      }

      function setViewMode(mode, persist = false) {
        const nextMode = mode === 'grid' ? 'grid' : 'list';
        const useGrid = nextMode === 'grid';
        catGrid.classList.toggle('grid-mode', useGrid);
        catGrid.classList.toggle('list-mode', !useGrid);
        gridBtn.classList.toggle('active', useGrid);
        listBtn.classList.toggle('active', !useGrid);
        gridBtn.setAttribute('aria-pressed', useGrid ? 'true' : 'false');
        listBtn.setAttribute('aria-pressed', useGrid ? 'false' : 'true');

        if (persist) {
          try {
            localStorage.setItem(catalogViewStorageKey, nextMode);
          } catch {
            // The visual switch remains usable when storage is blocked.
          }
        }
      }

      setViewMode(getStoredViewMode());

      gridBtn.addEventListener('click', () => {
        setViewMode('grid', true);
      });

      listBtn.addEventListener('click', () => {
        setViewMode('list', true);
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

// Desktop home section scroll snap follows the active SPA view and motion preferences.
const desktopScrollSnapMedia = window.matchMedia('(min-width: 1024px)');
const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

function syncHomeScrollSnap() {
  const topbar = document.querySelector('.topbar');
  const topbarHeight = topbar ? Math.ceil(topbar.getBoundingClientRect().height) : 64;
  document.documentElement.style.setProperty('--home-scroll-padding', `${topbarHeight}px`);

  const enabled = document.body.dataset.view === 'home'
    && desktopScrollSnapMedia.matches
    && !reducedMotionMedia.matches;

  document.documentElement.classList.toggle('home-scroll-snap-enabled', enabled);
}

function listenToMediaQuery(query, callback) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', callback);
  } else if (typeof query.addListener === 'function') {
    query.addListener(callback);
  }
}

listenToMediaQuery(desktopScrollSnapMedia, syncHomeScrollSnap);
listenToMediaQuery(reducedMotionMedia, syncHomeScrollSnap);
window.addEventListener('resize', syncHomeScrollSnap, { passive: true });

// Single HTML SPA Routing logic
function setView(viewName, shouldScroll = true) {
  const isCatalog = viewName === 'catalog';
  document.body.setAttribute('data-view', isCatalog ? 'catalog' : 'home');
  syncHomeScrollSnap();

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
  const footerReveal = document.querySelector('footer.reveal');
  if (footerReveal) footerReveal.classList.add('active');

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
