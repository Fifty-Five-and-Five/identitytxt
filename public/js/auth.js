document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');
  errorEl.style.display = 'none';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = '/app.html';
    } else {
      errorEl.style.display = 'block';
      document.getElementById('password').select();
    }
  } catch (err) {
    errorEl.textContent = 'Connection error';
    errorEl.style.display = 'block';
  }
});
