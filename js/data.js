/* ============================================================
   CYATAM — ABB System Hardening Portal
   data.js — Todo el contenido de la documentación como datos JS
   ============================================================ */

const ABB_DATA = {

  // ─────────── OVERVIEW (Portada) ───────────
  overview: {
    sistemas: [
      { icon: '🏭', name: 'System 800xA', desc: 'Sistema de automatización de procesos (DCS/PCS) de clase mundial.', badge: '800xA', color: '#1E5FAD' },
      { icon: '⚡', name: 'Symphony Plus', desc: 'Control de plantas de generación de energía eléctrica.', badge: 'Splus', color: '#22D3A5' },
      { icon: '🔧', name: 'Freelance', desc: 'Sistema de control distribuido (DCS) compacto y flexible.', badge: 'Freelance', color: '#9B7FE8' }
    ],
    stats: [
      { num: '12', label: 'Scripts PowerShell' },
      { num: '57', label: 'GPOs incluidas' },
      { num: '29', label: 'OUs creadas' },
      { num: '103', label: 'Grupos AD' },
      { num: '8', label: 'Roles DCS' },
      { num: '21', label: 'Usuarios base' },
      { num: 'WS2025', label: 'Compatible ✅' }
    ],
    docs: [
      { num: '01', icon: '📋', title: 'Descripción General', desc: 'Contexto, propósito y sistemas soportados.', page: 'page-descripcion' },
      { num: '02', icon: '📁', title: 'Estructura de Directorios', desc: 'Mapa completo de archivos y carpetas del kit.', page: 'page-estructura' },
      { num: '03', icon: '⚙️', title: 'Flujo de Ejecución', desc: 'Cómo funciona el BAT principal paso a paso.', page: 'page-flujo' },
      { num: '04', icon: '💻', title: 'Scripts PowerShell', desc: 'Análisis detallado de los 12 scripts PS (incluye WS2025).', page: 'page-scripts' },
      { num: '05', icon: '🏢', title: 'Estructura AD', desc: 'OUs, Grupos, Roles y Usuarios que se crean.', page: 'page-ad' },
      { num: '06', icon: '🛡️', title: 'Catálogo GPOs', desc: 'Las 57 Group Policy Objects documentadas.', page: 'page-gpos' },
      { num: '07', icon: '🔐', title: 'Análisis de Seguridad', desc: 'Revisión de seguridad, riesgos y cumplimiento.', page: 'page-seguridad' },
      { num: '08', icon: '✅', title: 'Guía de Ejecución', desc: 'Checklist y guía paso a paso antes de ejecutar.', page: 'page-guia' },
      { num: '09', icon: '✏️', title: 'Personalización', desc: 'Cómo adaptar el kit a tu dominio y cliente.', page: 'page-personalizacion' },
      { num: '10', icon: '🐛', title: 'Troubleshooting', desc: 'Errores comunes y cómo resolverlos.', page: 'page-troubleshooting' },
      { num: '🆕', icon: '🖥️', title: 'Compatibilidad WS2025', desc: 'Cambios y scripts nuevos para Windows Server 2025.', page: 'page-ws2025' }
    ]
  },

  // ─────────── SCRIPTS POWERSHELL ───────────
  scripts: [
    {
      num: 'PS-00', file: 'ABB-00-CheckCompatibility.ps1', ver: '1.0',
      title: 'Verificación de Compatibilidad',
      desc: '🆕 WS2025 — Script de pre-vuelo que detecta el BuildNumber del OS del DC y determina el modo de compatibilidad (Legacy vs WS2025). Exporta el resultado para que el BAT ajuste su comportamiento automáticamente.',
      params: [ ['$LogFile', 'Ruta al archivo de log principal'], ['$TempFile', 'Archivo temporal donde se escribe el modo detectado'] ],
      logic: ['Obtiene Win32_OperatingSystem.BuildNumber vía CimInstance', 'Build >= 26100 → WS2025 | Build >= 14393 → Legacy', 'Verifica módulo GPMC y conectividad al dominio AD', 'Escribe el modo en un archivo .tmp que el BAT lee con SET /P', 'Alerta en pantalla sobre GPOs que serán omitidas en WS2025'],
      badge: 'Pre-vuelo'
    },
    {
      num: 'PS-01', file: 'ABB-01-CreateOUs.ps1', ver: '1.2',
      title: 'Crear Unidades Organizativas',
      desc: 'Crea la estructura jerárquica de OUs en Active Directory leyendo ouStructure.csv. Soporta hasta 4 niveles de profundidad.',
      params: [ ['$CSVFile', 'Ruta a ouStructure.csv'], ['$LogFile', 'Ruta al log de salida'], ['$ControlSystems', 'Filtro: 800xA, Splus, Freelance, All'] ],
      logic: ['Lee el CSV fila por fila y construye el LDAP path', 'Verifica existencia con [ADSI]::Exists("LDAP://...")', 'Crea la OU con New-ADOrganizationalUnit si no existe', 'Para la OU "Staging" → bloquea herencia GPO automáticamente', 'Registra cada acción como [OK], [INFO] o [ERROR]'],
      badge: 'Estructura AD'
    },
    {
      num: 'PS-02', file: 'ABB-02-CreateGroups.ps1', ver: '1.1',
      title: 'Crear Grupos de Seguridad',
      desc: 'Crea todos los grupos de seguridad en Active Directory. Si el grupo ya existe y está en la OU incorrecta, lo mueve automáticamente.',
      params: [ ['$CSVFile', 'Ruta a groupStructure.csv'], ['$LogFile', 'Ruta al log'], ['$ControlSystems', 'Filtro de sistema de control'] ],
      logic: ['Filtra grupos aplicables por campo GroupApplication', 'Si el grupo existe: verifica OU y GroupScope, corrige si es necesario', 'Para cambiar de Global → DomainLocal: pasa por Universal primero', 'Si no existe: New-ADGroup -GroupCategory Security', 'Mueve grupos a la OU correcta con Move-ADObject'],
      badge: 'Grupos'
    },
    {
      num: 'PS-03', file: 'ABB-03-CreateRoleGroups.ps1', ver: '1.0',
      title: 'Crear Grupos de Roles',
      desc: 'Crea los 8 grupos de rol DCS que funcionan como contenedores de permisos para los usuarios según su función.',
      params: [ ['$CSVFile', 'Ruta a roleStructure.csv'], ['$LogFile', 'Ruta al log'] ],
      logic: ['Lee los 8 roles del CSV', 'Crea grupos de tipo DomainLocal en OU=Roles,OU=ABB', 'Verifica existencia antes de crear', 'Los roles agrupan los grupos funcionales de cada sistema'],
      badge: 'Roles'
    },
    {
      num: 'PS-04', file: 'ABB-04-CreateRoleGroupsMembership.ps1', ver: '1.0',
      title: 'Membresía de Roles',
      desc: 'Agrega grupos funcionales como miembros de cada grupo de rol usando roleMembership.csv. Soporta hasta 80 membresías por rol.',
      params: [ ['$CSVFile', 'Ruta a roleMembership.csv'], ['$LogFile', 'Ruta al log'], ['$ControlSystems', 'Filtro de sistema'] ],
      logic: ['Lee las columnas MemberOf1..MemberOf80 por cada rol', 'Usa Add-ADGroupMember para cada membresía', 'Omite membresías vacías', 'Valida que el grupo destino exista'],
      badge: 'Membresía'
    },
    {
      num: 'PS-05', file: 'ABB-05-CreateUsers.ps1', ver: '1.0',
      title: 'Crear Usuarios',
      desc: 'Crea o actualiza cuentas de usuario. Para usuarios existentes actualiza membresía y OU. Soporta hasta 103 membresías por usuario.',
      params: [ ['$CSVFile', 'Ruta a userMembership.csv'], ['$LogFile', 'Ruta al log'], ['$ControlSystems', 'Filtro'] ],
      logic: ['Si el usuario existe: actualiza grupos y mueve OU si es necesario', 'Si no existe: New-ADUser con flags de contraseña del CSV', 'Flags: MustChange, CannotChange, NeverExpires', 'Agrega usuario a grupos MemberOf1..MemberOf103'],
      badge: 'Usuarios'
    },
    {
      num: 'PS-06', file: 'ABB-06-CreateMigrationTable.ps1', ver: '1.0',
      title: 'Migration Table',
      desc: 'Adapta ABBGPO.migtable al dominio actual reemplazando referencias a ABB.CYATAM con el dominio real del cliente.',
      params: [ ['$MigTableFile', 'Ruta al archivo .migtable'], ['$LogFile', 'Ruta al log'], ['$xAServiceAccountName', 'Nombre cuenta servicio 800xA'], ['$localAdminAccountName', 'Nombre cuenta admin local'] ],
      logic: ['Lee el dominio actual con (Get-ADDomain).DNSRoot', 'Reemplaza cadenas de ABB.CYATAM por el dominio real', 'Actualiza nombres de cuentas especiales', 'Guarda el .migtable actualizado para PS-08'],
      badge: 'Migración'
    },
    {
      num: 'PS-07', file: 'ABB-07-CreateWMIFilters.ps1', ver: '1.0',
      title: 'Filtros WMI',
      desc: 'Crea filtros WMI que permiten que las GPOs se apliquen solo a equipos con el software ABB correcto instalado.',
      params: [ ['$LogFile', 'Ruta al log'], ['$ControlSystems', 'Filtro de sistema'] ],
      logic: ['Crea WMI-800xAComputers → detecta instalaciones 800xA', 'Crea WMI-SPlusComputers → detecta Symphony Plus', 'Crea WMI-FreelanceComputers → detecta Freelance', 'Los filtros se vinculan a las GPOs en PS-09'],
      badge: 'WMI'
    },
    {
      num: 'PS-08', file: 'ABB-08-ImportGPOs.ps1', ver: '1.0',
      title: 'Importar GPOs (Legacy)',
      desc: 'Lee el manifest.xml y importa las ~57 GPOs desde la carpeta Policies/, vinculándolas al dominio. Se usa en WS2016/2019/2022.',
      params: [ ['$GPOFilesLocation', 'Ruta carpeta Policies/'], ['$MigTableFile', 'Ruta al .migtable actualizado'], ['$LogFile', 'Ruta al log'], ['$ControlSystems', 'Filtro'] ],
      logic: ['Lee manifest.xml para lista de GPOs disponibles', 'Filtra por ControlSystems las que aplican', 'New-GPO para crear y Import-GPO para cargar config', 'New-GPLink para vincular al dominio las marcadas con "L"'],
      badge: 'GPOs'
    },
    {
      num: 'PS-08b', file: 'ABB-08b-ImportGPOs-WS2025.ps1', ver: '1.0',
      title: 'Importar GPOs (WS2025)',
      desc: '🆕 WS2025 — Versión de PS-08 que omite automáticamente las GPOs incompatibles con Windows Server 2025. El BAT elige este script en lugar de PS-08 cuando detecta WS2025.',
      params: [ ['$GPOFilesLocation', 'Ruta carpeta Policies/'], ['$MigTableFile', 'Ruta al .migtable actualizado'], ['$LogFile', 'Ruta al log'], ['$ControlSystems', 'Filtro'] ],
      logic: ['GPOs omitidas: IE11 (IE eliminado), Block Windows 10 Apps (API legacy)', 'Lee manifest.xml para iterar todos los backups de GPOs', 'Llama a Should-SkipGPO() para filtrar incompatibles', 'Registra con [INFO-WS2025] cada GPO omitida y la razón', 'Imprime resumen final: importadas vs omitidas'],
      badge: 'GPOs WS2025'
    },
    {
      num: 'PS-09', file: 'ABB-09-SetGPOPermissions.ps1', ver: '1.0',
      title: 'Permisos de GPOs',
      desc: 'Configura los permisos de seguridad de cada GPO según gpoPermission.csv, controlando qué grupos aplican o leen cada política.',
      params: [ ['$CSVFile', 'Ruta a gpoPermission.csv'], ['$LogFile', 'Ruta al log'], ['$ControlSystems', 'Filtro'] ],
      logic: ['"A" → GpoApply: el grupo aplica la política', '"R" → GpoRead: el grupo solo puede leer', '"X" → Sin acceso a la GPO', 'Usa Set-GPPermission para cada combinación GPO/Grupo'],
      badge: 'Permisos'
    },
    {
      num: 'PS-10', file: 'ABB-10-CreateAndSetFineGrainedPasswordPolicy.ps1', ver: '1.0',
      title: 'Fine-Grained Password Policy',
      desc: 'Crea una política de contraseñas especial para cuentas de servicio: sin bloqueo de cuenta y contraseña que no expira.',
      params: [ ['$LogFile', 'Ruta al log'] ],
      logic: ['Crea PSO (Password Settings Object) "FGPP-Service Accounts"', 'Aplica al grupo "FGPP-Service Accounts"', 'Sin bloqueo de cuenta (LockoutThreshold = 0)', 'Contraseña de mayor longitud mínima que usuarios normales'],
      badge: 'FGPP'
    }
  ],

  // ─────────── GPOs ───────────
  gpos: {
    general: [
      { name: 'ABB Security - Account Lockout Settings (v1.0) - COMP', linked: true, desc: 'Bloqueo de cuentas tras intentos fallidos de login.' },
      { name: 'ABB Security - Account Password Settings (v1.0) - COMP', linked: true, desc: 'Política de contraseñas del dominio: longitud mínima, complejidad, historial.' },
      { name: 'ABB Security - Account Secure Local Accounts (v1.0) - COMP', linked: true, desc: 'Seguridad de cuentas locales, incluyendo renombrar/deshabilitar Administrator.' },
      { name: 'ABB Security - Adobe Acrobat Reader (v1.0) - ALL', linked: true, desc: 'Endurecimiento de Adobe Acrobat Reader.' },
      { name: 'ABB Security - Audit Settings (v1.1) - COMP', linked: true, desc: 'Auditoría avanzada: inicio de sesión, cambios de permisos, acceso a objetos.' },
      { name: 'ABB Security - Block Windows 10 Apps (v1.1) - COMP', linked: true, desc: 'Bloquea aplicaciones de la Tienda de Windows en los equipos.' },
      { name: 'ABB Security - Deny Logon (v1.1) - COMP', linked: true, desc: 'Aplica reglas de denegación de inicio de sesión según membresía de grupos.' },
      { name: 'ABB Security - General Computer Settings (v1.2) - COMP', linked: true, desc: 'Configuración general de seguridad para todos los equipos del dominio.' },
      { name: 'ABB Security - General Computer Settings for Domain Controllers (v1.0) - COMP', linked: false, desc: 'Seguridad específica para los controladores de dominio (vinculada a OU DC).', dcOnly: true },
      { name: 'ABB Security - General User Settings (v1.1) - USER', linked: true, desc: 'Configuración general de seguridad del entorno de usuario.' },
      { name: 'ABB Security - IIS Hardening (v1.0) - COMP', linked: true, desc: 'Endurecimiento de IIS — solo aplica al grupo GPO-Filter-IIS Servers.' },
      { name: 'ABB Security - Known Issues (v1.0) - COMP', linked: true, desc: 'Correcciones y workarounds para problemas conocidos de Windows.' },
      { name: 'ABB Security - Logon Display Message (v1.0) - COMP', linked: true, desc: 'Mensaje de aviso legal en la pantalla de inicio de sesión.' },
      { name: 'ABB Security - MS Office (v1.0) - USER', linked: true, desc: 'Endurecimiento y configuración de Microsoft Office.' },
      { name: 'ABB Security - Operator Lockdown (v1.2) - USER', linked: true, desc: 'Restricciones de escritorio para roles de Operador, Supervisor y Read Only.' },
      { name: 'ABB Security - Regional Settings (v1.1) - USER', linked: true, desc: 'Configuración regional unificada para todos los roles de usuario.' },
      { name: 'ABB Security - Remote Desktop Enable (v1.1) - COMP', linked: true, desc: 'Habilita el escritorio remoto en los equipos del dominio.' },
      { name: 'ABB Security - Remote Desktop Lockdown (v1.0) - COMP', linked: true, desc: 'Restringe capacidades dentro de sesiones RDP.' },
      { name: 'ABB Security - Removable Media Disable (v1.1) - COMP', linked: true, desc: 'Deshabilita USB y unidades ópticas en todos los equipos.' },
      { name: 'ABB Security - Removable Media Enable (v1.1) - COMP', linked: false, desc: 'Habilita medios removibles (alternativa — vincular manualmente si se necesita).' },
      { name: 'ABB Security - SmartCard (v1.0) - COMP', linked: false, desc: 'Configuración de tarjeta inteligente (opcional).' },
      { name: 'ABB Security - SNMP Community (v1.0) - COMP', linked: true, desc: 'Configura la comunidad SNMP segura en los equipos.' },
      { name: 'ABB Security - User Rights Assignments (v1.1) - COMP', linked: true, desc: 'Control granular de privilegios del sistema operativo.' },
      { name: 'ABB Security - User Rights Assignments for Domain Controllers (v1.0) - COMP', linked: false, desc: 'Derechos de usuario específicos para DCs.', dcOnly: true },
      { name: 'ABB Security - Visual Effects (v1.0) - USER', linked: true, desc: 'Desactiva animaciones y efectos para mejorar el rendimiento.' },
      { name: 'ABB Security - Windows Firewall (v1.1) - COMP', linked: true, desc: 'Configuración del Firewall de Windows Defender.' },
      { name: 'ABB Security - Windows Update Service (v1.0) - COMP', linked: true, desc: 'Controla el comportamiento de Windows Update.' },
      { name: 'ABB Security - Allow Scheduled Tasks Credentials Caching (v1.0) - COMP', linked: true, desc: 'Para servidores que necesitan ejecutar tareas programadas con credenciales.' }
    ],
    opcionales: [
      { name: 'ABB Optional - Autologon (v1.0) - COMP', linked: false, desc: 'Inicio de sesión automático para thin clients sin intervención del usuario.' },
      { name: 'ABB Optional - Background (v1.0) - ALL', linked: true, desc: 'Fondo de escritorio corporativo ABB con información del sistema (BGInfo).' },
      { name: 'ABB Optional - DE Keyboard Layout (v1.0) - ALL', linked: false, desc: 'Distribución de teclado alemán — solo para proyectos en Alemania.' },
      { name: 'ABB Optional - DE Secure Datatransfer (v1.0) - USER', linked: false, desc: 'Transferencia segura de datos (específico Alemania).' },
      { name: 'ABB Optional - Inverted Mouse Cursor (v1.0) - USER', linked: false, desc: 'Cursor de ratón invertido (alta visibilidad).' },
      { name: 'ABB Optional - ReUse Library Requirements (v1.0) - USER', linked: false, desc: 'Requisitos para la biblioteca de reutilización de ABB.' },
      { name: 'ABB Optional - Thin Client Writer Filter Active (v1.0) - COMP', linked: false, desc: 'Activa el filtro de escritura en thin clients (protege el SO).' },
      { name: 'ABB Optional - Thin Client Writer Filter Inactive (v1.0) - COMP', linked: false, desc: 'Desactiva el filtro de escritura (para mantenimiento).' },
      { name: 'ABB Optional - W81 Windows Border (v1.0) - USER', linked: false, desc: 'Borde de ventana estilo Windows 8.1.' }
    ],
    xA800: [
      { name: 'ABB 800xA - WMI Unique Identifier (v1.0) - COMP', linked: true, desc: 'Identificador WMI único para equipos 800xA.' },
      { name: 'ABB 800xA - Pre-Requisites (v1.1) - ALL', linked: true, desc: 'Configura pre-requisitos del sistema operativo para 800xA.' },
      { name: 'ABB 800xA - Windows Services (v1.1) - COMP', linked: true, desc: 'Configura servicios de Windows requeridos por 800xA.' },
      { name: 'ABB 800xA Security - Batch (v1.0) - USER', linked: false, desc: 'Configuración de seguridad para scripts batch de 800xA.' },
      { name: 'ABB 800xA Security - Melody Connect (v1.1) - USER', linked: false, desc: 'Configuración de Melody Connect.' },
      { name: 'ABB 800xA Security - MS Office for Harmony & Melody (v1.0) - USER', linked: false, desc: 'Office para sistemas Harmony y Melody.' },
      { name: 'ABB 800xA Security - Remote Desktop (v1.0) - COMP', linked: true, desc: 'Configuración RDP específica para equipos 800xA.' },
      { name: 'ABB 800xA Security - Start Workplace (v1.0) - USER', linked: true, desc: 'Entorno de trabajo del 800xA: restricciones de escritorio.' },
      { name: 'ABB 800xA Security - User Account Control (v1.0) - COMP', linked: true, desc: 'Configuración UAC para equipos 800xA.' }
    ],
    splus: [
      { name: 'ABB SPlus - WMI Unique Identifier (v1.0) - COMP', linked: true, desc: 'Identificador WMI único para equipos Symphony Plus.' },
      { name: 'ABB SPlus Security - IE11 (v1.0) - USER', linked: true, desc: 'Configuración de Internet Explorer 11 para S+. ⚠️ OMITIDA en WS2025 (IE11 no existe).', ws2025skip: true },
      { name: 'ABB SPlus Security - Remote Desktop (v1.0) - COMP', linked: true, desc: 'RDP específico para equipos Symphony Plus.' },
      { name: 'ABB SPlus Security - Start Workplace (v1.0) - USER', linked: true, desc: 'Entorno de trabajo de S+: restricciones de escritorio según rol.' },
      { name: 'ABB SPlus Security - User Account Control (v1.0) - COMP', linked: true, desc: 'UAC para equipos Symphony Plus.' },
      { name: 'ABB SPlus Security - User Rights Assignments (v1.0) - COMP', linked: true, desc: 'Derechos de usuario para todos los equipos S+.' },
      { name: 'ABB SPlus Security - User Rights Assignments for Engineering (v1.0) - COMP', linked: true, desc: 'Derechos adicionales para estaciones de ingeniería S+.' },
      { name: 'ABB SPlus Security - User Rights Assignments for History (v1.0) - COMP', linked: true, desc: 'Derechos para servidores de historización S+.' }
    ],
    freelance: [
      { name: 'ABB Freelance - WMI Unique Identifier (v1.0) - COMP', linked: true, desc: 'Identificador WMI único para equipos Freelance.' },
      { name: 'ABB Freelance Security - Start Workplace (v1.0) - USER', linked: true, desc: 'Entorno de trabajo de Freelance según rol de usuario.' },
      { name: 'ABB Freelance Security - User Rights Assignments (v1.0) - COMP', linked: true, desc: 'Derechos de usuario para equipos Freelance.' }
    ]
  },

  // ─────────── ROLES ───────────
  roles: [
    { nombre: 'System Administrator', ou: 'Administrators', winLogin: '✅', rdp: '✅', localAdmin: '✅', dcsAccess: 'Admin total', grupos: 11 },
    { nombre: 'DCS Administrator', ou: 'Administrators', winLogin: '✅', rdp: '✅', localAdmin: '✅', dcsAccess: 'Admin DCS + Windows', grupos: 24 },
    { nombre: 'DCS System Engineer', ou: 'Engineers', winLogin: '✅', rdp: '✅', localAdmin: '❌', dcsAccess: 'Admin sistema DCS', grupos: 12 },
    { nombre: 'DCS Application Engineer', ou: 'Engineers', winLogin: '✅', rdp: '✅', localAdmin: '❌', dcsAccess: 'Apps y gráficos DCS', grupos: 11 },
    { nombre: 'System User', ou: 'Read Only', winLogin: '✅', rdp: '✅', localAdmin: '❌', dcsAccess: 'Vista de recursos', grupos: 7 },
    { nombre: 'DCS Supervisor', ou: 'Supervisors', winLogin: '✅', rdp: '❌', localAdmin: '❌', dcsAccess: 'Operación limitada', grupos: 9 },
    { nombre: 'DCS Operator', ou: 'Operators', winLogin: '✅', rdp: '❌', localAdmin: '❌', dcsAccess: 'Solo operación DCS', grupos: 5 },
    { nombre: 'DCS Read Only', ou: 'Read Only', winLogin: '✅', rdp: '❌', localAdmin: '❌', dcsAccess: 'Solo lectura DCS', grupos: 4 }
  ],

  // ─────────── USUARIOS BASE ───────────
  usuarios: {
    escape: [
      { user: 'tmpAdmin', ou: 'Administrators', tipo: '⚠️ Escape', desc: 'Cuenta de emergencia. Domain Admin completo + DCS Admin. CRÍTICO: proteger con contraseña fuerte.' },
      { user: 'DomainAdmin', ou: 'Administrators', tipo: '🔑 Admin', desc: 'Administrador de dominio estándar.' },
      { user: 'DomainUser', ou: 'Read Only', tipo: '👤 Usuario', desc: 'Usuario de dominio básico con rol System User.' }
    ],
    dcs: [
      { user: 'DCSSysAdmin', ou: 'Administrators', rol: 'DCS Administrator' },
      { user: 'DCSAppEngineer', ou: 'Engineers', rol: 'DCS Application Engineer' },
      { user: 'DCSOperator', ou: 'Operators', rol: 'DCS Operator' },
      { user: 'DCSGuest', ou: 'Read Only', rol: 'DCS Read Only' },
      { user: 'DCSSupervisor', ou: 'Supervisors', rol: 'DCS Supervisor' },
      { user: 'DCSEngineer', ou: 'Engineers', rol: 'DCS System Engineer' }
    ],
    servicios: [
      { user: '800xAService', sistema: '800xA', desc: 'Todos los servicios del sistema 800xA.' },
      { user: '800xAInstaller', sistema: '800xA', desc: 'Cuenta de instalación de 800xA (admin).' },
      { user: 'SPlusIMDataService', sistema: 'S+', desc: 'ABB S+ Operations History Server.' },
      { user: 'SPlusIMEventService', sistema: 'S+', desc: 'DBLimiter, EventImport, ConMea.' },
      { user: 'SPlusIMReportUser', sistema: 'S+', desc: 'ReportScheduler — puede iniciar sesión local.' },
      { user: 'SPlusIMScanner', sistema: 'S+', desc: 'ScanManager — acceso desde red.' },
      { user: 'SPlusIMServiceUser', sistema: 'S+', desc: 'DBLimiter, EventImport — múltiples servicios.' },
      { user: 'SPlusOServiceUser', sistema: 'S+', desc: 'Compressor, History, LifeCheck, Red Proxy, TagSync.' },
      { user: 'SplusEngServiceUser', sistema: 'S+', desc: 'License Server, Application Pool Identity.' },
      { user: 'SQLServerAgentUser', sistema: 'S+', desc: 'SQL Server Agent (MSSQLSERVER).' },
      { user: 'SQLServerUser', sistema: 'S+', desc: 'SQL Server (instancia MSSQLSERVER).' },
      { user: 'SPlusIMWDService', sistema: 'S+', desc: 'Servicio general Symphony Plus.' }
    ]
  },

  // ─────────── TROUBLESHOOTING ───────────
  errores: [
    {
      titulo: 'Módulo ActiveDirectory no disponible',
      sintoma: 'Import-Module : No se puede cargar el módulo ActiveDirectory',
      causa: 'Las herramientas RSAT-AD no están instaladas en el equipo.',
      solucion: '# En Windows Server\nInstall-WindowsFeature RSAT-AD-PowerShell\n\n# En Windows 10/11\nAdd-WindowsCapability -Online -Name "Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0"',
      tipo: 'powershell'
    },
    {
      titulo: 'Access is denied al crear OUs o Grupos',
      sintoma: 'New-ADOrganizationalUnit : Acceso Denegado',
      causa: 'El usuario que ejecuta el script no tiene permisos de Domain Admin.',
      solucion: '# Verificar rol Domain Admin del usuario actual\n$principal = [Security.Principal.WindowsPrincipal]([Security.Principal.WindowsIdentity]::GetCurrent())\n$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)',
      tipo: 'powershell'
    },
    {
      titulo: 'The server is not operational',
      sintoma: 'Get-ADDomain : El servidor no está operativo',
      causa: 'El script se ejecuta en un equipo que no puede contactar al DC o no es miembro del dominio.',
      solucion: '# Verificar conectividad al DC\nnltest /dsgetdc:NOMBRE_DOMINIO\n\n# Verificar membresía al dominio\n(Get-WmiObject Win32_ComputerSystem).PartOfDomain',
      tipo: 'batch'
    },
    {
      titulo: 'The migration table entry is missing',
      sintoma: 'Import-GPO : The migration table entry is missing for ...',
      causa: 'La tabla ABBGPO.migtable no fue actualizada con el nombre real del dominio (PS-06 falló).',
      solucion: '# Restaurar migration table original y re-ejecutar\ncopy /Y Scripts\\ABBGPO.migtable.org Scripts\\ABBGPO.migtable\n\n# Luego volver a ejecutar el setup\nABB-Setup-ActiveDirectory.bat',
      tipo: 'batch'
    },
    {
      titulo: 'El script se detiene con "error in preparing AD"',
      sintoma: '--ERROR-- An error was found in preparing Active Directory...',
      causa: 'El mecanismo anti-error detectó [ERROR] en el log. Las GPOs NO se importan para proteger el acceso al dominio.',
      solucion: '# Buscar los errores específicos en el log\nfindstr /c:"[ERROR]" NewADSetup.log\n\n# Una vez resueltos, re-ejecutar (es idempotente)\nABB-Setup-ActiveDirectory.bat',
      tipo: 'batch'
    },
    {
      titulo: 'Usuarios no pueden iniciar sesión tras la instalación',
      sintoma: 'Login fallido para usuarios con roles correctamente asignados.',
      causa: 'Los usuarios no son miembros del grupo LogonLocally (controlado por GPO).',
      solucion: '# Verificar membresía del usuario\nGet-ADUser "nombre_user" -Properties MemberOf | Select -ExpandProperty MemberOf\n\n# Agregar al grupo LogonLocally\nAdd-ADGroupMember -Identity "LogonLocally" -Members "nombre_user"',
      tipo: 'powershell'
    }
  ],

  // ─────────── CHECKLIST GUIA ───────────
  checklist: {
    entorno: [
      { texto: 'Estás conectado al Domain Controller primario (FSMO Role Holder)', critico: false },
      { texto: 'Tienes permisos de Domain Admin en el dominio destino', critico: true },
      { texto: 'El dominio está operativo y puede contactar al DC', critico: false },
      { texto: 'Tienes acceso físico o iDRAC/iLO al DC (por si RDP falla)', critico: true },
      { texto: 'Tienes al menos 500 MB libres en %windir%', critico: false }
    ],
    cuentas: [
      { texto: 'CRÍTICO: Tienes UNA cuenta alternativa con Domain Admin (diferente al Administrator predeterminado)', critico: true },
      { texto: 'Has verificado que esa cuenta alternativa funciona (login exitoso)', critico: true },
      { texto: 'Has documentado las credenciales de tmpAdmin en gestor de contraseñas', critico: true },
      { texto: 'Conoces el nombre para la cuenta de servicio 800xA (default: 800xAService)', critico: false },
      { texto: 'Conoces el nombre para la cuenta admin local (default: localAdmin)', critico: false }
    ],
    archivos: [
      { texto: 'Revisaste ouStructure.csv — Las OUs son correctas para este proyecto', critico: false },
      { texto: 'Revisaste groupStructure.csv — Todos los grupos son necesarios', critico: false },
      { texto: 'Revisaste userMembership.csv — Los usuarios base son correctos', critico: false },
      { texto: 'Bginfo.exe está en la carpeta Background/', critico: false },
      { texto: 'La carpeta Policies/ contiene las 57 subcarpetas de GPOs', critico: true },
      { texto: 'El archivo ABBGPO.migtable.org existe (backup de migration table)', critico: true }
    ],
    backup: [
      { texto: 'Hiciste System State Backup del Domain Controller', critico: true },
      { texto: 'El backup está verificado y es recuperable', critico: true },
      { texto: 'Tienes documentada la contraseña del DSRM', critico: true }
    ]
  }
};
