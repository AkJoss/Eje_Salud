/* ============================================================
   EjeSalud – JavaScript Principal
   Usa api.js para todas las llamadas al backend real.
   ============================================================ */

// ── Utilidades de UI ──────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDayMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day:   d.getDate(),
    month: d.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()
  };
}

function showToast(msg, type = 'success') {
  const colors = { success: '#1565C0', danger: '#C62828', warning: '#E65100' };
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;
    background:${colors[type]||colors.success};color:#fff;padding:14px 22px;border-radius:10px;
    font-family:'Montserrat',sans-serif;font-size:.9rem;font-weight:600;
    box-shadow:0 8px 24px rgba(0,0,0,.25);animation:slideUp .3s ease;max-width:320px;line-height:1.4;`;
  wrap.textContent = msg;
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 3500);
}

function setLoading(btnEl, loading, texto = 'Guardar') {
  if (!btnEl) return;
  btnEl.disabled = loading;
  btnEl.innerHTML = loading
    ? '<span class="spinner-border spinner-border-sm me-2"></span>Cargando…'
    : texto;
}

// Animación toast
const _ts = document.createElement('style');
_ts.textContent = '@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(_ts);

// Iconos por especialidad
const ICONOS_ESP = {
  'Medicina General': 'fa-stethoscope',
  'Médico General':   'fa-stethoscope',
  'Medicina Interna': 'fa-heartbeat',
  'Odontología':      'fa-tooth',
  'Psicología':       'fa-brain',
  'Radiología':       'fa-x-ray',
  'Podología':        'fa-shoe-prints',
};
function iconoEsp(nombre) {
  return ICONOS_ESP[nombre] || 'fa-briefcase-medical';
}

// ── DOMContentLoaded ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Inyectar datos del usuario en la UI (sidebar, topbar)
  if (typeof injectUserInfo === 'function') injectUserInfo();

  // Sidebar mobile toggle
  const sidebarToggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!sidebar.contains(e.target) && !sidebarToggleBtn.contains(e.target))
        sidebar.classList.remove('open');
    });
  }

  // Logout buttons
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      Auth.clear();
      window.location.href = 'login.html';
    });
  });

  // ── LOGIN ─────────────────────────────────────────────────
  const loginForm = document.getElementById('loginForm');
  if (loginForm) initLogin(loginForm);

  // ── REGISTRO ──────────────────────────────────────────────
  const registroForm = document.getElementById('registroForm');
  if (registroForm) initRegistro(registroForm);

  // ── PÁGINAS PROTEGIDAS ────────────────────────────────────
  const pagina = window.location.pathname.split('/').pop();

  if (['dashboard-paciente.html','mis-citas.html','agendar-cita.html'].includes(pagina)) {
    if (!requireAuth()) return;
    if (pagina === 'agendar-cita.html') initWizard();
    if (pagina === 'mis-citas.html')    initMisCitas();
    if (pagina === 'dashboard-paciente.html') initDashPaciente();
  }

  if (['dashboard-medico.html','agenda-medico.html'].includes(pagina)) {
    if (!requireAuth()) return;
    if (pagina === 'dashboard-medico.html') initDashMedico();
    if (pagina === 'agenda-medico.html')    initAgendaMedico();
  }

  // Min-date en inputs de fecha
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"].future-only').forEach(i => i.min = today);

  // Role tabs (login)
  document.querySelectorAll('.role-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const role = btn.dataset.role;
      const roleInput = document.getElementById('roleInput');
      if (roleInput) roleInput.value = role;
      const emailInput = document.getElementById('emailInput');
      if (emailInput)
        emailInput.placeholder = role === 'medico' ? 'correo@ejsalud.mx' : 'tu.correo@email.com';
    });
  });
});

// ════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════
function initLogin(form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn      = form.querySelector('[type="submit"]');
    const email    = document.getElementById('emailInput')?.value?.trim();
    const password = document.getElementById('passwordInput')?.value;

    if (!email || !password) { showToast('Completa todos los campos', 'warning'); return; }

    setLoading(btn, true);
    try {
      const data = await ApiAuth.login(email, password);
      Auth.setToken(data.token);
      Auth.setUser(data.usuario);
      showToast('¡Bienvenido! Iniciando sesión…');
      setTimeout(() => {
        window.location.href = data.usuario?.rol === 'medico'
          ? 'dashboard-medico.html'
          : 'dashboard-paciente.html';
      }, 800);
    } catch (err) {
      showToast(err.message || 'Credenciales incorrectas', 'danger');
      setLoading(btn, false, 'Iniciar Sesión');
    }
  });
}

// ════════════════════════════════════════════════════════════
// REGISTRO
// ════════════════════════════════════════════════════════════
function initRegistro(form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');

    const datos = {
      nombre:          document.getElementById('nombreInput')?.value?.trim(),
      apellido:        document.getElementById('apellidoInput')?.value?.trim(),
      email:           document.getElementById('emailInput')?.value?.trim(),
      password:        document.getElementById('passwordInput')?.value,
      telefono:        document.getElementById('telefonoInput')?.value?.trim(),
      fechaNacimiento: document.getElementById('fechaNacimientoInput')?.value || undefined,
    };

    if (!datos.nombre || !datos.apellido || !datos.email || !datos.password || !datos.telefono) {
      showToast('Completa todos los campos requeridos', 'warning'); return;
    }

    setLoading(btn, true);
    try {
      const data = await ApiAuth.registro(datos);
      Auth.setToken(data.token);
      Auth.setUser(data.usuario);
      showToast('¡Cuenta creada exitosamente! ✓');
      setTimeout(() => window.location.href = 'dashboard-paciente.html', 1200);
    } catch (err) {
      showToast(err.message || 'Error al registrarse', 'danger');
      setLoading(btn, false, 'Crear Cuenta');
    }
  });
}

// ════════════════════════════════════════════════════════════
// DASHBOARD PACIENTE
// ════════════════════════════════════════════════════════════
async function initDashPaciente() {
  const user = Auth.getUser();
  const nombreEl = document.getElementById('welcomeName');
  if (nombreEl && user) nombreEl.textContent = user.nombre?.split(' ')[0] || 'Paciente';

  try {
    const { citas } = await ApiCitas.listar();
    const hoy = new Date().toISOString().split('T')[0];

    // Próxima cita activa
    const proxima = citas
      .filter(c => c.fecha >= hoy && ['pendiente','confirmada'].includes(c.estado))
      .sort((a,b) => (a.fecha+a.hora).localeCompare(b.fecha+b.hora))[0];

    const proximaEl = document.getElementById('proximaCita');
    if (proximaEl) {
      if (proxima) {
        const medNombre = proxima.medico?.nombre || proxima.medico || '—';
        proximaEl.innerHTML = `
          <div class="cita-item confirmada">
            <div class="cita-date">
              <div class="cita-day">${getDayMonth(proxima.fecha).day}</div>
              <div class="cita-month">${getDayMonth(proxima.fecha).month}</div>
            </div>
            <div class="cita-info">
              <div class="cita-area">${proxima.especialidad}</div>
              <div class="cita-doc"><i class="fas fa-user-md me-1 opacity-50"></i>${medNombre}</div>
              <div class="cita-time"><i class="fas fa-clock me-1 opacity-50"></i>${proxima.hora} hrs</div>
            </div>
            <span class="badge-st st-${proxima.estado}">${proxima.estado}</span>
          </div>`;
      } else {
        proximaEl.innerHTML = `<p class="text-muted text-center py-3">No tienes citas próximas.</p>`;
      }
    }

    // Métricas
    _setMetric('metricTotal',     citas.length);
    _setMetric('metricPendiente', citas.filter(c => c.estado === 'pendiente').length);
    _setMetric('metricAtendida',  citas.filter(c => c.estado === 'atendida').length);

    // Últimas 3 citas en historial rápido
    const histEl = document.getElementById('historialRapido');
    if (histEl) {
      const ultimas = [...citas].sort((a,b) => b.fecha.localeCompare(a.fecha)).slice(0, 3);
      histEl.innerHTML = ultimas.length
        ? ultimas.map(c => _citaItemHTML(c)).join('')
        : '<p class="text-muted text-center py-3">Sin historial.</p>';
    }

  } catch (err) {
    console.error('Dashboard paciente:', err);
    showToast('No se pudo cargar el dashboard', 'warning');
  }
}

function _setMetric(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ════════════════════════════════════════════════════════════
// MIS CITAS (paciente)
// ════════════════════════════════════════════════════════════
let _todasCitas = [];

async function initMisCitas() {
  try {
    const { citas } = await ApiCitas.listar();
    _todasCitas = citas;
    renderCitasPaciente('todas');
  } catch (err) {
    showToast('Error al cargar citas: ' + err.message, 'danger');
  }
}

function filtrarCitas(estado) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  event?.target?.classList.add('active');
  renderCitasPaciente(estado);
}

function renderCitasPaciente(filtro = 'todas') {
  const container = document.getElementById('citasPacienteList');
  if (!container) return;

  const citas = filtro === 'todas'
    ? _todasCitas
    : _todasCitas.filter(c => c.estado === filtro);

  if (!citas.length) {
    container.innerHTML = `<div class="text-center py-5 text-muted">
      <i class="fas fa-calendar-times fa-3x mb-3 d-block"></i>
      <p>No tienes citas en esta categoría.</p></div>`;
    return;
  }

  container.innerHTML = citas
    .sort((a,b) => b.fecha.localeCompare(a.fecha))
    .map(c => _citaItemHTML(c, true))
    .join('');
}

function _citaItemHTML(c, conAcciones = false) {
  const dm      = getDayMonth(c.fecha);
  const citaId  = c._id || c.id;
  const medNom  = c.medico?.nombre || c.medico || '—';
  const activo  = ['pendiente','confirmada'].includes(c.estado);
  const acciones = conAcciones && activo ? `
    <div class="d-flex gap-2 mt-2 mt-md-0 flex-wrap">
      <button class="btn btn-sm btn-outline-primary" style="border-radius:50px;font-size:.78rem;font-weight:600"
        onclick="openMoverModal('${citaId}')">
        <i class="fas fa-calendar-alt me-1"></i>Mover
      </button>
      <button class="btn btn-sm btn-outline-danger" style="border-radius:50px;font-size:.78rem;font-weight:600"
        onclick="cancelarCita('${citaId}')">
        <i class="fas fa-times me-1"></i>Cancelar
      </button>
    </div>` : '';

  return `
    <div class="cita-item ${c.estado}" id="cita-${citaId}">
      <div class="cita-date">
        <div class="cita-day">${dm.day}</div>
        <div class="cita-month">${dm.month}</div>
      </div>
      <div class="cita-info flex-grow-1">
        <div class="cita-area">${c.especialidad}</div>
        <div class="cita-doc"><i class="fas fa-user-md me-1 opacity-50"></i>${medNom}</div>
        <div class="cita-time"><i class="fas fa-clock me-1 opacity-50"></i>${c.hora} hrs</div>
      </div>
      <div class="d-flex flex-column align-items-end gap-2">
        <span class="badge-st st-${c.estado}">${c.estado}</span>
        ${acciones}
      </div>
    </div>`;
}

async function cancelarCita(id) {
  if (!confirm('¿Deseas cancelar esta cita?')) return;
  try {
    await ApiCitas.cancelar(id);
    _todasCitas = _todasCitas.map(c =>
      (c._id||c.id) === id ? {...c, estado:'cancelada'} : c
    );
    renderCitasPaciente(document.querySelector('.filter-tab.active')?.dataset.estado || 'todas');
    showToast('Cita cancelada', 'danger');
  } catch (err) {
    showToast('Error al cancelar: ' + err.message, 'danger');
  }
}

function openMoverModal(id) {
  const modal = document.getElementById('moverCitaModal');
  if (!modal) return;
  modal.dataset.citaId = id;
  // Min-date
  const today = new Date().toISOString().split('T')[0];
  const fechaInput = document.getElementById('nuevaFecha');
  if (fechaInput) fechaInput.min = today;
  new bootstrap.Modal(modal).show();
}

async function confirmarMoverCita() {
  const modal = document.getElementById('moverCitaModal');
  const nuevaFecha = document.getElementById('nuevaFecha')?.value;
  const nuevaHora  = document.getElementById('nuevaHora')?.value;
  const id         = modal?.dataset.citaId;

  if (!nuevaFecha || !nuevaHora) { showToast('Selecciona fecha y hora', 'warning'); return; }

  const btn = document.getElementById('btnConfirmarMover');
  setLoading(btn, true);
  try {
    await ApiCitas.mover(id, nuevaFecha, nuevaHora);
    bootstrap.Modal.getInstance(modal)?.hide();
    showToast('Cita reprogramada exitosamente ✓');
    // Recargar lista
    const { citas } = await ApiCitas.listar();
    _todasCitas = citas;
    renderCitasPaciente(document.querySelector('.filter-tab.active')?.dataset.estado || 'todas');
  } catch (err) {
    showToast('Error al mover cita: ' + err.message, 'danger');
  } finally {
    setLoading(btn, false, 'Confirmar');
  }
}

// ════════════════════════════════════════════════════════════
// WIZARD – AGENDAR CITA
// ════════════════════════════════════════════════════════════
let wz = {
  step:          1,
  especialidad:  null,
  medicoId:      null,
  medicoNombre:  null,
  fecha:         null,
  hora:          null,
  motivo:        '',
};

async function initWizard() {
  const wizard = document.getElementById('citaWizard');
  if (!wizard) return;

  updateWizardUI();

  // Cargar especialidades
  const areasGrid = document.getElementById('areasGrid');
  if (!areasGrid) return;

  areasGrid.innerHTML = '<div class="text-center py-4"><span class="spinner-border text-primary"></span></div>';
  try {
    const data = await ApiMedicos.especialidades();
    const especialidades = data.especialidades || [];

    areasGrid.innerHTML = especialidades.map(esp => `
      <div class="col-6 col-md-4">
        <div class="option-card" onclick="selectEspecialidad('${esp}', this)">
          <i class="fas ${iconoEsp(esp)}"></i>
          <span>${esp}</span>
        </div>
      </div>`).join('');
  } catch (err) {
    areasGrid.innerHTML = `<div class="col-12"><div class="alert alert-danger">
      Error al cargar especialidades: ${err.message}</div></div>`;
  }
}

function selectEspecialidad(nombre, el) {
  document.querySelectorAll('.option-card').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  wz.especialidad = nombre;
  // Reset selección de médico al cambiar especialidad
  wz.medicoId = null;
  wz.medicoNombre = null;
}

let _medicosCache = [];

async function renderMedicosWizard() {
  const grid = document.getElementById('medicosGrid');
  if (!grid) return;

  grid.innerHTML = '<div class="text-center py-3"><span class="spinner-border text-primary"></span></div>';
  try {
    const { medicos } = await ApiMedicos.listar(wz.especialidad);
    _medicosCache = medicos || [];
  } catch (err) {
    _medicosCache = [];
  }

  if (!_medicosCache.length) {
    grid.innerHTML = '<p class="text-muted py-2">No hay médicos disponibles para esta especialidad.</p>';
    return;
  }

  grid.innerHTML = _medicosCache.map(m => {
    const nombreCompleto = `${m.nombre} ${m.apellido || ''}`.trim();
    const iniciales = `${(m.nombre||'?')[0]}${(m.apellido||'?')[0]}`.toUpperCase();
    const nombreEsc = nombreCompleto.replace(/'/g, "\\'");
    return `
    <div class="doctor-opt" onclick="selectMedico('${m._id}','${nombreEsc}', this)">
      <div class="doc-av">${iniciales}</div>
      <div>
        <div style="font-weight:600;font-size:.9rem;color:var(--primary-dark)">Dr(a). ${nombreCompleto}</div>
        <div style="font-size:.78rem;color:var(--medium-text)">${m.especialidad || wz.especialidad}</div>
      </div>
    </div>`;
  }).join('');
}

function selectMedico(id, nombre, el) {
  document.querySelectorAll('.doctor-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  wz.medicoId     = id;
  wz.medicoNombre = nombre;
}

async function cargarDisponibilidad() {
  const fecha = document.getElementById('fechaCita')?.value;
  if (!fecha || !wz.medicoId) return;

  const grid = document.getElementById('horariosGrid');
  if (!grid) return;
  grid.innerHTML = '<span class="spinner-border spinner-border-sm text-primary"></span> Cargando…';

  try {
    const data = await ApiCitas.disponibilidad(wz.medicoId, fecha);
    const horas = data.horasDisponibles || [];

    if (!horas.length) {
      grid.innerHTML = '<p class="text-muted mt-2">Sin horarios disponibles para esta fecha.</p>';
      return;
    }
    grid.innerHTML = horas.map(h => `
      <span class="slot" onclick="selectHora('${h}', this)">${h}</span>`).join('');
  } catch (err) {
    grid.innerHTML = `<p class="text-danger mt-2">Error: ${err.message}</p>`;
  }
}

function selectHora(hora, el) {
  document.querySelectorAll('.slot').forEach(e => e.classList.remove('sel'));
  el.classList.add('sel');
  wz.hora = hora;
}

async function goStep(step) {
  if (step === 2 && !wz.especialidad) { showToast('Selecciona una especialidad', 'warning'); return; }
  if (step === 3) {
    if (!wz.medicoId) { showToast('Selecciona un médico', 'warning'); return; }
  }
  if (step === 4) {
    const fechaEl = document.getElementById('fechaCita');
    wz.fecha  = fechaEl?.value;
    wz.motivo = document.getElementById('motivoCita')?.value || '';
    if (!wz.fecha) { showToast('Selecciona una fecha', 'warning'); return; }
    if (!wz.hora)  { showToast('Selecciona una hora disponible', 'warning'); return; }
    renderResumen();
  }
  wz.step = step;
  updateWizardUI();
  if (step === 2) await renderMedicosWizard();
}

function updateWizardUI() {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  const active = document.getElementById(`step${wz.step}`);
  if (active) active.classList.add('active');

  document.querySelectorAll('.wz-step').forEach((el, i) => {
    const s = i + 1;
    el.classList.remove('active','complete');
    if (s === wz.step) el.classList.add('active');
    if (s <  wz.step) el.classList.add('complete');
    const circle = el.querySelector('.wz-circle');
    if (circle) circle.innerHTML = s < wz.step ? '<i class="fas fa-check"></i>' : s;
  });

  document.querySelectorAll('.wz-line').forEach((el, i) => {
    el.classList.toggle('done', i + 1 < wz.step);
  });
}

function renderResumen() {
  const el = document.getElementById('resumenCita');
  if (!el) return;
  el.innerHTML = `
    <div class="alert-blue p-3 rounded-3">
      <div class="row g-3">
        <div class="col-6"><strong>Especialidad:</strong><br>${wz.especialidad}</div>
        <div class="col-6"><strong>Médico:</strong><br>${wz.medicoNombre}</div>
        <div class="col-6"><strong>Fecha:</strong><br>${formatDate(wz.fecha)}</div>
        <div class="col-6"><strong>Hora:</strong><br>${wz.hora} hrs</div>
        ${wz.motivo ? `<div class="col-12"><strong>Motivo:</strong><br>${wz.motivo}</div>` : ''}
      </div>
    </div>`;
}

async function confirmarCita() {
  const btn = document.getElementById('btnConfirmarCita');
  setLoading(btn, true);
  try {
    await ApiCitas.agendar({
      medico:      wz.medicoId,
      especialidad: wz.especialidad,
      fecha:        wz.fecha,
      hora:         wz.hora,
      motivo:       wz.motivo,
    });
    showToast('¡Cita agendada exitosamente! ✓');
    setTimeout(() => window.location.href = 'mis-citas.html', 1500);
  } catch (err) {
    showToast('Error al agendar: ' + err.message, 'danger');
    setLoading(btn, false, 'Confirmar Cita');
  }
}

// ════════════════════════════════════════════════════════════
// DASHBOARD MÉDICO
// ════════════════════════════════════════════════════════════
async function initDashMedico() {
  const user = Auth.getUser();
  const nombreEl = document.getElementById('welcomeName');
  if (nombreEl && user) nombreEl.textContent = user.nombre?.split(' ')[0] || 'Doctor';

  try {
    const { citas } = await ApiCitas.listar();
    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = citas.filter(c => c.fecha === hoy);

    _setMetric('metricHoy',       citasHoy.length);
    _setMetric('metricPendiente', citas.filter(c => c.estado === 'pendiente').length);
    _setMetric('metricAtendida',  citas.filter(c => c.estado === 'atendida').length);
    _setMetric('metricTotal',     citas.length);

    const hoyEl = document.getElementById('citasHoyList');
    if (hoyEl) {
      hoyEl.innerHTML = citasHoy.length
        ? citasHoy.sort((a,b)=>a.hora.localeCompare(b.hora)).map(c => `
            <div class="d-flex align-items-center gap-3 py-2 border-bottom">
              <div style="min-width:52px;text-align:center">
                <div style="font-weight:700;color:var(--primary)">${c.hora}</div>
              </div>
              <div class="flex-grow-1">
                <div style="font-weight:600;font-size:.9rem;color:var(--primary-dark)">
                  ${c.paciente?.nombre || c.paciente || 'Paciente'}
                </div>
                <div style="font-size:.8rem;color:var(--medium-text)">${c.especialidad}</div>
              </div>
              <span class="badge-st st-${c.estado}">${c.estado}</span>
            </div>`).join('')
        : '<p class="text-muted text-center py-3">Sin citas hoy.</p>';
    }

  } catch (err) {
    showToast('Error al cargar dashboard: ' + err.message, 'warning');
  }
}

// ════════════════════════════════════════════════════════════
// AGENDA MÉDICO
// ════════════════════════════════════════════════════════════
let _citasMedico = [];

async function initAgendaMedico() {
  try {
    const { citas } = await ApiCitas.listar();
    _citasMedico = citas;
    renderAgendaMedico();
  } catch (err) {
    showToast('Error al cargar agenda: ' + err.message, 'danger');
  }
}

function renderAgendaMedico(filtroFecha = '') {
  const container = document.getElementById('agendaMedicoList');
  if (!container) return;

  let citas = _citasMedico;
  if (filtroFecha) citas = citas.filter(c => c.fecha === filtroFecha);

  if (!citas.length) {
    container.innerHTML = `<div class="text-center py-5 text-muted">
      <i class="fas fa-calendar-times fa-3x mb-3 d-block"></i>
      <p>No hay citas para mostrar.</p></div>`;
    return;
  }

  container.innerHTML = citas
    .sort((a,b) => (a.fecha+a.hora).localeCompare(b.fecha+b.hora))
    .map(c => {
      const dm     = getDayMonth(c.fecha);
      const citaId = c._id || c.id;
      const pacNom = c.paciente?.nombre || c.paciente || 'Paciente';
      return `
        <div class="cita-item ${c.estado}" id="cita-${citaId}">
          <div class="cita-date">
            <div class="cita-day">${dm.day}</div>
            <div class="cita-month">${dm.month}</div>
          </div>
          <div class="cita-info flex-grow-1">
            <div class="cita-area">${pacNom}</div>
            <div class="cita-doc"><i class="fas fa-procedures me-1 opacity-50"></i>${c.especialidad}</div>
            <div class="cita-time"><i class="fas fa-clock me-1 opacity-50"></i>${c.hora} hrs</div>
            ${c.motivo ? `<div style="font-size:.78rem;color:var(--medium-text);margin-top:2px">
              <i class="fas fa-comment me-1 opacity-50"></i>${c.motivo}</div>` : ''}
          </div>
          <div class="d-flex flex-column align-items-end gap-2">
            <span class="badge-st st-${c.estado}">${c.estado}</span>
            ${c.estado !== 'atendida' && c.estado !== 'cancelada' ? `
            <button class="btn btn-sm btn-success" style="border-radius:50px;font-size:.78rem;font-weight:600"
              onclick="marcarAtendida('${citaId}')">
              <i class="fas fa-check me-1"></i>Atendida
            </button>` : ''}
          </div>
        </div>`;
    }).join('');
}

async function marcarAtendida(id) {
  try {
    await ApiCitas.cambiarEstado(id, 'atendida');
    _citasMedico = _citasMedico.map(c =>
      (c._id||c.id) === id ? {...c, estado:'atendida'} : c
    );
    renderAgendaMedico();
    showToast('Cita marcada como atendida ✓');
  } catch (err) {
    showToast('Error: ' + err.message, 'danger');
  }
}
