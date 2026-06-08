/**
 * MSS-NavGuard.js v2.0 — Control universal de navegación
 * ========================================================
 * - Superadmin (Gaudy): ve TODO, sin restricciones
 * - Clientes externos: nav superior eliminado completamente
 *   Solo navegan desde sus tarjetas en el Hub
 * - Módulos internos: bloquean carga de datos si es cliente externo
 */

(function(){
  const ADMIN_EMAIL = 'aybserviciosg@gmail.com';

  // ── Detectar rol ──
  const esClienteExt = localStorage.getItem('mss_es_cliente_externo') === 'true';
  const sesionRaw    = sessionStorage.getItem('mss_user') || localStorage.getItem('mss_user');
  let emailSesion    = '';
  try{ emailSesion = JSON.parse(sesionRaw||'{}').email || ''; }catch(e){}
  const esAdmin = emailSesion.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Si es superadmin → no aplicar nada
  if(esAdmin || !esClienteExt) return;

  // ── ELIMINAR NAV SUPERIOR COMPLETAMENTE ──
  function eliminarNav(){
    const nav = document.getElementById('nav-bar');
    if(nav){
      nav.style.display = 'none';
    }
    // También ocultar nav-interno si existe (MSS-Condominio)
    const ni = document.getElementById('nav-interno');
    if(ni) ni.style.display = 'none';
  }

  // ── BLOQUEAR ACCESO A DATOS DE GAUDY EN MÓDULOS ──
  window.mssGuardData = function(){
    if(!esClienteExt || esAdmin) return true;

    // El cliente puede acceder a módulos que tiene autorizados
    const modulos = JSON.parse(localStorage.getItem('mss_modulos_permitidos')||'[]');
    const paginaActual = window.location.pathname.split('/').pop().replace('.html','').replace('MSS-','').toLowerCase();

    // Mapeo de archivo a id de módulo
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
      // Módulo no autorizado → redirigir al hub
      window.location.href = 'MSS-HubCliente.html';
      return false;
    }
    return true;
  };

  function mostrarBloqueoDatos(){
    // Ocultar el contenido principal y mostrar mensaje
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
  // Agregar botón de regreso al hub en todos los módulos
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

  // Ejecutar cuando el DOM esté listo
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      eliminarNav();
      agregarBotonHub();
    });
  } else {
    eliminarNav();
    agregarBotonHub();
  }

  // También exponer para llamada manual post-auth
  window.mssNavGuard = function(){
    eliminarNav();
    agregarBotonHub();
  };

  console.log('🔒 MSS-NavGuard v2.0 activo — modo cliente externo');
})();
