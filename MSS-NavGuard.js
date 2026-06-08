/**
 * MSS-NavGuard.js — Control universal de navegación por módulos autorizados
 * Se ejecuta en todos los módulos del ERP para ocultar lo que el cliente no contrató.
 * 
 * Gaudy Martínez (superadmin) siempre ve todo — sin restricciones.
 * Clientes externos solo ven lo que tienen en mss_modulos_permitidos.
 */

(function(){
  // Mapeo: id del módulo → archivos HTML y texto del enlace en el nav
  const MAPA_MODULOS = {
    finanzas:       ['MSS-Finanzas.html',      'Finanzas',    'Finanz'],
    remuneraciones: ['MSS-Remuneraciones.html', 'Remuner',     'Remuneraciones', '👷 Remuner'],
    contabilidad:   ['MSS-Contabilidad.html',   'Contab',      'Contabilidad'],
    facturacion:    ['MSS-Facturacion.html',     'Factur',      'Facturación'],
    tesoreria:      ['MSS-Tesoreria.html',       'Tesor',       'Tesorería'],
    contratos:      ['MSS-Contratos.html',       'Contratos',   '📄 Contratos'],
    cotizacion:     ['MSS-Cotizacion.html',      'Cotiz',       'Cotizaciones'],
    proyectos:      ['MSS-Proyectos.html',       'Proyectos'],
    ventas:         ['MSS-Ventas-CRM.html',      'Ventas',      'Ventas & CRM'],
    rrhh:           ['MSS-RRHH.html',            'RRHH'],
    estrategia:     ['MSS-Estrategia.html',      'Estrategia'],
    arriendos:      ['MSS-Arriendos.html',       'Arriendos',   '🚛 Arriendos'],
    condominio:     ['MSS-Condominio.html',      'Condominio',  '🏢 Condominio'],
    auditoria:      ['MSS-Auditoria.html',       'Auditoría',   '📊 Auditoría'],
    app_vendedores: ['MSS-Movil.html',           'App Móvil',   'Móvil'],
    app_residentes: ['MSS-CondoMovil.html',      'App Residentes'],
    portal_trabajador: ['MSS-PortalTrabajador.html', 'Portal Trabajador'],
  };

  function aplicarNavGuard(){
    const esClienteExt = localStorage.getItem('mss_es_cliente_externo') === 'true';
    const esAdmin = (sessionStorage.getItem('mss_email')||'').toLowerCase() === 'aybserviciosg@gmail.com';

    // Superadmin siempre ve todo
    if(!esClienteExt || esAdmin) return;

    // Leer módulos permitidos
    let modulosPermitidos = [];
    try{
      modulosPermitidos = JSON.parse(
        localStorage.getItem('mss_modulos_permitidos') ||
        sessionStorage.getItem('mss_modulos_permitidos') || '[]'
      );
    }catch(e){ modulosPermitidos = []; }

    if(!modulosPermitidos.length) return; // Sin lista → no tocar nada (seguridad)

    // Construir set de archivos permitidos
    const archivosPermitidos = new Set(['app.html','MSS-BienvenidaCliente.html']);
    modulosPermitidos.forEach(mod => {
      const entry = MAPA_MODULOS[mod];
      if(entry) archivosPermitidos.add(entry[0]);
    });

    // Recorrer todos los enlaces del nav y ocultar los no autorizados
    const navLinks = document.querySelectorAll('#nav-bar a, #nav-interno a');
    navLinks.forEach(link => {
      const href = (link.getAttribute('href')||'').split('?')[0].split('/').pop();
      const onclick = link.getAttribute('onclick')||'';
      // Extraer archivo del onclick si tiene abrirModuloCondo o similar
      const matchOnclick = onclick.match(/['"]([^'"]+\.html)['"]/);
      const archivoLink = matchOnclick ? matchOnclick[1].split('/').pop() : href;

      if(archivoLink && archivoLink.endsWith('.html') &&
         archivoLink !== 'app.html' &&
         !archivosPermitidos.has(archivoLink)){
        link.style.display = 'none';
      }
    });

    // Para MSS-Condominio: ocultar nav-interno y mostrar nav-cliente
    const navInterno = document.getElementById('nav-interno');
    const navCliente = document.getElementById('nav-cliente');
    if(navInterno && navCliente){
      navInterno.style.display = 'none';
      navCliente.style.display = 'contents';
    }

    console.log('🔒 NavGuard activo — módulos permitidos:', modulosPermitidos);
  }

  // Ejecutar cuando el DOM esté listo
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', aplicarNavGuard);
  } else {
    aplicarNavGuard();
  }

  // También exponer función global por si se necesita llamar después del auth
  window.mssNavGuard = aplicarNavGuard;
})();
