// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    SUBMIT_COOLDOWN: 5000, // 5 segundos
    WHATSAPP_NUMBER: '526691517346',
    ANIMATION_DURATION: 800,
    TOAST_DURATION: 3000
};

// ============================================
// INICIALIZACIÓN DE LA PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Ocultar loading screen
    hideLoader();
    
    // Inicializar AOS (Animate On Scroll)
    initializeAOS();
    
    // Inicializar observers
    initializeIntersectionObservers();
    
    // Inicializar event listeners
    initializeEventListeners();
    
    // Log de bienvenida
    logWelcomeMessage();
}

// ============================================
// LOADING SCREEN
// ============================================
function hideLoader() {
    window.addEventListener('load', () => {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500);
        }
    });
}

// ============================================
// INICIALIZACIÓN DE ANIMACIONES AOS
// ============================================
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: CONFIG.ANIMATION_DURATION,
            easing: 'ease-out',
            once: true,
            offset: 100,
            disable: function() {
                // Desactivar en dispositivos de bajo rendimiento
                return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            }
        });
    }
}

// ============================================
// MENÚ RESPONSIVE
// ============================================
function toggleMenu() {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.menu-toggle');
    const isActive = nav.classList.contains('active');
    
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
    
    // Actualizar aria-expanded
    toggle.setAttribute('aria-expanded', !isActive);
    
    // Prevenir scroll cuando el menú está abierto
    if (!isActive) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMenu() {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.menu-toggle');
    
    nav.classList.remove('active');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Cerrar menú cuando se hace clic fuera de él
document.addEventListener('click', function(event) {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('header');
    
    if (!header.contains(event.target) && nav.classList.contains('active')) {
        closeMenu();
    }
});

// Cerrar menú con la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const nav = document.getElementById('mainNav');
        if (nav.classList.contains('active')) {
            closeMenu();
        }
    }
});

// ============================================
// SMOOTH SCROLL PARA NAVEGACIÓN
// ============================================
function initializeEventListeners() {
    const links = document.querySelectorAll('nav a[href^="#"], a.cta-button[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil si está abierto
                closeMenu();
                
                // Establecer foco en la sección
                targetSection.setAttribute('tabindex', '-1');
                targetSection.focus();
            }
        });
    });
}

// ============================================
// BOTÓN VOLVER ARRIBA (SCROLL TO TOP)
// ============================================
const scrollToTopButton = document.getElementById('scrollToTop');

// Mostrar/ocultar botón según el scroll
let isScrolling;
window.addEventListener('scroll', function() {
    // Debounce para mejor rendimiento
    window.clearTimeout(isScrolling);
    
    isScrolling = setTimeout(function() {
        if (window.pageYOffset > 300) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    }, 66); // ~15fps
}, { passive: true });

// Funcionalidad del botón
if (scrollToTopButton) {
    scrollToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Establecer foco en el contenido principal
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
        }
    });
}

// ============================================
// FAQ EXPANDIBLE (ACCORDION)
// ============================================
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const wasActive = faqItem.classList.contains('active');
    
    // Cerrar todas las preguntas
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    
    // Si no estaba activa, abrirla
    if (!wasActive) {
        faqItem.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
    }
}

// También permitir abrir/cerrar con Enter o Espacio
document.addEventListener('DOMContentLoaded', function() {
    const faqButtons = document.querySelectorAll('.faq-question');
    
    faqButtons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(this);
            }
        });
    });
});

// ============================================
// FORMULARIO DE CONTACTO CON VALIDACIÓN
// ============================================
let lastSubmitTime = 0;

