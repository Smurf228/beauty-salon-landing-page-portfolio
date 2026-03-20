const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
const revealItems = document.querySelectorAll('.reveal');
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const testimonialCards = Array.from(document.querySelectorAll('.testimonial-card'));
const sliderDots = document.querySelector('.slider-dots');
const sliderButtons = document.querySelectorAll('.slider-button');
const bookingForm = document.querySelector('.booking-form');
const successMessage = document.querySelector('.form-success');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isExpanded));
    navMenu.classList.toggle('is-open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

if (lightbox && lightboxImage) {
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    lightboxImage.alt = '';
    document.body.style.overflow = '';
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      lightboxImage.src = item.dataset.lightboxSrc || '';
      lightboxImage.alt = item.dataset.lightboxAlt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

let activeSlide = 0;
let autoplayId = 0;

const renderDots = () => {
  if (!sliderDots) {
    return;
  }

  sliderDots.innerHTML = '';
  testimonialCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `slider-dot${index === activeSlide ? ' is-active' : ''}`;
    dot.setAttribute('aria-label', `Показать отзыв ${index + 1}`);
    dot.addEventListener('click', () => {
      showSlide(index);
      restartAutoplay();
    });
    sliderDots.appendChild(dot);
  });
};

const showSlide = (index) => {
  testimonialCards.forEach((card, cardIndex) => {
    card.classList.toggle('is-active', cardIndex === index);
  });

  const dots = sliderDots?.querySelectorAll('.slider-dot') || [];
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === index);
  });

  activeSlide = index;
};

const nextSlide = (direction = 1) => {
  const total = testimonialCards.length;
  if (!total) {
    return;
  }

  const nextIndex = (activeSlide + direction + total) % total;
  showSlide(nextIndex);
};

const restartAutoplay = () => {
  window.clearInterval(autoplayId);
  autoplayId = window.setInterval(() => nextSlide(1), 5500);
};

if (testimonialCards.length) {
  renderDots();
  showSlide(0);
  restartAutoplay();

  sliderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.direction === 'prev' ? -1 : 1;
      nextSlide(direction);
      restartAutoplay();
    });
  });
}

const validators = {
  name: (value) => value.trim().length >= 2,
  contact: (value) => {
    const trimmed = value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+]?[(]?[0-9\s\-()]{7,}$/;
    return emailPattern.test(trimmed) || phonePattern.test(trimmed);
  },
  service: (value) => value.trim() !== '',
};

const fieldErrors = {
  name: 'Введите имя не короче двух символов.',
  contact: 'Укажите корректный телефон или email.',
  service: 'Выберите услугу.',
};

const setFieldState = (field, isValid) => {
  const fieldWrapper = field.closest('.form-field');
  const errorNode = fieldWrapper?.querySelector('.error-message');

  fieldWrapper?.classList.toggle('is-invalid', !isValid);
  if (errorNode) {
    errorNode.textContent = isValid ? '' : fieldErrors[field.name];
  }
};

if (bookingForm) {
  const formFields = Array.from(bookingForm.querySelectorAll('input, select'));

  formFields.forEach((field) => {
    field.addEventListener('input', () => {
      const isValid = validators[field.name](field.value);
      setFieldState(field, isValid);
    });
  });

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    successMessage.textContent = '';

    let isFormValid = true;

    formFields.forEach((field) => {
      const isValid = validators[field.name](field.value);
      setFieldState(field, isValid);
      if (!isValid) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      const firstInvalidField = bookingForm.querySelector('.form-field.is-invalid input, .form-field.is-invalid select');
      firstInvalidField?.focus();
      return;
    }

    successMessage.textContent = 'Спасибо. Заявка отправлена. Мы свяжемся с вами, чтобы подтвердить запись.';
    bookingForm.reset();
  });
}