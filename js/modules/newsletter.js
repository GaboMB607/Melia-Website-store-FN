/* ==========================================================================
   Melia · Newsletter "Únete a la colmena" (EmailJS)
   - Inicializa EmailJS con la Public Key
   - Intercepta el envío del formulario (sin recargar la página)
   - Valida el correo, muestra "Enviando..." y envía con emailjs.send()
   - Éxito: limpia el formulario y muestra el mensaje debajo
   - Error: muestra un mensaje de error bajo el campo

   En la plantilla de EmailJS el correo llega en la variable {{email}}
   (úsala en "To Email" para que el suscriptor reciba la bienvenida).
   El SDK se carga desde el CDN oficial en index.html.
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $ } = Melia.utils;

  const EMAILJS_CONFIG = {
    publicKey: 's8S8dT_fZVSnciSk8',
    serviceId: 'service_os8182x',
    templateId: 'template_lnrvv6d',
  };

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const MESSAGES = {
    empty: 'Escribe tu correo electrónico para unirte.',
    invalid: 'Revisa tu correo: debe tener el formato nombre@correo.com.',
    failed: 'No pudimos completar tu suscripción. Inténtalo de nuevo en un momento.',
    loading: 'Enviando...',
    success: '¡Bienvenido a Melia! Revisa tu correo.',
  };

  function initEmailJS() {
    if (!window.emailjs) {
      console.warn('[Melia] El SDK de EmailJS no se cargó (¿sin conexión o bloqueado?).');
      return;
    }
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }

  /** Devuelve la promesa de EmailJS; falla si el SDK no está disponible */
  function sendSubscription(email) {
    if (!window.emailjs) {
      return Promise.reject(new Error('EmailJS no está disponible'));
    }
    return window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, { email });
  }

  function init() {
    const wrapper = $('[data-newsletter]');
    const form = wrapper && $('[data-newsletter-form]', wrapper);
    if (!form) return;

    initEmailJS();

    const input = $('input[type="email"]', form);
    const submit = $('button[type="submit"]', form);
    const submitLabel = $('.btn__label', submit);
    const errorBox = $('#newsletterError', form);
    const errorText = $('[data-newsletter-error]', form);
    const success = $('[data-newsletter-success]', wrapper);
    const status = $('[data-newsletter-status]', wrapper);
    const idleLabel = submitLabel.textContent;

    /** markField: false para errores de envío (el correo en sí es válido) */
    const showError = (message, { markField = true } = {}) => {
      errorText.textContent = message;
      errorBox.hidden = false;
      status.textContent = message;
      if (markField) input.setAttribute('aria-invalid', 'true');
    };

    const clearError = () => {
      errorBox.hidden = true;
      errorText.textContent = '';
      input.removeAttribute('aria-invalid');
    };

    const setLoading = (loading) => {
      form.classList.toggle('is-loading', loading);
      submit.disabled = loading;
      submit.setAttribute('aria-busy', String(loading));
      submitLabel.textContent = loading ? MESSAGES.loading : idleLabel;
      input.readOnly = loading;
    };

    const showSuccess = () => {
      status.textContent = MESSAGES.success;
      // ocultar y volver a mostrar reinicia la animación si se suscriben otra vez
      success.hidden = true;
      void success.offsetWidth;
      success.hidden = false;
    };

    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) clearError();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.classList.contains('is-loading')) return;

      const email = input.value.trim();
      if (!email) {
        showError(MESSAGES.empty);
        input.focus();
        return;
      }
      if (!EMAIL_PATTERN.test(email)) {
        showError(MESSAGES.invalid);
        input.focus();
        return;
      }

      clearError();
      success.hidden = true;
      status.textContent = '';
      setLoading(true);

      try {
        await sendSubscription(email);
        setLoading(false);
        form.reset();
        showSuccess();
      } catch (error) {
        console.error('[Melia] No se pudo enviar la suscripción:', error);
        setLoading(false);
        showError(MESSAGES.failed, { markField: false });
      }
    });
  }

  Melia.newsletter = { init };
})(window.Melia = window.Melia || {});
