/* ============================================================
   EjeSalud – auth.js
   Maneja login.html y registro.html
   ============================================================ */

// ── Helpers UI ────────────────────────────────────────────────
function showAuthError(msg) {
  const el = document.getElementById('error-msg');
  const tx = document.getElementById('error-text');
  if (el && tx) { tx.textContent = msg; el.style.display = 'flex'; }
}
function hideAuthError() {
  const el = document.getElementById('error-msg');
  if (el) el.style.display = 'none';
}
function showAuthSuccess(msg) {
  const el = document.getElementById('success-msg');
  const tx = document.getElementById('success-text');
  if (el && tx) { tx.textContent = msg; el.style.display = 'flex'; }
}
function setAuthLoading(btnId, loading, textoDefault) {
  const btn  = document.getElementById(btnId);
  const text = document.getElementById('btn-text');
  const spin = document.getElementById('btn-spinner');
  if (!btn) return;
  btn.disabled = loading;
  if (text) text.style.display = loading ? 'none'   : 'inline';
  if (spin) spin.style.display = loading ? 'inline' : 'none';
}

// ── Toggle mostrar/ocultar contraseña ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const input = icon.previousElementSibling;
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      icon.classList.toggle('fa-eye',      isText);
      icon.classList.toggle('fa-eye-slash', !isText);
    });
  });

  // ── LOGIN ────────────────────────────────────────────────────
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    // Redirigir si ya está logueado
    if (Auth.isLoggedIn()) {
      window.location.href = Auth.rol() === 'medico'
        ? 'dashboard-medico.html'
        : 'mis-citas.html';
      return;
    }

    btnLogin.addEventListener('click', async () => {
      hideAuthError();
      const email    = document.getElementById('email')?.value?.trim();
      const password = document.getElementById('password')?.value;

      if (!email || !password) { showAuthError('Completa todos los campos.'); return; }

      setAuthLoading('btn-login', true);
      try {
        const data = await AuthAPI.login(email, password);
        // Redirigir según rol
        setTimeout(() => {
          if (data.usuario?.rol === 'medico') {
            window.location.href = 'mis-citas.html';
          } else if (data.usuario?.rol === 'admin') {
            window.location.href = 'mis-citas.html';
          } else {
            window.location.href = 'mis-citas.html';
          }
        }, 600);
      } catch (err) {
        showAuthError(err.message || 'Correo o contraseña incorrectos.');
        setAuthLoading('btn-login', false);
      }
    });

    // Permitir Enter en el campo de password
    document.getElementById('password')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnLogin.click();
    });
  }

  // ── REGISTRO ─────────────────────────────────────────────────
  const btnRegistro = document.getElementById('btn-registro');
  if (btnRegistro) {
    // Redirigir si ya está logueado
    if (Auth.isLoggedIn()) { window.location.href = 'mis-citas.html'; return; }

    btnRegistro.addEventListener('click', async () => {
      hideAuthError();
      const nombre    = document.getElementById('nombre')?.value?.trim();
      const apellido  = document.getElementById('apellido')?.value?.trim();
      const telefono  = document.getElementById('telefono')?.value?.trim();
      const email     = document.getElementById('email')?.value?.trim();
      const password  = document.getElementById('password')?.value;
      const confirmar = document.getElementById('confirmar-password')?.value;
      const fechaNacimiento = document.getElementById('fechaNacimiento')?.value || undefined;

      if (!nombre || !apellido || !telefono || !email || !password) {
        showAuthError('Completa todos los campos obligatorios.'); return;
      }
      if (password.length < 6) {
        showAuthError('La contraseña debe tener al menos 6 caracteres.'); return;
      }
      if (password !== confirmar) {
        showAuthError('Las contraseñas no coinciden.'); return;
      }

      setAuthLoading('btn-registro', true);
      try {
        await AuthAPI.registro({ nombre, apellido, telefono, email, password, fechaNacimiento });
        showAuthSuccess('¡Cuenta creada exitosamente! Redirigiendo…');
        setTimeout(() => window.location.href = 'mis-citas.html', 1200);
      } catch (err) {
        showAuthError(err.message || 'Error al crear la cuenta.');
        setAuthLoading('btn-registro', false);
      }
    });
  }
});
