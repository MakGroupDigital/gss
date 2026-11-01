/* Global Solutions Services — interactions */
(() => {
    const root = document.documentElement;
    const body = document.body;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ========== DÉFILEMENT FLUIDE ==========
    let lenis = null;
    if (!reduced && window.Lenis) {
        lenis = new window.Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4) });
        const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }
    const scrollTo = target => lenis ? lenis.scrollTo(target, { offset: -70 }) : target.scrollIntoView({ behavior: 'smooth' });

    // ========== RIDEAU DE TRANSITION ==========
    const reveal = () => body.classList.add('is-loaded');
    if (document.readyState === 'complete') requestAnimationFrame(reveal);
    else window.addEventListener('load', reveal);
    setTimeout(reveal, 1800); // filet de sécurité si une police tarde

    window.addEventListener('pageshow', e => {
        if (e.persisted) { body.classList.remove('is-leaving'); reveal(); }
    });

    document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        const href = a.getAttribute('href') || '';
        if (href.startsWith('#')) {
            const target = href.length > 1 && document.querySelector(href);
            if (target) { e.preventDefault(); scrollTo(target); }
            return;
        }
        if (a.target === '_blank' || a.hasAttribute('download') || !/\.html($|[?#])/.test(href) || /^[a-z]+:/i.test(href)) return;
        e.preventDefault();
        body.classList.add('is-leaving');
        setTimeout(() => { window.location.href = href; }, reduced ? 0 : 650);
    });

    // ========== NAVIGATION ==========
    const nav = document.querySelector('.nav');
    let lastY = window.scrollY;
    const onScrollNav = () => {
        const y = window.scrollY;
        nav.classList.toggle('is-scrolled', y > 40);
        nav.classList.toggle('is-hidden', y > 400 && y > lastY && !body.classList.contains('menu-open'));
        lastY = y;
    };

    const toggle = document.querySelector('.nav-toggle');
    toggle?.addEventListener('click', () => {
        const open = body.classList.toggle('menu-open');
        toggle.setAttribute('aria-expanded', open);
        if (lenis) open ? lenis.stop() : lenis.start();
        else body.style.overflow = open ? 'hidden' : '';
    });

    // ========== DÉCOUPAGE DES TITRES EN MOTS ==========
    const splitWords = (el, wrapClass) => {
        let i = 0;
        const walk = node => {
            [...node.childNodes].forEach(child => {
                if (child.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                        const outer = document.createElement('span');
                        outer.className = wrapClass;
                        if (wrapClass === 'sw') {
                            const inner = document.createElement('span');
                            inner.textContent = part;
                            inner.style.setProperty('--i', i++);
                            outer.appendChild(inner);
                        } else {
                            outer.textContent = part;
                        }
                        frag.appendChild(outer);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1 && child.tagName !== 'BR') {
                    walk(child);
                }
            });
        };
        walk(el);
    };
    document.querySelectorAll('[data-split]').forEach(el => splitWords(el, 'sw'));
    document.querySelectorAll('[data-scrub]').forEach(el => splitWords(el, 'w'));

    // ========== APPARITIONS AU DÉFILEMENT ==========
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
            if (entry.target.hasAttribute('data-count')) countUp(entry.target);
        });
    }, { rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('[data-reveal], [data-split], [data-line], [data-count], .steps').forEach(el => io.observe(el));

    // ========== COMPTEURS ==========
    function countUp(el) {
        const target = parseFloat(el.dataset.count);
        if (reduced) { el.textContent = target; return; }
        const start = performance.now();
        const dur = 1800;
        const tick = now => {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // ========== MANIFESTE : MOTS QUI S'ALLUMENT ==========
    const scrubs = [...document.querySelectorAll('[data-scrub]')].map(el => ({ el, words: [...el.querySelectorAll('.w')] }));
    const updateScrub = () => {
        const vh = window.innerHeight;
        scrubs.forEach(({ el, words }) => {
            const r = el.getBoundingClientRect();
            const p = Math.min(Math.max((vh * .85 - r.top) / (r.height + vh * .35), 0), 1);
            const lit = Math.round(p * words.length);
            words.forEach((w, i) => w.classList.toggle('on', i < lit));
        });
    };

    // ========== RÉALISATIONS : DÉFILEMENT HORIZONTAL ==========
    const hs = document.querySelector('.hscroll');
    const track = hs?.querySelector('.hscroll-track');
    const progress = hs?.querySelector('.case-progress');
    const progressNum = hs?.querySelector('[data-case-index]');
    const cases = hs ? hs.querySelectorAll('.case').length : 0;
    const desktop = window.matchMedia('(min-width: 961px)');
    let hsDistance = 0;
    const sizeHs = () => {
        if (!hs) return;
        if (!desktop.matches) { hs.style.removeProperty('--hs-h'); track.style.transform = ''; return; }
        hsDistance = Math.max(track.scrollWidth - window.innerWidth, 0);
        hs.style.setProperty('--hs-h', `${hsDistance + window.innerHeight}px`);
    };
    const updateHs = () => {
        if (!hs || !desktop.matches) return;
        const top = hs.getBoundingClientRect().top;
        const p = Math.min(Math.max(-top / (hsDistance || 1), 0), 1);
        track.style.transform = `translate3d(${-p * hsDistance}px,0,0)`;
        progress?.style.setProperty('--p', p);
        if (progressNum) progressNum.textContent = String(Math.min(cases, Math.floor(p * cases) + 1)).padStart(2, '0');
    };

    // ========== EXPERTISES : EMBLÈME QUI SUIT LE PÔLE ==========
    const sticky = document.querySelector('.pole-sticky');
    if (sticky) {
        const rays = sticky.querySelectorAll('.ray');
        const num = sticky.querySelector('[data-pole-num]');
        const name = sticky.querySelector('[data-pole-name]');
        const setPole = block => {
            const i = +block.dataset.index;
            rays.forEach((r, k) => r.classList.toggle('is-on', k === i));
            sticky.style.setProperty('--r', `${-i * 360 / 7}deg`);
            num.textContent = `Pôle ${String(i + 1).padStart(2, '0')} / 07`;
            name.textContent = block.dataset.name;
        };
        const blocks = document.querySelectorAll('.pole-block');
        const pio = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) setPole(e.target); });
        }, { rootMargin: '-45% 0px -45% 0px' });
        blocks.forEach(b => pio.observe(b));
        if (blocks[0]) setPole(blocks[0]);
    }

    // ========== HÉROS : PARALLAXE DE L'EMBLÈME & HEURE DE KINSHASA ==========
    const emblem = document.querySelector('.hero-emblem-inner, .page-emblem');
    if (emblem && !reduced && window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('mousemove', e => {
            const x = (e.clientX / window.innerWidth - .5) * 2;
            const y = (e.clientY / window.innerHeight - .5) * 2;
            emblem.style.transform = `translate3d(${x * -18}px, ${y * -14}px, 0)`;
        }, { passive: true });
    }

    const clock = document.querySelector('[data-clock]');
    if (clock) {
        const fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kinshasa' });
        const tickClock = () => { clock.textContent = fmt.format(new Date()); };
        tickClock();
        setInterval(tickClock, 15000);
    }

    // ========== BOUCLE DE DÉFILEMENT ==========
    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            onScrollNav();
            updateScrub();
            updateHs();
            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { sizeHs(); onScroll(); });
    window.addEventListener('load', () => { sizeHs(); onScroll(); });
    sizeHs();
    onScroll();

    // ========== BOUTONS MAGNÉTIQUES ==========
    if (!reduced && window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('[data-magnet]').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${x * .18}px, ${y * .28}px)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
            el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1), color .5s, border-color .5s';
        });
    }

    // ========== FORMULAIRE DE CONTACT ==========
    const form = document.querySelector('[data-contact-form]');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(form);
            const lines = [];
            for (const [key, value] of data.entries()) if (value) lines.push(`${key} : ${value}`);
            const subject = `Demande de projet — ${data.get('Entreprise') || data.get('Nom')}`;
            window.location.href = `mailto:contact@gss-sarl.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
            const status = form.querySelector('.form-status');
            if (status) status.textContent = 'Votre messagerie s\'ouvre avec la demande pré-remplie. Il ne vous reste qu\'à l\'envoyer.';
        });
    }

    // ========== PARTAGE ==========
    const share = document.getElementById('share');
    const feedback = share?.querySelector('.share-feedback');
    const shareText = "Global Solutions Services Sarl (GSS) — votre partenaire de croissance en RDC. 7 pôles d'expertise.";
    document.querySelectorAll('[data-share-open]').forEach(b => b.addEventListener('click', () => share?.showModal()));
    share?.addEventListener('click', e => {
        if (e.target === share) share.close();
        const action = e.target.closest('[data-share]')?.dataset.share;
        const url = window.location.href;
        if (action === 'close') share.close();
        if (action === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`, '_blank', 'noopener');
        if (action === 'email') window.location.href = `mailto:?subject=${encodeURIComponent('Global Solutions Services Sarl')}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`;
        if (action === 'copy') {
            navigator.clipboard?.writeText(url).then(() => {
                feedback.textContent = 'Lien copié.';
                setTimeout(() => { feedback.textContent = ''; }, 2500);
            });
        }
    });

    root.classList.add('is-ready');
})();
