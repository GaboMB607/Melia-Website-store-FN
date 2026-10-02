/* ==========================================================================
   Melia · Newsletter "Únete a la colmena"
   Intercepta el envío, valida el correo, muestra el estado de carga
   ("Enviando...") y, tras 1.5 s, un mensaje de éxito animado.

   ---------------------------------------------------------------------------
   INTEGRACIÓN CON EMAILJS (preparada, desactivada)
   ---------------------------------------------------------------------------
   1. Crea una cuenta en https://www.emailjs.com y configura:
      - un Email Service  (te da el SERVICE_ID)
      - un Email Template (te da el TEMPLATE_ID) con la variable {{user_email}}
      - tu Public Key     (Account > General)
   2. En index.html, ANTES de los scripts de /js, añade el SDK:
      <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js" defer></script>
   3. Rellena EMAILJS_CONFIG más abajo y pon enabled: true.
   4. Descomenta el bloque marcado como "EmailJS" dentro de sendSubscription().
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $ } = Melia.utils;

  const EMAILJS_CONFIG = {
    enabled: false,
    publicKey: 'TU_PUBLIC_KEY',
    serviceId: 'TU_SERVICE_ID',
    templateId: 'TU_TEMPLATE_ID',
  };

  const SIMULATED_DELAY_MS = 1500;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const MESSAGES = {
    empty: 'Escribe tu correo electrónico para unirte.',
    invalid: 'Revisa tu correo: debe tener el formato nombre@correo.com.',
    failed: 'No pudimos completar tu suscripción. Inténtalo de nuevo en un momento.',
    loading: 'Enviando...',
    success: '¡Bienvenido a Melia! Pronto recibirás nuestras novedades.',
  };

  /**
   * Envía la suscripción. Hoy simula la petición; con EmailJS activo,
   * devuelve la promesa real de emailjs.send().
   */
  function sendSubscription(email) {
    /* ---------- EmailJS ----------
    if (EMAILJS_CONFIG.enabled && window.emailjs) {
      window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
      return window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        user_email: email,
      });
    }
    -------------------------------- */
    return new Promise((resolve) => window.setTimeout(resolve, SIMULATED_DELAY_MS));
  }

  function init() {
    const wrapper = $('[data-newsletter]');
    const form = wrapper && $('[data-newsletter-form]', wrapper);
    if (!form) return;

    const input = $('input[type="email"]', form);
    const submit = $('button[type="submit"]', form);
    const submitLabel = $('.btn__label', submit);
    const errorBox = $('#newsletterError', form);
    const errorText = $('[data-newsletter-error]', form);
    const success = $('[data-newsletter-success]', wrapper);
    const status = $('[data-newsletter-status]', wrapper);
    const idleLabel = submitLabel.textContent;

    const showError = (message) => {
      errorText.textContent = message;
      errorBox.hidden = false;
      input.setAttribute('aria-invalid', 'true');
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
      form.classList.add('is-leaving');
      window.setTimeout(() => {
        form.hidden = true;
        success.hidden = false;
        success.focus({ preventScroll: true });
      }, 320);
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
      setLoading(true);

      try {
        await sendSubscription(email);
        showSuccess();
      } catch (error) {
        setLoading(false);
        showError(MESSAGES.failed);
      }
    });
  }

  Melia.newsletter = { init };
})(window.Melia = window.Melia || {});
