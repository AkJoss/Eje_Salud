const API_URL = 'http://localhost:5000/api';

// Helpers de JWT
const Auth = {
  getToken:    () => localStorage.getItem('token'),
  getUsuario:  () => JSON.parse(localStorage.getItem('usuario') || 'null'),
  setSession:  (token, usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },
  isLoggedIn:  () => !!localStorage.getItem('token'),
  isAdmin:     () => {
    const u = Auth.getUsuario();
    return u && u.rol === 'admin';
  },
};

// Fetch base con JWT automático
async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || 'Error en la solicitud');
  }

  return data;
}

// Auth
const AuthAPI = {
  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    Auth.setSession(data.token, data.usuario);
    return data;
  },

  async registro(campos) {
    // campos: { nombre, apellido, email, telefono, fechaNacimiento, password }
    const data = await apiFetch('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(campos),
    });
    Auth.setSession(data.token, data.usuario);
    return data;
  },

  async perfil() {
    return await apiFetch('/auth/perfil');
  },

  logout() {
    Auth.clearSession();
    window.location.href = '/login.html';
  },
};

// Médicos
const MedicosAPI = {
  async listar(especialidad = null) {
    const query = especialidad
      ? `?especialidad=${encodeURIComponent(especialidad)}`
      : '';
    return await apiFetch(`/medicos${query}`);
  },

  async obtener(id) {
    return await apiFetch(`/medicos/${id}`);
  },

  async especialidades() {
    return await apiFetch('/medicos/especialidades');
  },
};

// Citas
const CitasAPI = {
  async listar() {
    return await apiFetch('/citas');
  },

  async obtener(id) {
    return await apiFetch(`/citas/${id}`);
  },

  async disponibilidad(medicoId, fecha) {
    return await apiFetch(`/citas/disponibilidad?medicoId=${medicoId}&fecha=${fecha}`);
  },

  async agendar({ medico, especialidad, fecha, hora, motivo }) {
    return await apiFetch('/citas', {
      method: 'POST',
      body: JSON.stringify({ medico, especialidad, fecha, hora, motivo }),
    });
  },

  async cancelar(id) {
    return await apiFetch(`/citas/${id}`, {
      method: 'DELETE',
    });
  },

  // Solo admin
  async cambiarEstado(id, estado) {
    return await apiFetch(`/citas/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });
  },
};

// Utilidades UI
const UI = {
  // Redirige si no está logueado
  requireAuth() {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/login.html';
    }
  },

  // Redirige si no es admin
  requireAdmin() {
    if (!Auth.isAdmin()) {
      window.location.href = '/index.html';
    }
  },

  // Muestra un mensaje de error en un elemento
  showError(elementId, mensaje) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = mensaje;
      el.style.display = 'block';
    }
  },

  // Oculta un mensaje de error
  hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
  },

  // Actualiza el navbar según sesión
  updateNavbar() {
    const usuario = Auth.getUsuario();
    const navLogin    = document.getElementById('nav-login');
    const navUsuario  = document.getElementById('nav-usuario');
    const navNombre   = document.getElementById('nav-nombre');
    const navLogout   = document.getElementById('nav-logout');
    const navMisCitas = document.getElementById('nav-mis-citas');

    if (usuario) {
      if (navLogin)    navLogin.style.display    = 'none';
      if (navUsuario)  navUsuario.style.display  = 'flex';
      if (navNombre)   navNombre.textContent     = `${usuario.nombre}`;
      if (navMisCitas) navMisCitas.style.display = 'block';
      if (navLogout)   navLogout.addEventListener('click', () => AuthAPI.logout());
    } else {
      if (navLogin)    navLogin.style.display    = 'block';
      if (navUsuario)  navUsuario.style.display  = 'none';
      if (navMisCitas) navMisCitas.style.display = 'none';
    }
  },
};

// Ejecutar updateNavbar en cada página automáticamente
document.addEventListener('DOMContentLoaded', () => UI.updateNavbar());