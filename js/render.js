/* ============================================================
   CYATAM — ABB System Hardening Portal
   render.js — Funciones que construyen el HTML de cada sección
   ============================================================ */

const $ = id => document.getElementById(id);

// Tagged template literal: combina strings estáticos con valores dinámicos
// IMPORTANTE: si el valor es un array (ej: .map()) lo une con join('') para evitar las comas
const html = (strings, ...values) => strings.reduce((acc, str, i) => {
  let v = values[i];
  if (Array.isArray(v)) v = v.join('');
  return acc + str + (v !== undefined ? v : '');
}, '');

// ── Helpers ──────────────────────────────────────────────────
const badge = (txt, cls='blue') => `<span class="badge badge-${cls}">${txt}</span>`;
const callout = (tipo, icon, title, body) =>
  `<div class="callout callout-${tipo}"><span class="callout-icon">${icon}</span><div class="callout-body"><p class="callout-title">${title}</p><p class="callout-text">${body}</p></div></div>`;
const codeBlock = (lang, code) =>
  `<div class="code-block"><div class="code-header"><span class="code-lang">${lang}</span><button class="copy-btn" onclick="copyCode(this)">Copiar</button></div><pre><code class="language-${lang}">${escHtml(code)}</code></pre></div>`;
const escHtml = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const row = cells => `<tr>${cells.map((c,i)=>`<t${i===0?'d style="font-weight:500;color:var(--text-primary)"':'d'}>${c}</td>`).join('')}</tr>`;
const table = (heads, rows) =>
  `<div class="table-wrap"><table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>row(r)).join('')}</tbody></table></div>`;

function copyCode(btn) {
  const code = btn.closest('.code-block').querySelector('code');
  navigator.clipboard.writeText(code.textContent).then(()=>{
    const orig = btn.textContent;
    btn.textContent='✓ Copiado'; btn.classList.add('copied');
    setTimeout(()=>{btn.textContent=orig;btn.classList.remove('copied');},2000);
  });
}

// ── OVERVIEW ─────────────────────────────────────────────────
function renderOverview() {
  const d = ABB_DATA.overview;
  $('page-overview').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(30,95,173,0.12)">
        <img src="../assets/icon.png" style="height:36px"/>
      </div>
      <div class="page-meta">
        <div class="page-num">PORTAL DE DOCUMENTACIÓN</div>
        <h1 class="page-title">ABB System Hardening</h1>
        <p class="page-desc">Kit oficial de configuración y endurecimiento de Active Directory para entornos de control industrial (OT). Desarrollado por el <strong>System Hardening Team de ABB</strong> — presentado por <strong>CYATAM</strong>.</p>
        <div class="flex gap-2 flex-wrap mt-0" style="margin-top:10px">
          ${badge('v1.2 Kit','blue')} ${badge('ABB.CYATAM → Cliente','green')} ${badge('ICS/OT Security','yellow')}
        </div>
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">🏭</span> Sistemas de Control Soportados</h2>
      <div class="cards-grid">
        ${d.sistemas.map(s=>`<div class="card" style="--card-accent:${s.color}">
          <div class="card-icon">${s.icon}</div>
          <div class="card-title">${s.name}</div>
          <div class="card-desc">${s.desc}</div>
          <span class="card-badge">${s.badge}</span>
        </div>`).join('')}
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">📊</span> Estadísticas del Kit</h2>
      <div class="stats-row">
        ${d.stats.map(s=>`<div class="stat-card"><div class="stat-num${s.num.length > 3 ? ' stat-text' : ''}">${s.num}</div><div class="stat-label">${s.label}</div></div>`).join('')}
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">📚</span> Contenido de esta Documentación</h2>
      <div class="cards-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
        ${d.docs.map(doc=>`<div class="card" onclick="showPage('${doc.page}')" style="cursor:pointer">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:22px">${doc.icon}</span>
            <span style="font-size:11px;font-weight:700;color:var(--text-muted);font-family:'JetBrains Mono',monospace">${doc.num}</span>
          </div>
          <div class="card-title">${doc.title}</div>
          <div class="card-desc">${doc.desc}</div>
        </div>`).join('')}
      </div>
    </div>

    ${callout('warning','⚠️','Antes de ejecutar el kit',
      'El administrador por defecto de Windows quedará BLOQUEADO al aplicar las GPOs. Asegúrate de tener una cuenta alternativa con Domain Admin antes de proceder. Ver sección 08 — Guía de Ejecución.')}
    ${callout('info','💡','Dominio de referencia',
      'El kit fue creado para el dominio ABB.CYATAM. El script PS-06 adapta automáticamente la tabla de migración al dominio real del cliente durante la ejecución.')}
  `;
}

// ── DESCRIPCION ───────────────────────────────────────────────
function renderDescripcion() {
  $('page-descripcion').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(30,95,173,0.12)"><span style="font-size:26px">📋</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 01</div>
        <h1 class="page-title">Descripción General</h1>
        <p class="page-desc">Qué es el kit, su propósito, a quién va dirigido y el contexto técnico del proyecto.</p>
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">🎯</span> ¿Qué es este Kit?</h2>
      <p>El <strong>Kit Oficial de Configuración y Endurecimiento de Sistemas (System Hardening)</strong> fue desarrollado por el equipo de ABB para automatizar la configuración completa de un dominio <strong>Active Directory de Windows Server</strong> en entornos de sistemas de control industrial (OT — Operational Technology).</p>
      <p>Su propósito es garantizar que el Active Directory del cliente cumpla con los estándares de seguridad de ABB desde el primer día de operación, eliminando la configuración manual propensa a errores.</p>
    </div>

    <div class="section">
      <h2><span class="h2-icon">✅</span> ¿Para qué sirve?</h2>
      <div class="cards-grid">
        ${[
          {icon:'🏗️',title:'Estructura AD',desc:'Crea 29 Unidades Organizativas jerárquicas para separar computadores, usuarios, grupos y roles.'},
          {icon:'👥',title:'103 Grupos',desc:'Grupos de seguridad para todos los sistemas de control, roles de acceso y filtrado de GPOs.'},
          {icon:'🎭',title:'8 Roles DCS',desc:'Roles predefinidos con permisos exactos: desde Operador (sin acceso Windows) hasta Administrador.'},
          {icon:'🛡️',title:'57 GPOs',desc:'Políticas de grupo preconfiguradas con estándares de seguridad industrial para Windows, Office y Adobe.'},
          {icon:'📋',title:'Plantillas ADMX',desc:'Versiones actualizadas de las plantillas ADMX para Windows, Office, Adobe y configuraciones regionales.'},
          {icon:'🖥️',title:'Fondo Corporativo',desc:'Escritorio ABB con BGInfo mostrando IP, nombre de usuario y velocidad de red.'}
        ].map(c=>`<div class="card"><div class="card-icon">${c.icon}</div><div class="card-title">${c.title}</div><div class="card-desc">${c.desc}</div></div>`).join('')}
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">👔</span> ¿A quién va dirigido?</h2>
      <p>Este kit es ejecutado por un <strong>Administrador de Sistemas con privilegios de Domain Admin</strong> en el Controlador de Dominio del cliente, durante la instalación inicial de un sistema de automatización ABB.</p>
      ${callout('danger','🚫','Lo que NO hace este kit',
        'No instala 800xA, Symphony Plus ni Freelance. No configura el hardware ni la red industrial. No reemplaza la configuración manual de permisos en servidores de aplicación. No crea usuarios finales de producción (solo plantillas base).')}
    </div>

    <div class="section">
      <h2><span class="h2-icon">⚙️</span> Contexto Técnico</h2>
      ${table(
        ['Parámetro','Valor'],
        [
          ['Dominio de Referencia','ABB.CYATAM (se adapta al cliente en ejecución)'],
          ['DC de Desarrollo','DevDC.ABB.CYATAM'],
          ['Versión del Kit','1.3'],
          ['Autores','CYATAM-Angel Magadan'],
          ['Lenguajes','PowerShell, Batch (.BAT), VBScript, XML'],
          ['Sistemas Windows Soportados','Windows Server 2016 / 2019 / 2022 / 2025, Windows 10 / 11']
        ]
      )}
    </div>
  `;
}

