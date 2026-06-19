// vencimientos.js — Motor de vencimientos fiscales ARCA 2026
// Stack: Vite + Vanilla JS, string concatenation (sin template literals anidados)
// Integra con: Supabase (historial de alertas), Resend (emails), nav existente

// ─── Calendario ARCA 2026 ─────────────────────────────────────────────────────
// Fuente: ARCA RG 5616/2024 y calendario oficial 2026
// Formato: { id, nombre, tipo, dia, meses, descripcion, url }

var VENCIMIENTOS_2026 = [

  // IVA — vence el día 20 según terminación CUIT (ajustado por feriados)
  { id: 'iva-01', nombre: 'IVA Enero 2026',    tipo: 'iva',       fecha: '2026-02-20', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-02', nombre: 'IVA Febrero 2026',  tipo: 'iva',       fecha: '2026-03-20', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-03', nombre: 'IVA Marzo 2026',    tipo: 'iva',       fecha: '2026-04-21', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-04', nombre: 'IVA Abril 2026',    tipo: 'iva',       fecha: '2026-05-20', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-05', nombre: 'IVA Mayo 2026',     tipo: 'iva',       fecha: '2026-06-22', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-06', nombre: 'IVA Junio 2026',    tipo: 'iva',       fecha: '2026-07-20', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-07', nombre: 'IVA Julio 2026',    tipo: 'iva',       fecha: '2026-08-20', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-08', nombre: 'IVA Agosto 2026',   tipo: 'iva',       fecha: '2026-09-21', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-09', nombre: 'IVA Septiembre 2026', tipo: 'iva',     fecha: '2026-10-20', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-10', nombre: 'IVA Octubre 2026',  tipo: 'iva',       fecha: '2026-11-20', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },
  { id: 'iva-11', nombre: 'IVA Noviembre 2026', tipo: 'iva',      fecha: '2026-12-21', cuit_term: 'todos', descripcion: 'Presentación y pago Declaración Jurada IVA mensual', url: 'https://www.arca.gob.ar' },

  // F931 / Sueldos — vence el 10 de cada mes (SICOSS)
  { id: 'f931-01', nombre: 'F931 Enero 2026',   tipo: 'f931',     fecha: '2026-02-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-02', nombre: 'F931 Febrero 2026', tipo: 'f931',     fecha: '2026-03-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-03', nombre: 'F931 Marzo 2026',   tipo: 'f931',     fecha: '2026-04-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-04', nombre: 'F931 Abril 2026',   tipo: 'f931',     fecha: '2026-05-12', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-05', nombre: 'F931 Mayo 2026',    tipo: 'f931',     fecha: '2026-06-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-06', nombre: 'F931 Junio 2026',   tipo: 'f931',     fecha: '2026-07-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-07', nombre: 'F931 Julio 2026',   tipo: 'f931',     fecha: '2026-08-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-08', nombre: 'F931 Agosto 2026',  tipo: 'f931',     fecha: '2026-09-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-09', nombre: 'F931 Septiembre 2026', tipo: 'f931',  fecha: '2026-10-12', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-10', nombre: 'F931 Octubre 2026', tipo: 'f931',     fecha: '2026-11-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },
  { id: 'f931-11', nombre: 'F931 Noviembre 2026', tipo: 'f931',   fecha: '2026-12-10', cuit_term: 'todos', descripcion: 'Presentación F931 y pago cargas sociales', url: 'https://www.arca.gob.ar' },

  // Ganancias — anticipos bimestrales RI, pago en cuotas
  { id: 'gan-ant1', nombre: 'Ganancias Anticipo 1/5',  tipo: 'ganancias', fecha: '2026-03-20', cuit_term: 'todos', descripcion: 'Anticipo 1° cuota impuesto a las Ganancias 2026 (RI)', url: 'https://www.arca.gob.ar' },
  { id: 'gan-ant2', nombre: 'Ganancias Anticipo 2/5',  tipo: 'ganancias', fecha: '2026-05-20', cuit_term: 'todos', descripcion: 'Anticipo 2° cuota impuesto a las Ganancias 2026 (RI)', url: 'https://www.arca.gob.ar' },
  { id: 'gan-ant3', nombre: 'Ganancias Anticipo 3/5',  tipo: 'ganancias', fecha: '2026-07-20', cuit_term: 'todos', descripcion: 'Anticipo 3° cuota impuesto a las Ganancias 2026 (RI)', url: 'https://www.arca.gob.ar' },
  { id: 'gan-ant4', nombre: 'Ganancias Anticipo 4/5',  tipo: 'ganancias', fecha: '2026-09-21', cuit_term: 'todos', descripcion: 'Anticipo 4° cuota impuesto a las Ganancias 2026 (RI)', url: 'https://www.arca.gob.ar' },
  { id: 'gan-ant5', nombre: 'Ganancias Anticipo 5/5',  tipo: 'ganancias', fecha: '2026-11-20', cuit_term: 'todos', descripcion: 'Anticipo 5° cuota impuesto a las Ganancias 2026 (RI)', url: 'https://www.arca.gob.ar' },
  { id: 'gan-dj',   nombre: 'Ganancias DJ Anual 2025', tipo: 'ganancias', fecha: '2026-06-22', cuit_term: 'todos', descripcion: 'Declaración Jurada anual Ganancias período 2025', url: 'https://www.arca.gob.ar' },

  // Monotributo — recategorización y cuota mensual
  { id: 'mono-recateg-1', nombre: 'Recategorización Monotributo', tipo: 'monotributo', fecha: '2026-01-20', cuit_term: 'todos', descripcion: 'Recategorización cuatrimestral (enero): revisá tu categoría actual', url: 'https://www.arca.gob.ar' },
  { id: 'mono-recateg-2', nombre: 'Recategorización Monotributo', tipo: 'monotributo', fecha: '2026-05-20', cuit_term: 'todos', descripcion: 'Recategorización cuatrimestral (mayo)', url: 'https://www.arca.gob.ar' },
  { id: 'mono-recateg-3', nombre: 'Recategorización Monotributo', tipo: 'monotributo', fecha: '2026-09-21', cuit_term: 'todos', descripcion: 'Recategorización cuatrimestral (septiembre)', url: 'https://www.arca.gob.ar' },

  // SICORE — retenciones, vence con IVA (~día 18-22 según CUIT)
  { id: 'sicore-q1', nombre: 'SICORE 1° quincena Enero',  tipo: 'sicore', fecha: '2026-01-26', cuit_term: 'todos', descripcion: 'Ingreso retenciones/percepciones 1° quincena enero', url: 'https://www.arca.gob.ar' },
  { id: 'sicore-q2', nombre: 'SICORE 2° quincena Enero',  tipo: 'sicore', fecha: '2026-02-10', cuit_term: 'todos', descripcion: 'Ingreso retenciones/percepciones 2° quincena enero', url: 'https://www.arca.gob.ar' },
  { id: 'sicore-q3', nombre: 'SICORE 1° quincena Febrero', tipo: 'sicore', fecha: '2026-02-23', cuit_term: 'todos', descripcion: 'Ingreso retenciones/percepciones 1° quincena febrero', url: 'https://www.arca.gob.ar' },
  { id: 'sicore-q4', nombre: 'SICORE 2° quincena Febrero', tipo: 'sicore', fecha: '2026-03-10', cuit_term: 'todos', descripcion: 'Ingreso retenciones/percepciones 2° quincena febrero', url: 'https://www.arca.gob.ar' },
  { id: 'sicore-q5', nombre: 'SICORE 1° quincena Marzo',   tipo: 'sicore', fecha: '2026-03-23', cuit_term: 'todos', descripcion: 'Ingreso retenciones/percepciones 1° quincena marzo', url: 'https://www.arca.gob.ar' },
  { id: 'sicore-q6', nombre: 'SICORE 2° quincena Marzo',   tipo: 'sicore', fecha: '2026-04-10', cuit_term: 'todos', descripcion: 'Ingreso retenciones/percepciones 2° quincena marzo', url: 'https://www.arca.gob.ar' },

  // Bienes Personales
  { id: 'bp-2025', nombre: 'Bienes Personales DJ 2025', tipo: 'bienes_personales', fecha: '2026-06-22', cuit_term: 'todos', descripcion: 'Declaración Jurada Bienes Personales período fiscal 2025', url: 'https://www.arca.gob.ar' },
  { id: 'bp-ant1', nombre: 'Bienes Personales Anticipo 1', tipo: 'bienes_personales', fecha: '2026-07-20', cuit_term: 'todos', descripcion: 'Anticipo impuesto Bienes Personales 2026', url: 'https://www.arca.gob.ar' },
];

// ─── Colores por tipo ─────────────────────────────────────────────────────────
var TIPO_CONFIG = {
  iva:             { label: 'IVA',             color: '#185FA5', bg: '#E6F1FB' },
  f931:            { label: 'F931 / Sueldos',  color: '#0F6E56', bg: '#E1F5EE' },
  ganancias:       { label: 'Ganancias',       color: '#854F0B', bg: '#FAEEDA' },
  monotributo:     { label: 'Monotributo',     color: '#534AB7', bg: '#EEEDFE' },
  sicore:          { label: 'SICORE',          color: '#993C1D', bg: '#FAECE7' },
  bienes_personales: { label: 'Bienes Pers.', color: '#444441', bg: '#F1EFE8' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function diasRestantes(fechaStr) {
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  var venc = new Date(fechaStr + 'T00:00:00');
  return Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
}

function formatFecha(fechaStr) {
  var d = new Date(fechaStr + 'T00:00:00');
  var dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return dias[d.getDay()] + ' ' + d.getDate() + ' ' + meses[d.getMonth()];
}

function urgencyClass(dias) {
  if (dias < 0)  return 'venc-vencido';
  if (dias <= 3)  return 'venc-critico';
  if (dias <= 10) return 'venc-urgente';
  if (dias <= 30) return 'venc-proximo';
  return 'venc-ok';
}

function urgencyLabel(dias) {
  if (dias < 0)   return '⚠ Vencido hace ' + Math.abs(dias) + ' días';
  if (dias === 0) return '⚠ Vence HOY';
  if (dias === 1) return '⚡ Vence mañana';
  if (dias <= 3)  return '⚡ ' + dias + ' días';
  if (dias <= 10) return '· ' + dias + ' días';
  return '· ' + dias + ' días';
}

// ─── Render principal ─────────────────────────────────────────────────────────
export function renderVencimientos() {
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Filtrar: mostrar los próximos 90 días + vencidos sin cumplir (hasta 30 días atrás)
  var visibles = VENCIMIENTOS_2026.filter(function(v) {
    var d = diasRestantes(v.fecha);
    return d >= -30 && d <= 90;
  }).sort(function(a, b) {
    return new Date(a.fecha) - new Date(b.fecha);
  });

  // Agrupar por urgencia para el resumen
  var criticos  = visibles.filter(function(v) { return diasRestantes(v.fecha) <= 3 && diasRestantes(v.fecha) >= 0; });
  var urgentes  = visibles.filter(function(v) { var d = diasRestantes(v.fecha); return d > 3 && d <= 10; });
  var proximos  = visibles.filter(function(v) { var d = diasRestantes(v.fecha); return d > 10 && d <= 30; });
  var vencidos  = visibles.filter(function(v) { return diasRestantes(v.fecha) < 0; });

  var html = '<div class="venc-container">';

  // — Resumen KPIs —
  html += '<div class="venc-kpis">';
  html += _kpi(vencidos.length,  'Vencidos',       'venc-kpi-rojo',    '⚠');
  html += _kpi(criticos.length,  'Críticos (≤3d)',  'venc-kpi-naranja', '⚡');
  html += _kpi(urgentes.length,  'Próximos (≤10d)', 'venc-kpi-amarillo','·');
  html += _kpi(proximos.length,  'Este mes',        'venc-kpi-verde',   '·');
  html += '</div>';

  // — Alerta banner si hay críticos/vencidos —
  if (vencidos.length > 0 || criticos.length > 0) {
    html += '<div class="venc-banner venc-banner-critico">';
    html += '<span>⚠</span>';
    html += '<span>' + (vencidos.length + criticos.length) + ' obligación/es requieren atención inmediata</span>';
    html += '<button onclick="enviarAlertaEmail()" class="venc-btn-alerta">Enviar alerta por email</button>';
    html += '</div>';
  }

  // — Filtros —
  html += '<div class="venc-filtros">';
  html += '<button class="venc-filtro active" data-tipo="todos" onclick="filtrarVenc(this)">Todos</button>';
  Object.keys(TIPO_CONFIG).forEach(function(tipo) {
    html += '<button class="venc-filtro" data-tipo="' + tipo + '" onclick="filtrarVenc(this)" style="color:' + TIPO_CONFIG[tipo].color + ';border-color:' + TIPO_CONFIG[tipo].color + '20">' + TIPO_CONFIG[tipo].label + '</button>';
  });
  html += '</div>';

  // — Lista de vencimientos —
  html += '<div class="venc-lista" id="venc-lista">';

  if (visibles.length === 0) {
    html += '<div class="venc-empty">No hay vencimientos en los próximos 90 días.</div>';
  }

  visibles.forEach(function(v) {
    var dias = diasRestantes(v.fecha);
    var cfg = TIPO_CONFIG[v.tipo] || { label: v.tipo, color: '#888', bg: '#f5f5f5' };
    var cls = urgencyClass(dias);

    html += '<div class="venc-item ' + cls + '" data-tipo="' + v.tipo + '">';
    html += '  <div class="venc-item-fecha">';
    html += '    <span class="venc-fecha-txt">' + formatFecha(v.fecha) + '</span>';
    html += '    <span class="venc-dias ' + cls + '-text">' + urgencyLabel(dias) + '</span>';
    html += '  </div>';
    html += '  <div class="venc-item-body">';
    html += '    <div class="venc-item-top">';
    html += '      <span class="venc-badge" style="background:' + cfg.bg + ';color:' + cfg.color + '">' + cfg.label + '</span>';
    html += '      <span class="venc-nombre">' + v.nombre + '</span>';
    html += '    </div>';
    html += '    <p class="venc-desc">' + v.descripcion + '</p>';
    html += '  </div>';
    html += '  <div class="venc-item-actions">';
    html += '    <button class="venc-btn-check" onclick="marcarCumplido(\'' + v.id + '\', this)" title="Marcar como cumplido">✓</button>';
    html += '    <a href="' + v.url + '" target="_blank" class="venc-btn-link" title="Ir a ARCA">↗</a>';
    html += '  </div>';
    html += '</div>';
  });

  html += '</div>'; // venc-lista
  html += '</div>'; // venc-container

  return html;
}

function _kpi(num, label, cls, icon) {
  return '<div class="venc-kpi ' + cls + '"><div class="venc-kpi-num">' + num + '</div><div class="venc-kpi-label">' + label + '</div></div>';
}

// ─── Acciones globales (window) ───────────────────────────────────────────────
window.filtrarVenc = function(btn) {
  var tipo = btn.dataset.tipo;
  document.querySelectorAll('.venc-filtro').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.venc-item').forEach(function(item) {
    if (tipo === 'todos' || item.dataset.tipo === tipo) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
};

window.marcarCumplido = function(id, btn) {
  var item = btn.closest('.venc-item');
  item.classList.add('venc-cumplido');
  btn.textContent = '✓';
  btn.disabled = true;
  // Persistir en localStorage
  var cumplidos = JSON.parse(localStorage.getItem('venc_cumplidos') || '[]');
  if (!cumplidos.includes(id)) { cumplidos.push(id); }
  localStorage.setItem('venc_cumplidos', JSON.stringify(cumplidos));
};

window.enviarAlertaEmail = function() {
  // Llama a /api/vencimientos-alerta — ver vencimientos-api.js
  fetch('/api/vencimientos-alerta', { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      alert('Alerta enviada a ' + (data.email || 'tu email registrado'));
    })
    .catch(function() {
      alert('Error al enviar la alerta. Verificá la conexión.');
    });
};

// Restaurar cumplidos al cargar
export function restaurarCumplidos() {
  var cumplidos = JSON.parse(localStorage.getItem('venc_cumplidos') || '[]');
  cumplidos.forEach(function(id) {
    var items = document.querySelectorAll('.venc-item');
    items.forEach(function(item) {
      var btn = item.querySelector('.venc-btn-check');
      if (btn && btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(id)) {
        item.classList.add('venc-cumplido');
        btn.textContent = '✓';
        btn.disabled = true;
      }
    });
  });
}
