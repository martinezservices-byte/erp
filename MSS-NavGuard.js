/**
 * MSS-NavGuard.js v2.1 — Control universal de navegación
 * ========================================================
 * - Superadmin (Gaudy): ve TODO, sin restricciones
 * - Clientes externos: nav superior eliminado completamente
 *   Solo navegan desde sus tarjetas en el Hub
 * - NUEVO v2.1: Detecta ejecución dentro de iframe y oculta
 *   el topbar/nav propio del módulo para vista limpia en Hub
 * - Módulos internos: bloquean carga de datos si es cliente externo
 */

(function(){
  const ADMIN_EMAIL = 'aybserviciosg@gmail.com';

  // ── Detectar si corre dentro de un iframe ──
  const dentroDeIframe = (window !== window.top);

  // ── Detectar rol ──
  const esClienteExt = localStorage.getItem('mss_es_cliente_externo') === 'true';
  const sesionRaw    = sessionStorage.getItem('mss_user') || localStorage.getItem('mss_user');
  let emailSesion    = '';
  try{ emailSesion = JSON.parse(sesionRaw||'{}').email || ''; }catch(e){}
  const esAdmin = emailSesion.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // ── MODO IFRAME: ocultar nav/topbar del módulo sin importar rol ──
  // Cuando un módulo corre dentro del Hub (iframe), su propio header
  // no debe mostrarse para no duplicar cabeceras ni colisionar con el topbar del Hub.
  if(dentroDeIframe){
    function ocultarHeaderEnIframe(){
      // IDs comunes de topbar/nav en todos los módulos MSS
      const selectores = [
        '#nav-bar', '#topbar', '#header', '#nav-interno',
        '.topbar', '.nav-bar', '.header-global',
        '[id^="nav"]', '.mss-header'
      ];
      selectores.forEach(sel=>{
        document.querySelectorAll(sel).forEach(el=>{
          // Solo ocultar si es el topbar principal (primer nivel del body),
          // no ocultar navs internos de pestañas dentro de un módulo
          if(el.parentElement === document.body || el.closest('header') === el){
            el.style.display = 'none';
          }
        });
      });
      // Quitar padding-top que los módulos aplican para compensar el topbar fijo
      const main = document.getElementById('content') ||
                   document.querySelector('.main-content') ||
                   document.querySelector('main') ||
                   document.querySelector('.app-body');
      if(main){
        main.style.paddingTop = '0';
        main.style.marginTop  = '0';
      }
      // body sin padding-top extra
      document.body.style.paddingTop = '0';
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', ocultarHeaderEnIframe);
    } else {
      ocultarHeaderEnIframe();
    }
    // Reintento a los 500ms por si el módulo inyecta el nav vía JS
    setTimeout(ocultarHeaderEnIframe, 500);

    // Si es iframe Y cliente externo → también quitar botón "← Mi Panel"
    // (el Hub ya provee navegación, no necesitamos botón flotante duplicado)
    if(esClienteExt){
      console.log('🔒 MSS-NavGuard v2.1 — modo iframe + cliente externo');
      return; // no agregar botón hub dentro del iframe
    }
    console.log('🔒 MSS-NavGuard v2.1 — modo iframe');
    return; // En iframe: solo ocultar header, nada más
  }

  // ── MODO NORMAL (no iframe) ──

  // Si es superadmin → no aplicar nada
  if(esAdmin || !esClienteExt) return;

  // ── ELIMINAR NAV SUPERIOR COMPLETAMENTE ──
  function eliminarNav(){
    const nav = document.getElementById('nav-bar');
    if(nav){ nav.style.display = 'none'; }
    const ni = document.getElementById('nav-interno');
    if(ni) ni.style.display = 'none';
  }

  // ── BLOQUEAR ACCESO A DATOS DE GAUDY EN MÓDULOS ──
  window.mssGuardData = function(){
    if(!esClienteExt || esAdmin) return true;

    const modulos = JSON.parse(localStorage.getItem('mss_modulos_permitidos')||'[]');
    const paginaActual = window.location.pathname.split('/').pop().replace('.html','').replace('MSS-','').toLowerCase();

    const MAPA = {
      'finanzas':'finanzas','arriendos':'arriendos','contabilidad':'contabilidad',
      'facturacion':'facturacion','tesoreria':'tesoreria','contratos':'contratos',
      'cotizacion':'cotizacion','proyectos':'proyectos','ventas-crm':'ventas',
      'rrhh':'rrhh','estrategia':'estrategia','auditoria':'auditoria',
      'inventario':'inventario','compras':'compras','catalogo':'catalogo',
      'remuneraciones':'remuneraciones','logos':'logos','respaldo':'respaldo'
    };

    const modId = MAPA[paginaActual];
    const tieneAcceso = !modId || modulos.includes(modId);

    if(!tieneAcceso){
      window.location.href = 'MSS-HubCliente.html';
      return false;
    }
    return true;
  };

  function mostrarBloqueoDatos(){
    setTimeout(()=>{
      const main = document.getElementById('content') ||
                   document.querySelector('.main-content') ||
                   document.querySelector('[id^="sec-"]');
      if(main){
        const msg = document.createElement('div');
        msg.style.cssText = 'padding:40px;text-align:center;color:#6B7280;font-family:monospace;font-size:13px;';
        msg.innerHTML = '<div style="font-size:32px;margin-bottom:12px">🔒</div><div>Acceso restringido. Vuelve a tu panel desde el Hub.</div><br><a href="MSS-HubCliente.html" style="color:#10B981;text-decoration:none;font-weight:700">← Ir a mi Panel</a>';
        main.parentNode.insertBefore(msg, main);
        main.style.display = 'none';
      }
    }, 300);
  }

  // ── BOTÓN VOLVER AL HUB ──
  // Solo se agrega cuando el módulo se abre directamente (NO en iframe)
  function agregarBotonHub(){
    const existente = document.getElementById('mss-btn-hub');
    if(existente) return;

    const btn = document.createElement('a');
    btn.id = 'mss-btn-hub';
    btn.href = 'MSS-HubCliente.html';
    btn.style.cssText = [
      'position:fixed','top:8px','left:12px','z-index:9999',
      'background:rgba(16,185,129,0.15)','border:1px solid rgba(16,185,129,0.3)',
      'color:#10B981','border-radius:8px','padding:6px 12px',
      'font-size:11px','font-weight:700','font-family:monospace',
      'text-decoration:none','display:flex','align-items:center','gap:6px'
    ].join(';');
    btn.innerHTML = '← Mi Panel';
    document.body.appendChild(btn);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      eliminarNav();
      agregarBotonHub();
    });
  } else {
    eliminarNav();
    agregarBotonHub();
  }

  window.mssNavGuard = function(){
    eliminarNav();
    agregarBotonHub();
  };

  console.log('🔒 MSS-NavGuard v2.1 activo — modo cliente externo (directo)');
})();