function handleFormSubmit(event) {
    event.preventDefault();
    
    // Prevenir spam
    const now = Date.now();
    if (now - lastSubmitTime < CONFIG.SUBMIT_COOLDOWN) {
        showToast('Por favor espera unos segundos antes de enviar otro mensaje.', 'error');
        return;
    }
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Obtener valores del formulario
    const formData = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        service: form.service.value,
        message: form.message.value.trim()
    };
    
    // Validación básica
    if (!formData.name || !formData.phone || !formData.message) {
        showMessage('Por favor completa todos los campos requeridos.', 'error');
        return;
    }
    
    // Validar nombre (mínimo 3 caracteres)
    if (formData.name.length < 3) {
        showMessage('Por favor ingresa un nombre válido.', 'error');
        return;
    }
    
    // Validar teléfono (simple: solo números y caracteres permitidos)
    const phonePattern = /^[\d\-\s\(\)\+]+$/;
    if (!phonePattern.test(formData.phone)) {
        showMessage('Por favor ingresa un número de teléfono válido.', 'error');
        return;
    }
    
    // Validar longitud de teléfono
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        showMessage('El teléfono debe tener al menos 10 dígitos.', 'error');
        return;
    }
    
    // Validar email si se proporcionó
    if (formData.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            showMessage('Por favor ingresa un email válido.', 'error');
            return;
        }
    }
    
    // Validar mensaje (mínimo 10 caracteres)
    if (formData.message.length < 10) {
        showMessage('El mensaje debe tener al menos 10 caracteres.', 'error');
        return;
    }
    
    // Deshabilitar botón mientras se procesa
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    
    // Simular envío
    setTimeout(() => {
        // Preparar mensaje de WhatsApp
        let whatsappMessage = `Hola! Soy ${formData.name}.\n\n${formData.message}`;
        
        if (formData.service) {
            const serviceNames = {
                'reparacion': 'Reparación de PC',
                'mantenimiento': 'Mantenimiento Preventivo',
                'software': 'Instalación de Software',
                'soporte': 'Soporte Técnico',
                'recuperacion': 'Recuperación de Datos',
                'redes': 'Configuración de Redes',
                'otro': 'Otro servicio'
            };
            whatsappMessage += `\n\nServicio de interés: ${serviceNames[formData.service] || formData.service}`;
        }
        
        whatsappMessage += `\n\nMi teléfono es: ${formData.phone}`;
        
        if (formData.email) {
            whatsappMessage += `\nMi email es: ${formData.email}`;
        }
        
        const whatsappURL = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
        
        showMessage('¡Mensaje preparado! Te redirigiremos a WhatsApp...', 'success');
        showToast('¡Redirigiendo a WhatsApp!', 'success');
        
        // Actualizar tiempo del último envío
        lastSubmitTime = Date.now();
        
        // Redirigir a WhatsApp después de 1.5 segundos
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
            form.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Mensaje';
            
            // Limpiar mensaje después de redirección
            setTimeout(() => {
                const formMessage = document.getElementById('formMessage');
                if (formMessage) {
                    formMessage.className = 'form-message';
                }
            }, 2000);
        }, 1500);
        
    }, 1000);
}

function showMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            formMessage.className = 'form-message';
        }, 5000);
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

// ============================================
// ANIMACIÓN DE NÚMEROS (ESTADÍSTICAS)
// ============================================
function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ============================================
// INTERSECTION OBSERVERS
// ============================================
function initializeIntersectionObservers() {
    // Observer para estadísticas
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numbers = entry.target.querySelectorAll('.stat-number');
                numbers.forEach(num => {
                    const text = num.textContent;
                    if (text.includes('%')) {
                        const value = parseInt(text);
                        num.textContent = '0%';
                        setTimeout(() => {
                            animateNumber(num, value);
                            setTimeout(() => {
                                num.textContent = text;
                            }, 2000);
                        }, 300);
                    } else if (text.includes('+')) {
                        const value = parseInt(text.replace('+', ''));
                        num.textContent = '0';
                        setTimeout(() => {
                            animateNumber(num, value);
                            setTimeout(() => {
                                num.textContent = '+' + value;
                            }, 2000);
                        }, 300);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px'
    });

    // Observar las estadísticas
    const statsSection = document.querySelector('.dna-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    // Observer para lazy loading de imágenes (si se agregan)
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    // Observar imágenes lazy
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
        if (!('loading' in HTMLImageElement.prototype)) {
            imageObserver.observe(img);
        }
    });
}

// ============================================
// DETECCIÓN DE RENDIMIENTO DEL DISPOSITIVO
// ============================================
function isLowEndDevice() {
    // Detectar si es un dispositivo de bajo rendimiento
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSaveData = connection && connection.saveData;
    const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    const hasSlowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    return isSaveData || isSlowConnection || hasLowMemory || hasSlowCPU;
}

