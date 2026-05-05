/* ============================================================
   EjeSalud – Capa de API
   Conecta con el backend REST (Node.js + Express + MongoDB)
   Repo: https://github.com/AkJoss/Eje_Salud
   ============================================================ */

// ── Configuración base ────────────────────────────────────────
// Puerto 3001 (5000 lo usa macOS Control Center)
const API_BASE = 'http://localhost:3001';

// ── Token helper ──────────────────────────────────────────────
const Auth = {
  getToken:  ()      => localStorage.getItem('ejesalud_token'),
  setToken:  (t)     => localStorage.setItem('ejesalud_token', t),
  getUser:   ()      => JSON.parse(localStorage.getItem('ejesalud_user') || 'null'),
  setUser:   (u)     => localStorage.setItem('ejesalud_user', JSON.stringify(u)),
  clear:     ()      => { localStorage.removeItem('ejesalud_token'); localStorage.removeItem('ejesalud_user'); },
  isLogged:  ()      => !!localStorage.getItem('ejesalud_token'),
  rol:       ()      => Auth.getUser()?.rol || null,
};

// ── Fetch helper ──────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Lanza un error con el mensaje del backend si existe
    throw new Error(data.mensaje || data.message || `Error ${res.status}`);
  }
  return data;
}

// ── AUTH ──────────────────────────────────────────────────────
const ApiAuth = {
  /** POST /api/auth/login → { ok, token, usuario } */
  login: (email, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /** POST /api/auth/registro → { ok, token, usuario } */
  registro: (datos) =>
    apiFetch('/api/auth/registro', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),

  /** GET /api/auth/perfil → { usuario } */
  perfil: () => apiFetch('/api/auth/perfil'),
};

// ── MÉDICOS ───────────────────────────────────────────────────
const ApiMedicos = {
  /** GET /api/medicos?especialidad= → { medicos: [...] } */
  listar: (especialidad = '') => {
    const qs = especialidad ? `?especialidad=${encodeURIComponent(especialidad)}` : '';
    return apiFetch(`/api/medicos${qs}`);
  },

  /** GET /api/medicos/especialidades → { especialidades: [...] } */
  especialidades: () => apiFetch('/api/medicos/especialidades'),

  /** GET /api/medicos/:id → { medico } */
  obtener: (id) => apiFetch(`/api/medicos/${id}`),
};

// ── CITAS ─────────────────────────────────────────────────────
const ApiCitas = {
  /** GET /api/citas → { citas: [...] } */
  listar: () => apiFetch('/api/citas'),

  /** GET /api/citas/:id → { cita } */
  obtener: (id) => apiFetch(`/api/citas/${id}`),

  /**
   * GET /api/citas/disponibilidad?medicoId=&fecha=
   * → { horasDisponibles: ['09:00', ...] }
   */
  disponibilidad: (medicoId, fecha) =>
    apiFetch(`/api/citas/disponibilidad?medicoId=${medicoId}&fecha=${fecha}`),

  /**
   * POST /api/citas
   * body: { medico, especialidad, fecha, hora, motivo }
   * → { ok, cita }
   */
  agendar: (datos) =>
    apiFetch('/api/citas', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),

  /** DELETE /api/citas/:id → { ok, mensaje } */
  cancelar: (id) =>
    apiFetch(`/api/citas/${id}`, { method: 'DELETE' }),

  /** PUT /api/citas/:id/estado  body: { estado } → { ok, cita } */
  cambiarEstado: (id, estado) =>
    apiFetch(`/api/citas/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    }),

  /**
   * Mover cita = cancelar la anterior + agendar nueva.
   * Se mantiene el mismo medico, especialidad y motivo.
   */
  mover: async (citaId, nuevaFecha, nuevaHora) => {
    // 1. Obtener datos de la cita antes de cancelar
    const res = await ApiCitas.obtener(citaId);
    const cita = res.cita;
    if (!cita) throw new Error('Cita no encontrada');

    const medicoId    = cita.medico?._id || cita.medico;
    const especialidad = cita.especialidad;
    const motivo       = cita.motivo || '';

    // 2. Cancelar la cita anterior
    await ApiCitas.cancelar(citaId);

    // 3. Agendar nueva cita con los mismos datos
    return ApiCitas.agendar({
      medico:      medicoId,
      especialidad,
      fecha:       nuevaFecha,
      hora:        nuevaHora,
      motivo,
    });
  },
};

// ── Guard de autenticación ────────────────────────────────────
/**
 * Llama esto en páginas protegidas (dashboards, wizard, etc.)
 * Redirige a login si no hay sesión activa.
 */
function requireAuth(rolRequerido = null) {
  if (!Auth.isLogged()) {
    window.location.href = 'login.html';
    return false;
  }
  if (rolRequerido && Auth.rol() !== rolRequerido) {
    // Redirigir al dashboard correcto si el rol no coincide
    window.location.href = Auth.rol() === 'medico'
      ? 'dashboard-medico.html'
      : 'dashboard-paciente.html';
    return false;
  }
  return true;
}

/**
 * Inyecta el nombre del usuario logueado en elementos con
 * data-user-name y data-user-role dentro de la página.
 */
function injectUserInfo() {
  const user = Auth.getUser();
  if (!user) return;
  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = user.nombre || user.email;
  });
  document.querySelectorAll('[data-user-role]').forEach(el => {
    el.textContent = user.rol === 'medico' ? 'Médico' : 'Paciente';
  });
  document.querySelectorAll('[data-user-initials]').forEach(el => {
    const n = user.nombre || user.email || '?';
    el.textContent = n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  });
}

// ── Aliases de compatibilidad (consultation.html de Edgar) ───
// Auth helpers extra
Auth.getToken    = () => localStorage.getItem('ejesalud_token');
Auth.getUsuario  = Auth.getUser;
Auth.setSession  = (token, usuario) => { Auth.setToken(token); Auth.setUser(usuario); };
Auth.clearSession = Auth.clear;
Auth.isLoggedIn  = Auth.isLogged;
Auth.isAdmin     = () => Auth.rol() === 'admin';
Auth.isMedico    = () => Auth.rol() === 'medico';

// MedicosAPI → ApiMedicos
const MedicosAPI = ApiMedicos;

// CitasAPI → ApiCitas (con mover)
const CitasAPI = {
  listar:        ApiCitas.listar,
  obtener:       ApiCitas.obtener,
  disponibilidad:ApiCitas.disponibilidad,
  agendar:       ApiCitas.agendar,
  cancelar:      ApiCitas.cancelar,
  cambiarEstado: ApiCitas.cambiarEstado,
  mover:         ApiCitas.mover,
};

// AuthAPI → ApiAuth (con logout)
const AuthAPI = {
  login:    ApiAuth.login,
  registro: ApiAuth.registro,
  perfil:   ApiAuth.perfil,
  logout() {
    Auth.clear();
    window.location.href = 'login.html';
  },
};

// UI → helpers de navegación y navbar
const UI = {
  requireAuth() {
    if (!Auth.isLogged()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },
  requireAdmin() {
    if (!Auth.isAdmin()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },
  updateNavbar() {
    const usuario = Auth.getUser();
    const navLogin    = document.getElementById('nav-login');
    const navUsuario  = document.getElementById('nav-usuario');
    const navNombre   = document.getElementById('nav-nombre');
    const navLogout   = document.getElementById('nav-logout');
    const navMisCitas = document.getElementById('nav-mis-citas');
    if (usuario) {
      if (navLogin)    navLogin.style.display    = 'none';
      if (navUsuario)  navUsuario.style.display  = 'flex';
      if (navNombre)   navNombre.textContent     = usuario.nombre || '';
      if (navMisCitas) navMisCitas.style.display = 'block';
      if (navLogout)   navLogout.addEventListener('click', () => AuthAPI.logout());
    } else {
      if (navLogin)    navLogin.style.display    = 'block';
      if (navUsuario)  navUsuario.style.display  = 'none';
      if (navMisCitas) navMisCitas.style.display = 'none';
    }
  },
};

document.addEventListener('DOMContentLoaded', () => UI.updateNavbar());
