document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  nav?.classList.toggle('is-open', !isOpen);
});

nav?.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
  });
});

const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -36px 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const storySection = document.querySelector('.story');
const storyTrack = storySection?.querySelector('.story-track');
const storySlides = storyTrack ? [...storyTrack.querySelectorAll('.story-slide')] : [];

if (storySection && storyTrack && storySlides.length > 1) {
  const storyCount = storySection.querySelector('.story-count');
  const previousButton = storySection.querySelector('[data-story-prev]');
  const nextButton = storySection.querySelector('[data-story-next]');
  let activeSlide = 0;
  let autoplayTimer;

  const showSlide = (nextIndex) => {
    activeSlide = (nextIndex + storySlides.length) % storySlides.length;
    storyTrack.style.transform = `translateX(-${activeSlide * 100}%)`;
    storySlides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(index !== activeSlide));
    });
    if (storyCount) storyCount.textContent = `${activeSlide + 1} / ${storySlides.length}`;
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  };

  const startAutoplay = () => {
    if (reduceMotion || autoplayTimer || document.hidden) return;
    autoplayTimer = window.setInterval(() => showSlide(activeSlide + 1), 4800);
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  previousButton?.addEventListener('click', () => {
    showSlide(activeSlide - 1);
    restartAutoplay();
  });
  nextButton?.addEventListener('click', () => {
    showSlide(activeSlide + 1);
    restartAutoplay();
  });
  storySection.addEventListener('pointerenter', stopAutoplay);
  storySection.addEventListener('pointerleave', startAutoplay);
  storySection.addEventListener('focusin', stopAutoplay);
  storySection.addEventListener('focusout', (event) => {
    if (!storySection.contains(event.relatedTarget)) startAutoplay();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  if ('IntersectionObserver' in window) {
    const storyObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAutoplay();
      else stopAutoplay();
    }, { threshold: 0.15 });
    storyObserver.observe(storySection);
  } else {
    startAutoplay();
  }
  showSlide(0);
}

document.querySelector('#year').textContent = new Date().getFullYear();