// ── ESTRUCTURA DIRECTORIOS ────────────────────────────────────
function renderEstructura() {
  $('page-estructura').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(155,127,232,0.12)"><span style="font-size:26px">📁</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 02</div>
        <h1 class="page-title">Estructura de Directorios</h1>
        <p class="page-desc">Mapa completo de archivos y carpetas del kit ABB System Hardening.</p>
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">🗂️</span> Árbol de Archivos</h2>
      <div class="tree">
<span class="folder">ABB/SystemHardening/Domain/</span>
├── <span class="accent">ABB-Setup-ActiveDirectory.bat</span>         <span class="desc">← SCRIPT PRINCIPAL (Punto de entrada)</span>
├── <span class="file">ABB-CreateCSVFiles.xlsm</span>                  <span class="desc">← Excel para generar los archivos CSV</span>
├── <span class="file">ABB-CreateLocalUserOnDomainJoinedComputers.ps1</span>  <span class="desc">← Script post-instalación</span>
├── <span class="file">NewADSetup.log</span>                            <span class="desc">← Log de la última ejecución</span>
│
├── <span class="folder">Scripts/</span>                               <span class="desc">← Scripts PS (ejecución numerada)</span>
│   ├── <span class="highlight new">ABB-00-CheckCompatibility.ps1</span>  <span class="desc">← 🆕 WS2025: detecta OS y modo de compatibilidad</span>
│   ├── <span class="highlight">ABB-01-CreateOUs.ps1</span>
│   ├── <span class="highlight">ABB-02-CreateGroups.ps1</span>
│   ├── <span class="highlight">ABB-03-CreateRoleGroups.ps1</span>
│   ├── <span class="highlight">ABB-04-CreateRoleGroupsMembership.ps1</span>
│   ├── <span class="highlight">ABB-05-CreateUsers.ps1</span>
│   ├── <span class="highlight">ABB-06-CreateMigrationTable.ps1</span>
│   ├── <span class="highlight">ABB-07-CreateWMIFilters.ps1</span>
│   ├── <span class="highlight">ABB-08-ImportGPOs.ps1</span>
│   ├── <span class="highlight new">ABB-08b-ImportGPOs-WS2025.ps1</span>     <span class="desc">← 🆕 WS2025: omite GPOs incompatibles</span>
│   ├── <span class="highlight">ABB-09-SetGPOPermissions.ps1</span>
│   ├── <span class="highlight">ABB-10-CreateAndSetFineGrainedPasswordPolicy.ps1</span>
│   ├── <span class="accent">ABBGPO.migtable</span>                   <span class="desc">← Migration table activa</span>
│   ├── <span class="file">ABBGPO.migtable.org</span>               <span class="desc">← Backup original del migration table</span>
│   ├── <span class="file">ouStructure.csv</span>                   <span class="desc">← 29 OUs a crear</span>
│   ├── <span class="file">groupStructure.csv</span>                <span class="desc">← 103 grupos de seguridad</span>
│   ├── <span class="file">roleStructure.csv</span>                 <span class="desc">← 8 roles DCS</span>
│   ├── <span class="file">roleMembership.csv</span>                <span class="desc">← Membresía roles → grupos</span>
│   ├── <span class="file">userMembership.csv</span>                <span class="desc">← 21 usuarios base</span>
│   └── <span class="file">gpoPermission.csv</span>                 <span class="desc">← Permisos de las 57 GPOs</span>
│
├── <span class="folder">Policies/</span>                              <span class="desc">← 57 GPOs exportadas</span>
│   ├── <span class="file">manifest.xml</span>                      <span class="desc">← Índice de todas las GPOs</span>
│   └── <span class="file">{GUID}/</span>                           <span class="desc">← Carpeta por cada GPO (x57)</span>
│
├── <span class="folder">ADMXFiles/</span>                             <span class="desc">← Plantillas ADMX actualizadas</span>
│   ├── <span class="folder">Windows/</span>                          <span class="desc">← ~208 archivos .admx</span>
│   ├── <span class="folder">Office/</span>
│   ├── <span class="folder">Adobe/</span>
│   └── <span class="folder">RegionalSettings/</span>
│
├── <span class="folder">ADMXBackup/</span>                            <span class="desc">← Backup de ADMX originales del DC</span>
│
└── <span class="folder">Background/</span>                            <span class="desc">← Recursos de personalización</span>
    ├── <span class="file">ABBLockscreen.jpg</span>                 <span class="desc">← Imagen pantalla de bloqueo</span>
    ├── <span class="file">ABBvoice_Bd.ttf / ABBvoice_Rg.ttf</span> <span class="desc">← Tipografía corporativa ABB</span>
    ├── <span class="accent">Bginfo.exe / Bginfo64.exe</span>         <span class="desc">← Herramienta BGInfo (SysInternals)</span>
    ├── <span class="file">ABB Standard Background.bgi</span>       <span class="desc">← Configuración de BGInfo</span>
    ├── <span class="file">ABB Desktop Background.vbs</span>        <span class="desc">← Script VBS para aplicar fondo</span>
    ├── <span class="file">ABB GetFullName.vbs</span>               <span class="desc">← Obtiene nombre completo del usuario</span>
    ├── <span class="file">ABB GetIPAddresses.vbs</span>            <span class="desc">← Obtiene direcciones IP del equipo</span>
    └── <span class="file">ABB GetNetworkSpeed.vbs</span>           <span class="desc">← Obtiene velocidad de red</span>
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">📊</span> Resumen de Archivos CSV</h2>
      ${table(
        ['Archivo CSV','Registros','Propósito'],
        [
          ['ouStructure.csv','29 OUs','Define la estructura jerárquica del dominio (hasta 4 niveles)'],
          ['groupStructure.csv','103 grupos','Grupos de seguridad para los 3 sistemas de control'],
          ['roleStructure.csv','8 roles','Roles DCS con sus permisos y OU de destino'],
          ['roleMembership.csv','8 registros','Mapeo de cada rol a sus grupos funcionales (hasta 80)'],
          ['userMembership.csv','21 usuarios','Usuarios base, cuentas de servicio y membresía de grupos (hasta 103)'],
          ['gpoPermission.csv','57 GPOs','Permisos de seguridad (Apply/Read) y vinculación al dominio']
        ]
      )}
    </div>
  `;
}

// ── FLUJO EJECUCION ───────────────────────────────────────────
function renderFlujo() {
  const pasos = [
    {n:1, t:'Selección del sistema de control', d:'El script pregunta: 800xA, Splus, Freelance o combinaciones. Esto filtra qué OUs, grupos y GPOs se crean.'},
    {n:2, t:'Nombre de cuenta de servicio 800xA', d:'Solo si el sistema incluye 800xA. Default: 800xAService. Este nombre se usará en PS-06 para la migration table.'},
    {n:3, t:'Advertencia de bloqueo del admin', d:'⚠️ CRÍTICO: Se informa que el administrador por defecto quedará bloqueado. Se requiere confirmación explícita Y/N.'},
    {n:4, t:'Nombre de cuenta admin local', d:'Nombre para la cuenta de administrador local en equipos del dominio. Default: localAdmin.'},
    {n:5, t:'¿Crear usuarios del CSV?', d:'Decide si PS-05 ejecutará o no la creación/actualización de usuarios del archivo userMembership.csv.'},
    {n:6, t:'Verificar Bginfo.exe', d:'Si no existe el ejecutable en Background/, se informa y se pregunta si continuar sin él.'},
    {n:7, t:'Copiar archivos de fondo y ADMX', d:'Copia archivos de Background/ al SYSVOL, hace backup de ADMX originales y copia las versiones actualizadas.'},
    {n:8, t:'Fase 1: Estructura AD (PS-01 a PS-05)', d:'Crea OUs → Grupos → Roles → Membresías → Usuarios. Si hay ERROR en cualquier paso, se detiene.'},
    {n:9, t:'Verificación anti-error', d:'Busca [ERROR] en el log. Si hay errores: DETIENE el proceso y no importa GPOs. Si no hay: continúa.'},
    {n:10, t:'Fase 2: GPOs (PS-06 a PS-10)', d:'Migration table → Filtros WMI → Importar 57 GPOs → Permisos → Fine-Grained Password Policy.'}
  ];
  $('page-flujo').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(34,211,165,0.12)"><span style="font-size:26px">⚙️</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 03</div>
        <h1 class="page-title">Flujo de Ejecución</h1>
        <p class="page-desc">Cómo funciona ABB-Setup-ActiveDirectory.bat paso a paso — el orquestador principal del kit.</p>
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">🚀</span> Pasos del Script Principal</h2>
      <div class="steps">
        ${pasos.map(p=>`<div class="step">
          <div class="step-num">${p.n}</div>
          <div class="step-content">
            <div class="step-title">${p.t}</div>
            <p class="step-desc">${p.d}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>

    ${callout('danger','🛑','Mecanismo de parada de emergencia',
      'Si los scripts de Fase 1 (OUs/Grupos/Usuarios) generan cualquier [ERROR] en el log, el BAT se detiene completamente y NO importa las GPOs. Esto evita bloquear el acceso al dominio si la estructura AD está incompleta.')}

    <div class="section">
      <h2><span class="h2-icon">🔧</span> Variables de Entorno Configuradas</h2>
      ${table(
        ['Variable','Descripción','Ruta de Referencia'],
        [
          ['ADMXFilesBackupPath','Backup de ADMX originales','.\\ADMXBackup\\'],
          ['ADMXWindowsFilesPath','Plantillas ADMX Windows','.\\ADMXFiles\\Windows\\'],
          ['PolicyDefinitionPath','Plantillas del DC','%windir%\\PolicyDefinitions'],
          ['GroupPolicyCentralStorePath','Central Store','%windir%\\SYSVOL\\domain\\Policies\\PolicyDefinitions'],
          ['PolicyScriptsPath','Scripts del dominio','%windir%\\SYSVOL\\domain\\scripts'],
          ['LogFile','Archivo de log','.\\NewADSetup.log']
        ]
      )}
    </div>

    <div class="section">
      <h2><span class="h2-icon">💻</span> Secuencia de Scripts PowerShell</h2>
      ${table(
        ['Fase','Script','Acción','Datos de entrada'],
        [
          ['0','PS-00','Verificar Compatibilidad del OS','(automático — detecta WS2025)'],
          ['1','PS-01','Crear OUs','ouStructure.csv'],
          ['1','PS-02','Crear Grupos de Seguridad','groupStructure.csv'],
          ['1','PS-03','Crear Grupos de Roles','roleStructure.csv'],
          ['1','PS-04','Asignar Membersía a Roles','roleMembership.csv'],
          ['1','PS-05 (opcional)','Crear / Actualizar Usuarios','userMembership.csv'],
          ['⛔','—','VERIFICACIÓN DE ERRORES','NewADSetup.log'],
          ['2','PS-06','Preparar Migration Table','ABBGPO.migtable.org'],
          ['2','PS-07','Crear Filtros WMI','(automático + WMI-Win11 en WS2025)'],
          ['2','PS-08 / PS-08b','Importar GPOs (Legacy / WS2025)','Policies/ + ABBGPO.migtable'],
          ['2','PS-09','Aplicar Permisos a GPOs','gpoPermission.csv'],
          ['2','PS-10','Fine-Grained Password Policy','(automático)']
        ]
      )}
    </div>
  `;
}

// ── SCRIPTS POWERSHELL ────────────────────────────────────────
function renderScripts() {
  const d = ABB_DATA.scripts;
  $('page-scripts').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(30,95,173,0.12)"><span style="font-size:26px">💻</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 04</div>
        <h1 class="page-title">Scripts PowerShell</h1>
        <p class="page-desc">Análisis detallado de los 12 scripts PS que ejecuta el kit (incluye 2 nuevos para WS2025).</p>
      </div>
    </div>
    ${callout('info','ℹ️','Patrón común de todos los scripts',
      'Todos los scripts: (1) Aceptan parámetros por argumento, (2) Importan el módulo ActiveDirectory, (3) Verifican existencia antes de crear (idempotencia), (4) Registran [OK], [INFO] o [ERROR] en el log.')}
    <div class="section">
      ${d.map(s => `
        <div class="card" style="margin-bottom:20px;--card-accent:var(--cyatam-blue)">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap">
            <span style="font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--cyatam-blue-light);background:rgba(30,95,173,0.15);padding:4px 10px;border-radius:4px">${s.num}</span>
            <span style="font-size:15px;font-weight:700;color:var(--text-primary)">${s.title}</span>
            <span class="badge badge-gray" style="margin-left:auto">${s.badge}</span>
            <span class="badge badge-purple">v${s.ver}</span>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">${s.desc}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex-wrap:wrap">
            <div>
              <h4 style="margin-top:0">Parámetros</h4>
              ${table(['Parámetro','Descripción'], s.params)}
            </div>
            <div>
              <h4 style="margin-top:0">Lógica Principal</h4>
              <ol style="padding-left:20px;margin:0">${s.logic.map(l=>`<li style="font-size:12px;color:var(--text-secondary);margin-bottom:5px">${l}</li>`).join('')}</ol>
            </div>
          </div>
          <div style="margin-top:10px">
            <code style="font-size:11px;color:var(--text-muted)">📄 ${s.file}</code>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── ESTRUCTURA AD ─────────────────────────────────────────────
function renderAD() {
  const d = ABB_DATA.usuarios;
  $('page-ad').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(34,211,165,0.12)"><span style="font-size:26px">🏢</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 05</div>
        <h1 class="page-title">Estructura de Active Directory</h1>
        <p class="page-desc">OUs, Grupos, Roles y Usuarios que el kit crea en el dominio.</p>
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">🗂️</span> Unidades Organizativas (29 OUs)</h2>
      <div class="tree">
<span class="folder">ABB/</span>                    <span class="desc">← Raíz del sistema ABB</span>
├── <span class="folder">Computers/</span>
│   ├── <span class="file">3rd Party/</span>         <span class="desc">← Backup Server, Management Server</span>
│   ├── <span class="accent">800xA/</span>            <span class="desc">← Clients, Servers/Historians, Thin Clients</span>
│   ├── <span class="accent">Freelance/</span>        <span class="desc">← Equipos Freelance</span>
│   ├── <span class="danger">Staging/</span>          <span class="desc">← ⚠️ GPO BLOQUEADO (equipos en preparación)</span>
│   └── <span class="highlight">Symphony Plus/</span> <span class="desc">← Equipos S+</span>
├── <span class="folder">Groups/</span>
│   ├── <span class="accent">800xA Groups/</span>     <span class="desc">← 6 grupos IndustrialIT*</span>
│   ├── <span class="accent">Freelance Groups/</span> <span class="desc">← 10 grupos ABB Freelance*</span>
│   ├── <span class="file">General Groups/</span>   <span class="desc">← 24 grupos generales</span>
│   ├── <span class="file">Security Filtering Groups/</span> <span class="desc">← 10 grupos GPO-Filter-*</span>
│   └── <span class="highlight">Symphony Plus Groups/</span> <span class="desc">← 46 grupos S+</span>
├── <span class="folder">Roles/</span>              <span class="desc">← 8 grupos de rol DCS</span>
└── <span class="folder">Users/</span>
    ├── <span class="accent">Administrators/</span>  ├── <span class="accent">Engineers/</span>
    ├── <span class="file">Operators/</span>       ├── <span class="file">Read Only/</span>
    ├── <span class="file">Service Accounts/</span> └── <span class="file">Supervisors/</span>
      </div>
    </div>

    <div class="section">
      <h2><span class="h2-icon">🎭</span> Roles DCS — Matriz de Acceso</h2>
      ${table(
        ['Rol','OU','Login Local','RDP','Admin Local','Acceso DCS'],
        ABB_DATA.roles.map(r=>[r.nombre, r.ou, r.winLogin, r.rdp, r.localAdmin, r.dcsAccess])
      )}
    </div>

    <div class="section">
      <h2><span class="h2-icon">👤</span> Usuarios de Administración</h2>
      ${table(['Usuario','OU','Tipo','Descripción'], d.escape.map(u=>[u.user,u.ou,u.tipo,u.desc]))}
      ${callout('danger','⚠️','CRÍTICO: tmpAdmin',
        'La cuenta tmpAdmin es la "cuenta de escape" de emergencia. Tiene privilegios de Domain Admin + DCS Admin completos. Después de la instalación, cambiar su contraseña a una muy compleja y documentarla en una bóveda de contraseñas segura.')}
    </div>

    <div class="section">
      <h2><span class="h2-icon">👥</span> Usuarios DCS Base</h2>
      ${table(['Usuario','OU Destino','Rol Asignado'], d.dcs.map(u=>[u.user,u.ou,u.rol]))}
    </div>

    <div class="section">
      <h2><span class="h2-icon">⚙️</span> Cuentas de Servicio (12 cuentas)</h2>
      ${callout('info','🔒','Características de todas las cuentas de servicio',
        'Contraseña que NO expira. NO pueden iniciar sesión localmente ni por RDP (excepto SPlusIMReportUser). Se rigen por la Fine-Grained Password Policy sin bloqueo de cuenta.')}
      ${table(['Cuenta','Sistema','Servicios que gestiona'], d.servicios.map(u=>[u.user,u.sistema,u.desc]))}
    </div>
  `;
}

// ── GPOS ──────────────────────────────────────────────────────
function renderGPOs() {
  const g = ABB_DATA.gpos;
  const gpoTable = (lista) => table(
    ['GPO','Vinculada','Descripción'],
    lista.map(p=>[
      `<code style="font-size:11px;color:var(--cyatam-blue-light)">${p.name}</code>`,
      p.dcOnly ? badge('DC Only','purple') : p.linked ? badge('✓ Dominio','green') : badge('Manual','gray'),
      p.desc
    ])
  );
  $('page-gpos').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(255,75,79,0.1)"><span style="font-size:26px">🛡️</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 06</div>
        <h1 class="page-title">Catálogo de GPOs</h1>
        <p class="page-desc">Las 57 Group Policy Objects incluidas en el kit, organizadas por categoría.</p>
        <div class="flex gap-2 flex-wrap" style="margin-top:10px">
          ${badge('57 Total','blue')} ${badge('~42 Vinculadas','green')} ${badge('ABB.CYATAM — 2026','gray')}
        </div>
      </div>
    </div>
    <div class="section">
      <h2><span class="h2-icon">📊</span> Resumen por Categoría</h2>
      ${table(['Categoría','Cantidad','Vinculadas al Dominio'],[
        ['🔒 Seguridad General','28','26'],['⚙️ Opcionales','9','1 (Background)'],
        ['🏭 System 800xA','9','5'],['⚡ Symphony Plus','8','7'],
        ['🔧 Freelance','3','3'],['<strong>TOTAL</strong>','<strong>57</strong>','<strong>~42</strong>']
      ])}
    </div>
    <div class="section">
      <h2><span class="h2-icon">🔒</span> GPOs de Seguridad General (28)</h2>
      ${gpoTable(g.general)}
    </div>
    <div class="section">
      <h2><span class="h2-icon">⚙️</span> GPOs Opcionales (9)</h2>
      ${callout('info','💡','GPOs Opcionales',
        'Estas GPOs NO están vinculadas al dominio por defecto. Se vinculan manualmente según las necesidades del proyecto.')}
      ${gpoTable(g.opcionales)}
    </div>
    <div class="section">
      <h2><span class="h2-icon">🏭</span> GPOs System 800xA (9)</h2>
      ${gpoTable(g.xA800)}
    </div>
    <div class="section">
      <h2><span class="h2-icon">⚡</span> GPOs Symphony Plus (8)</h2>
      ${gpoTable(g.splus)}
    </div>
    <div class="section">
      <h2><span class="h2-icon">🔧</span> GPOs Freelance (3)</h2>
      ${gpoTable(g.freelance)}
    </div>
  `;
}

// ── SEGURIDAD ────────────────────────────────────────────────
function renderSeguridad() {
  $('page-seguridad').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(245,166,35,0.1)"><span style="font-size:26px">🔐</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 07</div>
        <h1 class="page-title">Análisis de Seguridad</h1>
        <p class="page-desc">Modelo de seguridad, áreas cubiertas, riesgos identificados y cumplimiento de estándares.</p>
      </div>
    </div>
    ${callout('info','🎯','Modelo de Defensa en Profundidad',
      'El kit implementa un modelo de seguridad en capas diseñado para entornos OT (Operational Technology) donde la disponibilidad del proceso industrial es crítica. Se aplica el principio de mínimo privilegio y separación de funciones.')}
    <div class="section">
      <h2><span class="h2-icon">🔑</span> Autenticación y Acceso</h2>
      ${table(['Política','GPO','Descripción'],[
        ['Bloqueo de cuentas','Account Lockout Settings','Bloquea tras intentos fallidos — protege contra fuerza bruta'],
        ['Política de contraseñas','Account Password Settings','Longitud mínima, complejidad, historial de contraseñas'],
        ['FGPP Servicios','PS-10 FGPP','Cuentas de servicio sin bloqueo y contraseña permanente'],
        ['Admin bloqueado','Account Secure Local Accounts','Cuenta Administrator renombrada y deshabilitada'],
        ['Mensaje legal','Logon Display Message','Aviso legal en pantalla de login']
      ])}
    </div>
    <div class="section">
      <h2><span class="h2-icon">🖥️</span> Acceso Remoto (RDP)</h2>
      ${table(['Política','GPO','Descripción'],[
        ['RDP habilitado selectivo','Remote Desktop Enable','Solo grupos autorizados pueden usar escritorio remoto'],
        ['Restricciones en sesión','Remote Desktop Lockdown','Limita capacidades dentro de sesiones RDP'],
        ['Grupo RemoteDesktopLogon','User Rights Assignments','Solo miembros pueden conectarse vía RDP'],
        ['DenyLogonRemote','User Rights Assignments','Cuentas de servicio bloqueadas de acceso remoto']
      ])}
    </div>
    <div class="section">
      <h2><span class="h2-icon">💾</span> Medios Removibles</h2>
      ${table(['Política','Estado','Acción Requerida'],[
        ['Removable Media Disable','✅ ACTIVA','Todos los USB y CDs bloqueados globalmente'],
        ['Removable Media Enable','⚠️ No vinculada','Vincular manualmente a OUs que SÍ necesiten USB']
      ])}
      ${callout('warning','⚠️','USB bloqueado por defecto',
        'La GPO "Removable Media Disable" bloquea TODOS los puertos USB. Si necesitas USB en estaciones de ingeniería, agrégalas a una OU con herencia bloqueada y aplica "Removable Media Enable" sólo ahí.')}
    </div>
    <div class="section">
      <h2><span class="h2-icon">📋</span> Sistema de Auditoría</h2>
      ${table(['Elemento','Descripción'],[
        ['Log de instalación','NewADSetup.log — cada paso con [OK], [INFO], [ERROR]'],
        ['Auditoría de AD','Audit Settings GPO — eventos de login, cambios de permisos, acceso a objetos'],
        ['BGInfo Desktop','IP, usuario, velocidad de red visible en escritorio de cada equipo'],
        ['Event Logs','Configurados para retención y tamaño adecuado para auditoría']
      ])}
    </div>
    <div class="section">
      <h2><span class="h2-icon">📜</span> Cumplimiento de Estándares</h2>
      ${table(['Estándar','Área','Cumplimiento'],[
        ['IEC 62443','Ciberseguridad en sistemas ICS/OT','Parcial ✅'],
        ['NIST SP 800-82','Seguridad para Sistemas de Control Industrial','Parcial ✅'],
        ['CIS Benchmarks','Configuración segura Windows Server','Parcial ✅'],
        ['Mínimo Privilegio','Acceso solo a recursos necesarios','✅ Implementado'],
        ['Separación de Funciones','Operadores ≠ Ingenieros ≠ Administradores','✅ Implementado']
      ])}
    </div>
    <div class="section">
      <h2><span class="h2-icon">⚠️</span> Riesgos y Advertencias</h2>
      ${callout('danger','🚨','CRÍTICO: Cuenta tmpAdmin',
        'tmpAdmin tiene Domain Admin + DCS Admin + Domain Admins completos. Si se compromete, el atacante tiene control total del dominio. ACCIÓN: Después de la instalación, cambiar inmediatamente la contraseña a una muy compleja y almacenarla en bóveda de contraseñas.')}
      ${callout('danger','🔒','IMPORTANTE: Admin por defecto bloqueado',
        'Las GPOs bloquean "Administrator". Si no tienes OTRA cuenta con Domain Admin ANTES de aplicar las políticas, quedarás sin acceso. ACCIÓN: Verificar que tmpAdmin o cuenta alternativa funcione antes de proceder.')}
    </div>
  `;
}

// ── GUIA EJECUCION ────────────────────────────────────────────
function renderGuia() {
  const cl = ABB_DATA.checklist;
  const checklistHtml = (items, title, icon) => `
    <h3>${icon} ${title}</h3>
    <ul class="checklist">
      ${items.map(i=>`<li class="${i.critico?'critical':''}">${i.texto}</li>`).join('')}
    </ul>`;
  $('page-guia').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(34,211,165,0.12)"><span style="font-size:26px">✅</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 08</div>
        <h1 class="page-title">Guía de Ejecución Segura</h1>
        <p class="page-desc">Checklist pre-vuelo y guía paso a paso para ejecutar el kit sin riesgos.</p>
      </div>
    </div>
    ${callout('danger','⚠️','LEER ANTES DE EJECUTAR',
      'Este proceso configura el Active Directory de forma permanente. El bloqueo del administrador por defecto es difícil de revertir. Sigue este checklist en orden estricto.')}
    <div class="section">
      <h2><span class="h2-icon">✅</span> Checklist Pre-Vuelo</h2>
      ${checklistHtml(cl.entorno,'Fase 1 — Verificación del Entorno','🖥️')}
      ${checklistHtml(cl.cuentas,'Fase 2 — Cuentas de Seguridad','🔑')}
      ${checklistHtml(cl.archivos,'Fase 3 — Archivos del Kit','📁')}
      ${checklistHtml(cl.backup,'Fase 4 — Backup (OBLIGATORIO)','💾')}
    </div>
    <div class="section">
      <h2><span class="h2-icon">🚀</span> Pasos de Ejecución</h2>
      <div class="steps">
        <div class="step"><div class="step-num">1</div><div class="step-content">
          <div class="step-title">Verificar el módulo AD</div>
          ${codeBlock('powershell','Import-Module ActiveDirectory\nGet-ADDomain')}
        </div></div>
        <div class="step"><div class="step-num">2</div><div class="step-content">
          <div class="step-title">Navegar a la carpeta del kit y ejecutar</div>
          ${codeBlock('batch','cd "C:\\Ruta\\Al\\Kit\\ABB\\SystemHardening\\Domain"\nABB-Setup-ActiveDirectory.bat')}
        </div></div>
        <div class="step"><div class="step-num">3</div><div class="step-content">
          <div class="step-title">Responder las preguntas del wizard</div>
          ${table(['Pregunta','Respuesta Recomendada'],[
            ['Sistema de control','Selecciona según el proyecto (1-3, 11-13, 21)'],
            ['Nombre cuenta 800xA','800xAService (o el acordado con el cliente)'],
            ['¿Continuar? (advertencia admin)','Y — Solo si tienes cuenta alternativa lista ✅'],
            ['Nombre cuenta admin local','localAdmin (o el acordado)'],
            ['¿Crear usuarios?','Y para cuentas base de demostración'],
            ['¿Continuar sin BGInfo?','Solo Y si no tienes el ejecutable']
          ])}
        </div></div>
        <div class="step"><div class="step-num">4</div><div class="step-content">
          <div class="step-title">Monitorear y verificar el log</div>
          ${codeBlock('batch','type NewADSetup.log | findstr /i "[ERROR]"')}
          <p style="font-size:13px;color:var(--text-secondary);margin-top:10px">🟢 Verde = OK | ⚪ Blanco = INFO (ya existía) | 🔴 Rojo = ERROR (requiere acción)</p>
        </div></div>
        <div class="step"><div class="step-num">5</div><div class="step-content">
          <div class="step-title">Post-instalación: agregar equipos a grupos de filtrado</div>
          ${codeBlock('powershell','# Agregar equipo 800xA al grupo de filtrado\nAdd-ADGroupMember -Identity "GPO-Filter-800xAComputers" -Members "NOMBRE-PC$"\n\n# Crear usuarios locales en equipos del dominio\n# Ejecutar ABB-CreateLocalUserOnDomainJoinedComputers.ps1 en cada equipo')}
        </div></div>
      </div>
    </div>
    <div class="section">
      <h2><span class="h2-icon">🔄</span> Cómo Revertir (si es necesario)</h2>
      ${callout('warning','💡','Opción recomendada: Restaurar desde System State Backup',
        'Iniciar el DC en DSRM (F8 al arrancar → Directorio de servicios modo restauración) y restaurar desde el backup previo.')}
      ${codeBlock('powershell','# Limpieza manual si no hay backup\n# 1. Eliminar GPOs de ABB\nGet-GPO -All | Where {$_.DisplayName -like "ABB*"} | Remove-GPO\n\n# 2. Desproteger y eliminar OUs\nSet-ADOrganizationalUnit -Identity "OU=ABB,DC=dominio,DC=local" -ProtectedFromAccidentalDeletion $false\nRemove-ADOrganizationalUnit -Identity "OU=ABB,DC=dominio,DC=local" -Recursive')}
    </div>
  `;
}

// ── PERSONALIZACION ───────────────────────────────────────────
function renderPersonalizacion() {
  $('page-personalizacion').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(155,127,232,0.12)"><span style="font-size:26px">✏️</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 09</div>
        <h1 class="page-title">Personalización y Adaptación</h1>
        <p class="page-desc">Cómo adaptar el kit al dominio y necesidades específicas de cada cliente.</p>
      </div>
    </div>
    <div class="section">
      <h2><span class="h2-icon">🌐</span> 1. Cambio de Nombre de Dominio (OBLIGATORIO)</h2>
      <p>El kit fue creado con <code>ABB.CYATAMl</code> como referencia. El script <strong>PS-06</strong> adapta automáticamente la Migration Table al dominio real del DC durante la ejecución.</p>
      ${codeBlock('powershell','# Verificar el dominio actual (lo hace PS-06 automáticamente)\n(Get-ADDomain).DNSRoot\n# Debe mostrar: cliente.local (o el dominio real del proyecto)')}
    </div>
    <div class="section">
      <h2><span class="h2-icon">👤</span> 2. Personalizar Nombres de Cuentas</h2>
      ${table(['Cuenta','Default','Cómo cambiar'],[
        ['Servicio 800xA','800xAService','El BAT lo pregunta al inicio'],
        ['Admin local','localAdmin','El BAT lo pregunta al inicio'],
        ['Usuarios DCS','DCSSysAdmin, DCSOperator...','Editar userMembership.csv']
      ])}
    </div>
    <div class="section">
      <h2><span class="h2-icon">🗂️</span> 3. Modificar Estructura de OUs</h2>
      <p>Editar <code>Scripts/ouStructure.csv</code> antes de ejecutar. Formato:</p>
      ${codeBlock('csv','OULevel1;OULevel2;OULevel3;OULevel4;OUName;OUDescription;OUApplication\n# Ejemplo — Agregar OU bajo Computers:\nComputers;ABB;;;MiNuevaOU;Descripcion de la OU;All')}
      ${table(['Campo','Opciones','Descripción'],[
        ['OULevel1..4','Nombres de OUs padre','Vacío si no aplica ese nivel'],
        ['OUName','Texto libre','Nombre de la OU a crear'],
        ['OUApplication','All, 800xA, Splus, Freelance','Filtra para qué sistema aplica']
      ])}
    </div>
    <div class="section">
      <h2><span class="h2-icon">👥</span> 4. Agregar Nuevos Usuarios</h2>
      ${codeBlock('csv','# Formato de userMembership.csv\nUser;FirstName;LastName;Description;OU;MustChange;CannotChange;NeverExpires;MemberOf1;...\n# Ejemplo — Agregar un operador:\njgarcia;Juan;Garcia;Operador Planta 1;Operators;n;n;n;DCS Operator')}
      ${callout('info','💡','Recomendación',
        'Usa el archivo Excel ABB-CreateCSVFiles.xlsm para generar los CSVs — tiene validaciones y menús desplegables que evitan errores de formato.')}
    </div>
    <div class="section">
      <h2><span class="h2-icon">🛡️</span> 5. Vincular GPOs Opcionales Manualmente</h2>
      ${table(['GPO','Cuándo vincular'],[
        ['ABB Optional - Autologon','Thin clients que arrancan solos sin login'],
        ['ABB Optional - Background','Para fondo corporativo ABB con BGInfo'],
        ['ABB Optional - DE Keyboard Layout','Proyectos en Alemania o con teclado alemán'],
        ['ABB Security - Removable Media Enable','Equipos que SÍ necesitan USB (ej: ingeniería)'],
        ['ABB Optional - SmartCard','Si el cliente usa tarjetas inteligentes']
      ])}
      ${codeBlock('powershell','# Vincular GPO a una OU específica\nNew-GPLink -Name "ABB Optional - Autologon (v1.0) - COMP" `\n  -Target "OU=Thin Clients,OU=800xA,OU=Computers,OU=ABB,DC=cliente,DC=local"')}
    </div>
    <div class="section">
      <h2><span class="h2-icon">⚙️</span> 6. Agregar Equipos a Grupos de Filtrado</h2>
      <p>Después de unir un equipo al dominio, agregarlo al grupo correcto para que reciba las GPOs correspondientes:</p>
      ${codeBlock('powershell','# Equipo con System 800xA instalado\nAdd-ADGroupMember -Identity "GPO-Filter-800xAComputers" -Members "PC-800xA-01$"\n\n# Servidor IIS\nAdd-ADGroupMember -Identity "GPO-Filter-IIS Servers" -Members "SRV-IIS-01$"\n\n# Thin client con auto-login\nAdd-ADGroupMember -Identity "GPO-Filter-Auto Logon Clients" -Members "TC-SALA-03$"\n\n# NOTA: Las cuentas de equipo en AD terminan con $ (ej: PC01$)')}
    </div>
  `;
}

// ── TROUBLESHOOTING ───────────────────────────────────────────
function renderTroubleshooting() {
  const errores = ABB_DATA.errores;
  $('page-troubleshooting').innerHTML = html`
    <div class="page-header">
      <div class="page-icon-wrap" style="background:rgba(255,75,79,0.1)"><span style="font-size:26px">🐛</span></div>
      <div class="page-meta">
        <div class="page-num">SECCIÓN 10</div>
        <h1 class="page-title">Troubleshooting</h1>
        <p class="page-desc">Guía de diagnóstico y resolución de los errores más comunes durante la ejecución del kit.</p>
      </div>
    </div>
    <div class="section">
      <h2><span class="h2-icon">🔍</span> Cómo Interpretar el Log</h2>
      ${codeBlock('batch','# Buscar todos los errores en el log\nfindstr /c:"[ERROR]" NewADSetup.log\n\n# Ver log completo\ntype NewADSetup.log | more')}
      ${table(['Prefijo','Significado','Acción'],[
        ['[OK]','Operación exitosa','Ninguna'],
        ['[INFO]','El objeto ya existía, no se hizo nada','Ninguna'],
        ['[ERROR]','La operación falló','Revisar y corregir antes de re-ejecutar']
      ])}
    </div>
    <div class="section">
      <h2><span class="h2-icon">❌</span> Errores Comunes</h2>
      ${errores.map(e=>`
        <div class="card" style="margin-bottom:18px;--card-accent:var(--accent-red)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:16px">❌</span>
            <span style="font-size:14px;font-weight:700;color:var(--text-primary)">${e.titulo}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
            <div>
              <p style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:4px">SÍNTOMA</p>
              <code style="font-size:11px;color:var(--accent-red);background:rgba(255,75,79,0.08);padding:6px 10px;border-radius:4px;display:block">${e.sintoma}</code>
            </div>
            <div>
              <p style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:4px">CAUSA</p>
              <p style="font-size:12px;color:var(--text-secondary);margin:0">${e.causa}</p>
            </div>
          </div>
          <p style="font-size:11px;font-weight:700;color:var(--accent-green);margin-bottom:6px">✅ SOLUCIÓN</p>
          ${codeBlock(e.tipo, e.solucion)}
        </div>
      `).join('')}
    </div>
    <div class="section">
      <h2><span class="h2-icon">📞</span> Recursos de Soporte</h2>
      ${table(['Recurso','Descripción','Ubicación'],[
        ['NewADSetup.log','Registro completo de la ejecución','Carpeta del kit (Domain/)'],
        ['ABB Customer Support','Soporte oficial ABB','https://new.abb.com/service/support'],
        ['Documentación 800xA','Buscar "System Hardening" en la doc del sistema','Portal ABB Library'],
        ['CYATAM','Soporte de implementación','Contactar al equipo CYATAM']
      ])}
    </div>
  `;
}

// ── INIT ALL PAGES ────────────────────────────────────────────
function initAllPages() {
  renderOverview();
  renderDescripcion();
  renderEstructura();
  renderFlujo();
  renderScripts();
  renderAD();
  renderGPOs();
  renderSeguridad();
  renderGuia();
  renderPersonalizacion();
  renderTroubleshooting();
  // Inicializar highlight.js
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
  }
  // Registrar copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyCode(btn));
  });
}

// ── Exponer showPage globalmente ──────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'instant' });
  }
  const link = document.querySelector(`.nav-link[data-page="${id}"]`);
  if (link) link.classList.add('active');
}

document.addEventListener('DOMContentLoaded', initAllPages);
