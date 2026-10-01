document.querySelectorAll('.js-authenticated-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      const returnTo = window.location.pathname + window.location.search;
      window.location.assign(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    const errorElement = form.querySelector('[data-error]');
    errorElement.hidden = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(new FormData(form))
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
        }
        throw new Error(result.mensaje || 'No se pudo completar la operación');
      }

      window.location.assign(result.redirect);
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.hidden = false;
    }
  });
});