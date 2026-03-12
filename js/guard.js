/* ============================================================
   CYATAM — ABB System Hardening Portal
   guard.js — Protección de integridad de autoría
   © 2026 Angel Magadan — CYATAM
   ============================================================ */
(function () {
  'use strict';

  // Firma esperada del footer (no modificar)
  const _SIG = '\u00a9 2026 \u2014 Hecho por Angel Magadan';
  const _PASS = (function () {
    // Contraseña almacenada como códigos de carácter para dificultar edición directa
    return [73,108,117,109,105,110,97,116,105,55,56,46]
      .map(c => String.fromCharCode(c)).join('');
  })();

  // ── Modal de bloqueo ─────────────────────────────────────
  function buildLockScreen() {
    const overlay = document.createElement('div');
    overlay.id = '__lock_overlay__';
    overlay.style.cssText = [
      'position:fixed','inset:0','z-index:99999',
      'background:rgba(255,255,255,0.97)',
      'backdrop-filter:blur(8px)',
      'display:flex','align-items:center','justify-content:center',
      'flex-direction:column','gap:20px','font-family:Inter,sans-serif'
    ].join(';');

    overlay.innerHTML = `
      <img src="assets/logo-cyatam.png" style="height:48px;opacity:0.9" alt="CYATAM"/>
      <div style="text-align:center;max-width:380px">
        <div style="font-size:42px;margin-bottom:12px">🔒</div>
        <h2 style="font-size:20px;font-weight:800;color:#0D1B35;margin:0 0 8px">
          Contenido protegido
        </h2>
        <p style="font-size:13px;color:#5A6478;line-height:1.6;margin:0 0 24px">
          Se detectó una modificación no autorizada en esta aplicación.<br/>
          Ingresa la contraseña de administrador para continuar.
        </p>
        <input id="__unlock_input__" type="password" placeholder="Contraseña..."
          style="width:100%;padding:11px 16px;border:2px solid #D8E3F0;border-radius:8px;
                 font-size:14px;font-family:inherit;outline:none;color:#0D1B35;
                 background:#F4F6FA;box-sizing:border-box;margin-bottom:10px"/>
        <button id="__unlock_btn__"
          style="width:100%;padding:11px;background:#1E5FAD;color:#fff;border:none;
                 border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;
                 font-family:inherit">
          Desbloquear
        </button>
        <p id="__unlock_err__"
          style="font-size:12px;color:#C0392B;margin-top:8px;display:none">
          Contraseña incorrecta. Acceso denegado.
        </p>
      </div>
      <p style="font-size:10px;color:#B0C4DE;position:absolute;bottom:16px">
        © 2026 Angel Magadan — CYATAM
      </p>
    `;
    document.body.appendChild(overlay);

    // Evento del botón
    const btn = overlay.querySelector('#__unlock_btn__');
    const inp = overlay.querySelector('#__unlock_input__');
    const err = overlay.querySelector('#__unlock_err__');

    function tryUnlock() {
      if (inp.value === _PASS) {
        overlay.remove();
        sessionStorage.setItem('__cyatam_auth__', '1');
      } else {
        err.style.display = 'block';
        inp.value = '';
        inp.focus();
        inp.style.borderColor = '#C0392B';
        setTimeout(() => { inp.style.borderColor = '#D8E3F0'; }, 1500);
      }
    }

    btn.addEventListener('click', tryUnlock);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
    inp.focus();
  }

  // ── Verificación de integridad ────────────────────────────
  function checkIntegrity() {
    // Si ya fue autenticado en esta sesión, no volver a pedir
    if (sessionStorage.getItem('__cyatam_auth__') === '1') return;

    const el = document.getElementById('__footer_sig__');
    if (!el || el.textContent.trim() !== _SIG) {
      buildLockScreen();
    }
  }

  // Esperar a que el DOM esté listo y verificar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(checkIntegrity, 800));
  } else {
    setTimeout(checkIntegrity, 800);
  }

  // Verificar también si alguien mutó el DOM después de carga
  const _observer = new MutationObserver(() => {
    if (sessionStorage.getItem('__cyatam_auth__') === '1') return;
    const el = document.getElementById('__footer_sig__');
    if (el && el.textContent.trim() !== _SIG) {
      buildLockScreen();
      _observer.disconnect();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    _observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();