// Ajustar animaciones según el rendimiento
if (isLowEndDevice()) {
    document.documentElement.classList.add('reduce-animations');
    console.log('🔋 Modo de bajo rendimiento activado');
}

// ============================================
// UTILIDADES DE RENDIMIENTO
// ============================================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// PREVENCIÓN DE ERRORES
// ============================================

// Manejo global de errores
window.addEventListener('error', function(e) {
    console.error('Error capturado:', e.error);
    // Podrías enviar esto a un servicio de logging
});

// Manejo de promesas rechazadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada:', e.reason);
});

// ============================================
// ANALYTICS Y TRACKING (OPCIONAL)
// ============================================
function trackEvent(category, action, label) {
    // Implementar tracking si se usa Google Analytics, etc.
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
}

// Track clicks en CTA buttons
document.addEventListener('DOMContentLoaded', function() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('CTA', 'click', this.textContent);
        });
    });
});

// ============================================
// ACCESIBILIDAD - FOCUS VISIBLE
// ============================================
let isUsingKeyboard = false;

document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', function() {
    isUsingKeyboard = false;
    document.body.classList.remove('using-keyboard');
});

// ============================================
// PWA - SERVICE WORKER (OPCIONAL)
// ============================================
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('❌ Error al registrar Service Worker:', error);
            });
    });
}
*/

// ============================================
// SHARE API (Compartir sitio web)
// ============================================
async function shareWebsite() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Concordia Digital',
                text: '¡Servicios técnicos profesionales en Concordia, Sinaloa!',
                url: window.location.href
            });
            trackEvent('Social', 'share', 'Web Share API');
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error al compartir:', err);
            }
        }
    } else {
        // Fallback: copiar URL al clipboard
        try {
            await navigator.clipboard.writeText(window.location.href);
            showToast('¡Enlace copiado al portapapeles!', 'success');
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    }
}

// ============================================
// DETECCIÓN DE CONEXIÓN
// ============================================
window.addEventListener('online', function() {
    showToast('Conexión restaurada', 'success');
});

window.addEventListener('offline', function() {
    showToast('Sin conexión a internet', 'error');
});

// ============================================
// OPTIMIZACIÓN DE SCROLL
// ============================================
let ticking = false;
let lastKnownScrollPosition = 0;

function doSomethingOnScroll(scrollPos) {
    // Actualizar header sticky, etc.
    const header = document.querySelector('header');
    if (header) {
        if (scrollPos > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

window.addEventListener('scroll', function() {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking) {
        window.requestAnimationFrame(function() {
            doSomethingOnScroll(lastKnownScrollPosition);
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// ============================================
// EASTER EGG - KONAMI CODE (OPCIONAL)
// ============================================
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-konamiPattern.length);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
        showToast('🎉 ¡Has encontrado el código secreto! 🚀', 'success');
        document.body.style.transform = 'rotate(360deg)';
        document.body.style.transition = 'transform 2s ease';
        setTimeout(() => {
            document.body.style.transform = '';
        }, 2000);
        konamiCode = [];
    }
});

// ============================================
// CONSOLA - Mensaje para desarrolladores
// ============================================
function logWelcomeMessage() {
    const styles = {
        title: 'font-size: 20px; font-weight: bold; color: #00ff00;',
        subtitle: 'font-size: 14px; color: #888;',
        footer: 'font-size: 12px; color: #666;'
    };
    
    console.log('%c¡Hola Desarrollador! 👋', styles.title);
    console.log('%cSi encuentras algún bug o tienes sugerencias, ¡contáctanos!', styles.subtitle);
    console.log('%cConcordia Digital - Hecho con ❤️ en Concordia, Sinaloa', styles.footer);
    console.log('%c' + `
    ╔═══════════════════════════════════════╗
    ║   CONCORDIA DIGITAL - v2.0.0         ║
    ║   Optimizado para rendimiento        ║
    ║   y accesibilidad                    ║
    ╚═══════════════════════════════════════╝
    `, 'color: #00ff00; font-family: monospace;');
}

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.concordiaDigital = {
    toggleMenu,
    closeMenu,
    toggleFAQ,
    handleFormSubmit,
    showToast,
    shareWebsite,
    trackEvent
};
