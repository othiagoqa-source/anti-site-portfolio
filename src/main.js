import './style.css';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
const menuBtn = document.getElementById('menu-btn');
const plusBtn = document.getElementById('plus-btn');
const menuOverlay = document.getElementById('menu-overlay');
const menuClose = document.getElementById('menu-close');
const brandLogo = document.getElementById('brand-logo');

// Contact Elements
const contactBtn = document.getElementById('contact-btn');
const contactFromMenuBtn = document.getElementById('contact-from-menu');
const contactFooterMenuBtn = document.getElementById('contact-footer-menu-btn');
const contactOverlay = document.getElementById('contact-overlay');

// Overlay Interactions
function toggleMenu() {
  const isActive = menuOverlay.classList.contains('active');
  if (isActive) {
    menuOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = ''; 
    setTimeout(() => menuOverlay.setAttribute('hidden', ''), 600);
    
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (plusBtn) {
      plusBtn.setAttribute('aria-expanded', 'false');
      plusBtn.classList.remove('active');
    }
  } else {
    if (contactOverlay.classList.contains('active')) toggleContact();
    
    menuOverlay.removeAttribute('hidden');
    setTimeout(() => menuOverlay.classList.add('active'), 10);
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    if (plusBtn) {
      plusBtn.setAttribute('aria-expanded', 'true');
      plusBtn.classList.add('active');
    }
  }
}

function toggleContact() {
  const isActive = contactOverlay.classList.contains('active');
  if (isActive) {
    contactOverlay.classList.remove('active');
    document.body.classList.remove('contact-open');
    document.body.style.overflow = ''; 
    setTimeout(() => contactOverlay.setAttribute('hidden', ''), 600);
  } else {
    if (menuOverlay.classList.contains('active')) toggleMenu();
    
    contactOverlay.removeAttribute('hidden');
    setTimeout(() => contactOverlay.classList.add('active'), 10);
    document.body.classList.add('contact-open');
    document.body.style.overflow = 'hidden'; 
  }
}

// Event Listeners for Overlays
if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
if (plusBtn) plusBtn.addEventListener('click', toggleMenu);
if (menuClose) menuClose.addEventListener('click', toggleMenu);
if (contactBtn) contactBtn.addEventListener('click', toggleContact);
if (contactFromMenuBtn) contactFromMenuBtn.addEventListener('click', toggleContact);
if (contactFooterMenuBtn) {
  contactFooterMenuBtn.addEventListener('click', () => {
    toggleContact(); // Close contact
    setTimeout(toggleMenu, 600); // Open menu after contact closes
  });
}

// Close on link click inside menu
document.querySelectorAll('.menu-link-close').forEach(link => {
  link.addEventListener('click', () => {
    if (menuOverlay.classList.contains('active')) toggleMenu();
  });
});

// Logo acts as global close if overlays are open
brandLogo.addEventListener('click', (e) => {
  if (contactOverlay.classList.contains('active') || menuOverlay.classList.contains('active')) {
    e.preventDefault(); // Prevent jump to #home if just closing
    if (contactOverlay.classList.contains('active')) toggleContact();
    if (menuOverlay.classList.contains('active')) toggleMenu();
  }
});


