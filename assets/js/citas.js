/* ============================================================
   EjeSalud – citas.js
   Maneja mis-citas.html (lista, cancelar, mover)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const pagina = window.location.pathname.split('/').pop();
  if (pagina === 'mis-citas.html') initMisCitas();
});

// ── Formatear fecha legible ───────────────────────────────────
function formatFechaLarga(fechaISO) {
  return new Date(fechaISO).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Ícono por especialidad ────────────────────────────────────
function iconoEsp(esp) {
  const map = {
    'Médico General':   'fa-stethoscope',
    'Medicina Interna': 'fa-heartbeat',
    'Psicología':       'fa-brain',
    'Podología':        'fa-shoe-prints',
    'Radiología':       'fa-x-ray',
  };
  return map[esp] || 'fa-user-md';
}

// ── Badge de estado ───────────────────────────────────────────
function badgeEstado(estado) {
  return `<span class="badge-estado badge-${estado}">${estado}</span>`;
}

// ════════════════════════════════════════════════════════════
// MIS CITAS
// ════════════════════════════════════════════════════════════
let _todasCitas  = [];
let _citaCancelId = null;
let _citaMoverId  = null;

async function initMisCitas() {
  if (!requireAuth()) return;

  const modalCancelar = new bootstrap.Modal(document.getElementById('modalCancelar'));

  // ── Cargar citas ──────────────────────────────────────────
  async function cargarCitas() {
    try {
      const data = await CitasAPI.listar();
      _todasCitas = data.citas || [];

      document.getElementById('skeletons')?.style && (document.getElementById('skeletons').style.display = 'none');
      document.getElementById('filtros')     && (document.getElementById('filtros').style.display     = 'flex');
      document.getElementById('btn-nueva-cita') && (document.getElementById('btn-nueva-cita').style.display = 'block');

      // Admin: cambiar título
      if (Auth.isAdmin()) {
        const t = document.getElementById('titulo-pagina');
        const s = document.getElementById('subtitulo-pagina');
        if (t) t.textContent = 'Todas las Citas';
        if (s) s.textContent = `${data.total} cita(s) en el sistema`;
      }

      actualizarStats(_todasCitas);
      renderCitas(_todasCitas);
    } catch (err) {
      const c = document.getElementById('citas-container');
      if (c) c.innerHTML = `<div class="empty-state">
        <i class="fas fa-exclamation-circle" style="color:#e74c3c;"></i>
        <h5>Error al cargar las citas</h5><p>${err.message}</p></div>`;
    }
  }

  // ── Estadísticas ──────────────────────────────────────────
  function actualizarStats(citas) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-total',      citas.length);
    set('stat-pendientes', citas.filter(c => c.estado === 'pendiente').length);
    set('stat-confirmadas',citas.filter(c => c.estado === 'confirmada').length);
    set('stat-completadas',citas.filter(c => c.estado === 'completada').length);
    const bar = document.getElementById('stats-bar');
    if (bar && citas.length > 0) bar.style.cssText = 'display:flex!important;';
  }

  // ── Render tarjetas ───────────────────────────────────────
  function renderCitas(citas) {
    const container = document.getElementById('citas-container');
    if (!container) return;

    if (!citas.length) {
      container.innerHTML = `<div class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <h5>No hay citas para mostrar</h5>
        <p>No tienes citas en esta categoría.</p></div>`;
      return;
    }

    container.innerHTML = citas.map(cita => {
      const puedeCancelar = ['pendiente', 'confirmada'].includes(cita.estado);
      const puedeMover    = puedeCancelar;
      const medico = cita.medico
        ? `Dr. ${cita.medico.nombre} ${cita.medico.apellido || ''}`.trim()
        : 'Médico asignado';

      return `
      <div class="cita-card ${cita.estado}" data-aos="fade-up">
        <div class="cita-header">
          <div class="cita-especialidad">
            <i class="fas ${iconoEsp(cita.especialidad)} me-2" style="color:#c58aa0;"></i>
            ${cita.especialidad}
          </div>
          ${badgeEstado(cita.estado)}
        </div>
        <div class="cita-info">
          <div class="cita-info-item"><i class="fas fa-calendar-alt"></i><span>${formatFechaLarga(cita.fecha)}</span></div>
          <div class="cita-info-item"><i class="fas fa-clock"></i><span>${cita.hora} hrs</span></div>
          <div class="cita-info-item"><i class="fas fa-user-md"></i><span>${medico}</span></div>
        </div>
        ${cita.motivo ? `<div class="cita-motivo"><span>Motivo:</span> ${cita.motivo}</div>` : ''}
        <div class="d-flex gap-2 flex-wrap mt-2">
          ${puedeMover ? `
          <button class="btn-cancelar" style="border-color:#a36a7b;color:#a36a7b;"
            onclick="abrirModalMover('${cita._id}','${cita.especialidad}','${cita.hora}')">
            <i class="fas fa-calendar-alt me-1"></i>Mover
          </button>` : ''}
          ${puedeCancelar ? `
          <button class="btn-cancelar"
            onclick="abrirModalCancelar('${cita._id}','${cita.especialidad}','${cita.hora}')">
            <i class="fas fa-times me-1"></i>Cancelar
          </button>` : ''}
        </div>
      </div>`;
    }).join('');

    if (typeof AOS !== 'undefined') AOS.refresh();
  }

  // ── Filtros ───────────────────────────────────────────────
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filtro = this.dataset.filtro;
      renderCitas(filtro === 'todas' ? _todasCitas : _todasCitas.filter(c => c.estado === filtro));
    });
  });

  // ── Modal CANCELAR ────────────────────────────────────────
  window.abrirModalCancelar = (id, especialidad, hora) => {
    _citaCancelId = id;
    const det = document.getElementById('modal-detalle-cita');
    if (det) det.textContent = `${especialidad} — ${hora} hrs`;
    modalCancelar.show();
  };

  document.getElementById('btn-confirmar-cancelar')?.addEventListener('click', async () => {
    if (!_citaCancelId) return;
    const btnText = document.getElementById('cancelar-btn-text');
    const spinner = document.getElementById('cancelar-spinner');
    const btn     = document.getElementById('btn-confirmar-cancelar');
    if (btnText) btnText.style.display = 'none';
    if (spinner) spinner.style.display = 'inline';
    if (btn)     btn.disabled = true;

    try {
      await CitasAPI.cancelar(_citaCancelId);
      modalCancelar.hide();
      await cargarCitas();
    } catch (err) {
      alert('Error al cancelar: ' + err.message);
    } finally {
      if (btnText) btnText.style.display = 'inline';
      if (spinner) spinner.style.display = 'none';
      if (btn)     btn.disabled = false;
      _citaCancelId = null;
    }
  });

  // ── Modal MOVER ───────────────────────────────────────────
  const modalMoverEl = document.getElementById('modalMover');
  const modalMover   = modalMoverEl ? new bootstrap.Modal(modalMoverEl) : null;

  window.abrirModalMover = (id, especialidad, hora) => {
    _citaMoverId = id;
    const det = document.getElementById('modal-mover-detalle');
    if (det) det.textContent = `${especialidad} — ${hora} hrs`;
    const today = new Date().toISOString().split('T')[0];
    const fi = document.getElementById('mover-fecha');
    if (fi) { fi.min = today; fi.value = ''; }
    const hi = document.getElementById('mover-hora');
    if (hi) hi.value = '';
    if (modalMover) modalMover.show();
  };

  document.getElementById('btn-confirmar-mover')?.addEventListener('click', async () => {
    const nuevaFecha = document.getElementById('mover-fecha')?.value;
    const nuevaHora  = document.getElementById('mover-hora')?.value;
    if (!nuevaFecha || !nuevaHora) { alert('Selecciona fecha y hora.'); return; }

    const btn = document.getElementById('btn-confirmar-mover');
    if (btn) { btn.disabled = true; btn.textContent = 'Moviendo…'; }
    try {
      await CitasAPI.mover(_citaMoverId, nuevaFecha, nuevaHora);
      if (modalMover) modalMover.hide();
      await cargarCitas();
    } catch (err) {
      alert('Error al mover: ' + err.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Confirmar'; }
      _citaMoverId = null;
    }
  });

  // ── Inicio ────────────────────────────────────────────────
  cargarCitas();
});
