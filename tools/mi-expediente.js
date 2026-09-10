// Integración con Mi Expediente — MVC Abogados
// Permite guardar los documentos generados en Herramientas directamente en la
// colección `documentos` de Firestore del mismo proyecto Firebase que usa
// Mi Expediente (https://miexpediente-pwa.onrender.com/), autenticando con la
// misma cuenta profesional (Firebase Auth, colección `usuarios`, rol
// 'profesional'). No requiere ningún backend propio de Herramientas.
//
// La config de Firebase de abajo es la config pública "web" del proyecto
// (no es secreta: la seguridad la impone firestore.rules, no esta config).

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCwJLlXSPN4dyyMbsiUi4n80hNk_a_LMuI',
  authDomain: 'miexpediente-a99fb.firebaseapp.com',
  projectId: 'miexpediente-a99fb',
  storageBucket: 'miexpediente-a99fb.firebasestorage.app',
  messagingSenderId: '31947233280',
  appId: '1:31947233280:web:6ba659ccd2408da9c9e0e5',
};

const FIREBASE_SDK_VERSION = '9.23.0';

let firebasePromise = null;

function cargarScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar el SDK de Firebase (' + src + ').'));
    document.head.appendChild(s);
  });
}

// Carga el SDK compat de Firebase bajo demanda (solo cuando se usa esta
// función por primera vez) e inicializa la app una única vez.
async function obtenerFirebase() {
  if (!firebasePromise) {
    firebasePromise = (async () => {
      const base = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/`;
      await cargarScript(base + 'firebase-app-compat.js');
      await cargarScript(base + 'firebase-auth-compat.js');
      await cargarScript(base + 'firebase-firestore-compat.js');
      if (!window.firebase.apps.length) window.firebase.initializeApp(FIREBASE_CONFIG);
      return { firebase: window.firebase, auth: window.firebase.auth(), db: window.firebase.firestore() };
    })();
  }
  return firebasePromise;
}

function mensajeErrorAuth(err) {
  const codigo = err && err.code;
  if (codigo === 'auth/invalid-email') return 'El email ingresado no es válido.';
  if (codigo === 'auth/user-not-found' || codigo === 'auth/wrong-password' || codigo === 'auth/invalid-credential') {
    return 'Email o contraseña incorrectos.';
  }
  if (codigo === 'auth/too-many-requests') return 'Demasiados intentos fallidos. Probá de nuevo en unos minutos.';
  if (codigo === 'permission-denied') return 'Tu usuario inició sesión, pero no tiene permisos de profesional en Mi Expediente. Consultá con Mario.';
  return 'Ocurrió un error inesperado: ' + (err && err.message ? err.message : String(err));
}

function crearModalLogin() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
    <div style="background:var(--color-card-bg,#fff);color:var(--color-text,#1a1a1a);border-radius:10px;padding:24px;max-width:360px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.25)">
      <h3 style="margin:0 0 4px;font-size:1.05rem">Iniciar sesión en Mi Expediente</h3>
      <p style="margin:0 0 16px;font-size:.82rem;color:var(--color-muted,#666)">Usá la misma cuenta profesional con la que entrás a Mi Expediente.</p>
      <div class="field-group" style="margin-bottom:10px">
        <label for="me-login-email">Email</label>
        <input type="email" id="me-login-email" autocomplete="username" placeholder="nombre@estudio.com">
      </div>
      <div class="field-group" style="margin-bottom:6px">
        <label for="me-login-pass">Contraseña</label>
        <input type="password" id="me-login-pass" autocomplete="current-password">
      </div>
      <div id="me-login-error" style="display:none;color:#c0392b;font-size:.8rem;margin-bottom:10px"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
        <button type="button" class="btn btn-ghost" id="me-login-cancelar">Cancelar</button>
        <button type="button" class="btn btn-primary" id="me-login-ingresar">Ingresar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

// Pide login por email/contraseña y devuelve el usuario autenticado.
// Se resuelve en null si el usuario cancela.
function pedirLogin(auth) {
  return new Promise((resolve) => {
    const overlay = crearModalLogin();
    const inpEmail = overlay.querySelector('#me-login-email');
    const inpPass = overlay.querySelector('#me-login-pass');
    const divError = overlay.querySelector('#me-login-error');
    const btnIngresar = overlay.querySelector('#me-login-ingresar');
    const btnCancelar = overlay.querySelector('#me-login-cancelar');

    const cerrar = (resultado) => { overlay.remove(); resolve(resultado); };

    btnCancelar.addEventListener('click', () => cerrar(null));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(null); });

    async function intentarLogin() {
      const email = inpEmail.value.trim();
      const pass = inpPass.value;
      divError.style.display = 'none';
      if (!email || !pass) {
        divError.textContent = 'Completá email y contraseña.';
        divError.style.display = '';
        return;
      }
      btnIngresar.disabled = true;
      btnIngresar.textContent = 'Ingresando...';
      try {
        const cred = await auth.signInWithEmailAndPassword(email, pass);
        cerrar(cred.user);
      } catch (err) {
        divError.textContent = mensajeErrorAuth(err);
        divError.style.display = '';
        btnIngresar.disabled = false;
        btnIngresar.textContent = 'Ingresar';
      }
    }
    btnIngresar.addEventListener('click', intentarLogin);
    inpPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') intentarLogin(); });
    inpEmail.focus();
  });
}

/**
 * Conecta un botón "Guardar en Mi Expediente" ya presente en el DOM.
 *
 * @param {HTMLButtonElement} btn        Botón sobre el que se engancha el click.
 * @param {Object}   opts
 * @param {string}   opts.herramienta    Clave de la herramienta de origen (ej: 'presupuestos').
 * @param {string}   opts.categoria      Categoría legible para clasificación (ej: 'Presupuestos').
 * @param {HTMLTextAreaElement} opts.textarea  Textarea con el texto generado a guardar.
 * @param {Function} opts.obtenerMeta    () => ({ titulo, cliente, rama, subtipo }) — metadatos
 *                                       tomados en el momento del click.
 */
export function initGuardarMiExpediente(btn, opts) {
  if (!btn) return;
  const textoOriginal = btn.textContent;

  btn.addEventListener('click', async () => {
    const contenido = (opts.textarea && opts.textarea.value || '').trim();
    if (!contenido) return;

    btn.disabled = true;
    btn.textContent = 'Conectando…';
    try {
      const { firebase, auth, db } = await obtenerFirebase();

      let user = auth.currentUser;
      if (!user) {
        user = await pedirLogin(auth);
        if (!user) { btn.disabled = false; btn.textContent = textoOriginal; return; }
      }

      btn.textContent = 'Guardando…';
      const meta = (opts.obtenerMeta && opts.obtenerMeta()) || {};

      await db.collection('documentos').add({
        herramienta: opts.herramienta,
        categoria: opts.categoria,
        rama: meta.rama || null,
        subtipo: meta.subtipo || null,
        titulo: meta.titulo || opts.categoria,
        clienteNombre: meta.cliente || null,
        contenido,
        profesionalId: user.uid,
        profesionalNombre: user.displayName || user.email,
        estado: 'borrador',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      btn.textContent = 'Guardado ✓';
    } catch (err) {
      console.error('[MiExpediente] Error al guardar:', err);
      alert(mensajeErrorAuth(err));
      btn.textContent = textoOriginal;
    } finally {
      btn.disabled = false;
      setTimeout(() => { btn.textContent = textoOriginal; }, 2500);
    }
  });
}