// Form Logic
document.addEventListener('DOMContentLoaded', () => {
  // 1. Date Blocker & Custom Trigger (Flatpickr)
  const dateWrapper = document.querySelector('.custom-date-wrapper');
  const dateLabel = dateWrapper ? dateWrapper.querySelector('.floating-label') : null;

  if (dateWrapper && dateLabel) {
    flatpickr(dateWrapper, {
      positionElement: dateLabel,
      disableMobile: true, // Forces premium flatpickr UI on mobile instead of ugly native
      minDate: "today",
      dateFormat: "d/m/Y",
      onChange: function(selectedDates, dateStr, instance) {
        dateLabel.childNodes[0].nodeValue = dateStr + ' ';
        dateWrapper.classList.add('has-value');
        dateLabel.style.color = '#000';
        dateLabel.style.fontWeight = '900';
        const arrow = dateLabel.querySelector('.label-arrow');
        if(arrow) arrow.style.transform = 'rotate(180deg)';
      },
      onOpen: function() {
        dateLabel.style.color = '#000';
        dateLabel.style.fontWeight = '900';
        const arrow = dateLabel.querySelector('.label-arrow');
        if(arrow) arrow.style.transform = 'rotate(180deg)';
      },
      onClose: function() {
        if(!dateWrapper.classList.contains('has-value')) {
          dateLabel.style.color = '';
          dateLabel.style.fontWeight = '';
        }
        const arrow = dateLabel.querySelector('.label-arrow');
        if(arrow && dateWrapper.classList.contains('has-value')) {
           // keep arrow up if value selected? Usually dropdowns reset arrow.
           // Let's reset arrow like standard dropdowns
           arrow.style.transform = '';
        } else if (arrow) {
           arrow.style.transform = '';
        }
      }
    });
  }

  // 2. Standard Input Floating Labels
  // Removed :valid logic in CSS, solely relying on has-value class in JS for accuracy.
  const inputs = document.querySelectorAll('.luxury-input:not(.custom-select-trigger)');
  inputs.forEach(input => {
    // Initial check
    if (input.value && input.value.trim() !== '') input.classList.add('has-value');
    
    // Check on input/blur
    ['input', 'blur', 'change'].forEach(evt => {
      input.addEventListener(evt, () => {
        if (input.value && input.value.trim() !== '') {
          input.classList.add('has-value');
        } else {
          input.classList.remove('has-value');
        }
      });
    });
  });

  // 3. Custom Dropdowns Logic
  const customSelects = document.querySelectorAll('.custom-select-wrapper');
  
  customSelects.forEach(wrapper => {
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');
    const options = wrapper.querySelectorAll('.custom-option');
    const label = wrapper.querySelector('.floating-label');

    // Toggle Dropdown
    trigger.addEventListener('click', (e) => {
      // Close all other dropdowns first
      customSelects.forEach(otherWrapper => {
        if (otherWrapper !== wrapper) otherWrapper.classList.remove('is-open');
      });
      wrapper.classList.toggle('is-open');
      e.stopPropagation(); // prevent document click from firing instantly
    });

    // Select Option
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        const val = option.getAttribute('data-value');
        const text = option.textContent;
        
        hiddenInput.value = val;
        label.childNodes[0].nodeValue = text + ' '; // Replace label text, keep arrow
        wrapper.classList.add('has-value'); 
        wrapper.classList.remove('is-open');
        e.stopPropagation();
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    customSelects.forEach(wrapper => {
      wrapper.classList.remove('is-open');
    });
  });

  // 4. Portfolio Generation & Auto-Scroll
  let photoNames = [
    "DSC04160.webp", "DSC05749.webp", "DSC05750.webp", "DSC05752.webp", "DSC05753.webp", 
    "DSC05872.webp", "DSC05873.webp", "DSC05874.webp", "DSC05884.webp", "DSC06022.webp", 
    "DSC06048.webp", "DSC06049.webp", "IMG_0614.webp", "IMG_0773.webp", "IMG_4118.webp", 
    "IMG_4120.webp", "IMG_4124.webp", "IMG_4126.webp", "IMG_4127.webp", 
    "IMG_4130.webp", "IMG_4134.webp", "IMG_4136.webp", "IMG_4137.webp", 
    "IMG_4138.webp", "IMG_4139.webp", "IMG_4140.webp", "IMG_4141.webp", 
    "IMG_4142.webp", "IMG_4143.webp", "IMG_4144.webp", "IMG_4146.webp", 
    "IMG_4192.webp", "IMG_4193.webp", "IMG_4194.webp", "IMG_5104.webp", "IMG_5105.webp", 
    "IMG_5107.webp", "IMG_5108.webp", "IMG_5109.webp", "IMG_5110.webp", 
    "IMG_5122.webp", "IMG_5123.webp", "IMG_5124.webp", "IMG_5125.webp", "IMG_5126.webp", 
    "IMG_5129.webp", "IMG_5130.webp", "IMG_5131.webp", "IMG_5132.webp", "IMG_5133.webp", 
    "IMG_5134.webp", "IMG_5135.webp", "IMG_5136.webp", "IMG_5137.webp", "IMG_5138.webp", 
    "IMG_5139.webp", "_MG_1337.webp", "_MG_1428.webp", "_MG_1614.webp", "_MG_1696.webp"
  ];

  // Aleatorizar a ordem das fotos (Fisher-Yates Shuffle)
  for (let i = photoNames.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [photoNames[i], photoNames[j]] = [photoNames[j], photoNames[i]];
  }

  const portfolioGrid = document.getElementById('portfolio-grid');
  if (portfolioGrid) {
    photoNames.forEach((photo, index) => {
      const item = document.createElement('div');
      item.className = 'masonry-item fade-up';
      if (index < 6) item.style.transitionDelay = `${index * 0.1}s`;
      
      const img = document.createElement('img');
      img.className = 'masonry-img';
      img.src = `./fotos/${photo}`;
      img.alt = `Fotografia Nikolas ${index + 1}`;
      img.loading = 'lazy'; // crucial for performance
      img.decoding = 'async'; // frees main thread from decoding lag
      
      // O primeiro item do site deve ser P&B rigorosamente!
      if (index === 0) {
        img.style.filter = 'grayscale(100%)';
      }
      
      item.appendChild(img);
      portfolioGrid.appendChild(item);
      observer.observe(item);
    });
  }

  // Auto-Scroll Logic
  let isAutoScrolling = false;
  let scrollInterval;
  let idleTimeout;
  const scrollSpeed = 1; // Pixels per frame
  const IDLE_TIME = 2500; // 2.5 seconds idle before auto-scroll starts

  function startAutoScroll() {
    if (isAutoScrolling) return;
    isAutoScrolling = true;
    
    function scrollStep() {
      if (!isAutoScrolling) return;
      window.scrollBy(0, scrollSpeed);
      if ((window.innerHeight + window.scrollY) < document.body.offsetHeight - 5) {
        scrollInterval = requestAnimationFrame(scrollStep);
      } else {
        isAutoScrolling = false;
      }
    }
    scrollInterval = requestAnimationFrame(scrollStep);
  }

  function stopAutoScroll() {
    isAutoScrolling = false;
    if (scrollInterval) cancelAnimationFrame(scrollInterval);
  }

  function resetIdleTimer() {
    stopAutoScroll();
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      if ((window.innerHeight + window.scrollY) < document.body.offsetHeight - 5) {
        startAutoScroll();
      }
    }, IDLE_TIME);
  }

  const portfolioSection = document.getElementById('portfolio');
  if (portfolioSection) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          resetIdleTimer();
        } else {
          stopAutoScroll();
          clearTimeout(idleTimeout);
        }
      });
    }, { threshold: 0.1 });
    
    scrollObserver.observe(portfolioSection);

    window.addEventListener('wheel', resetIdleTimer, { passive: true });
    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    window.addEventListener('mousedown', resetIdleTimer, { passive: true });
    window.addEventListener('keydown', resetIdleTimer, { passive: true });
  }

});

// Cinematic Fade-ups (Intersection Observer)
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
