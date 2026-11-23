document.addEventListener("DOMContentLoaded", () => {
  initMenuHamburguesa();
  initDashboard();
  initModales();
  initValidacionFormularios();
});

/* ==========================================================================
   1. MENÚ HAMBURGUESA PARA MÓVILES
   ========================================================================== */
function initMenuHamburguesa() {
  const btnMenu = document.getElementById("btn-menu");
  const nav = document.getElementById("sidebar-nav");
  if (!btnMenu || !nav) return;

  btnMenu.addEventListener("click", () => {
    const abierto = nav.classList.toggle("is-open");
    btnMenu.setAttribute("aria-expanded", abierto);
    btnMenu.textContent = abierto ? "✕" : "☰";
  });

  // Cerrar el menú al pulsar cualquier enlace en móvil
  nav.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      nav.classList.remove("is-open");
      btnMenu.setAttribute("aria-expanded", "false");
      btnMenu.textContent = "☰";
    });
  });
}

/* ==========================================================================
   2. RENDERIZADO DINÁMICO DEL DASHBOARD + BUSCADOR / FILTRO EN TIEMPO REAL
   ========================================================================== */
function initDashboard() {
  const listaPartidos = document.getElementById("lista-partidos");
  if (!listaPartidos || typeof PARTIDOS_MOCK === "undefined") return;

  const inputBuscador = document.getElementById("buscador-partidos");
  const selectDeporte = document.getElementById("filtro-deporte");
  const mensajeVacio = document.getElementById("sin-resultados");

  function renderizarPartidos(partidos) {
    listaPartidos.innerHTML = "";

    if (partidos.length === 0) {
      if (mensajeVacio) mensajeVacio.hidden = false;
      return;
    }
    if (mensajeVacio) mensajeVacio.hidden = true;

    partidos.forEach((p) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="pages/detalle.html?id=${p.id}">
          <article class="card match-card">
            <span class="match-card__icon" aria-hidden="true">${p.icono}</span>
            <h3 class="match-card__title">
              ${p.deporte} <span class="badge ${p.badgeClase}">${p.estado}</span>
            </h3>
            <p class="match-card__price">${p.precio}</p>
            <ul class="match-card__meta">
              <li>📍 ${p.club}</li>
              <li>🕒 ${p.fechaHora}</li>
              <li>👥 ${p.jugadores}</li>
              <li>⭐ ${p.nivel}</li>
            </ul>
          </article>
        </a>
      `;
      listaPartidos.appendChild(li);
    });
  }

  function filtrarPartidos() {
    const texto = (inputBuscador?.value || "").toLowerCase().trim();
    const deporte = selectDeporte?.value || "todos";

    const filtrados = PARTIDOS_MOCK.filter((p) => {
      const coincideDeporte = deporte === "todos" || p.deporte === deporte;
      const coincideTexto =
        p.deporte.toLowerCase().includes(texto) ||
        p.club.toLowerCase().includes(texto) ||
        p.nivel.toLowerCase().includes(texto);
      return coincideDeporte && coincideTexto;
    });

    renderizarPartidos(filtrados);
  }

  // Pintado inicial
  renderizarPartidos(PARTIDOS_MOCK);

  // Eventos de filtrado en tiempo real
  if (inputBuscador) inputBuscador.addEventListener("input", filtrarPartidos);
  if (selectDeporte) selectDeporte.addEventListener("change", filtrarPartidos);
}

/* ==========================================================================
   3. MODALES INTERACTIVOS (CONFIRMACIÓN Y AVISOS)
   ========================================================================== */
function mostrarModal({ titulo, mensaje, textoConfirmar = "Aceptar", esPeligro = false, onConfirmar = null }) {
  // Si no existe el contenedor del modal en la página, lo creamos dinámicamente
  let modal = document.getElementById("app-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "app-modal";
    modal.className = "modal-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="modal-card card">
        <h3 id="modal-titulo" class="section-title"></h3>
        <p id="modal-mensaje" class="muted mt-2"></p>
        <div class="modal-actions mt-3">
          <button type="button" id="modal-cancelar" class="btn btn--outline">Cancelar</button>
          <button type="button" id="modal-confirmar" class="btn btn--primary">Aceptar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const elTitulo = modal.querySelector("#modal-titulo");
  const elMensaje = modal.querySelector("#modal-mensaje");
  const btnCancelar = modal.querySelector("#modal-cancelar");
  const btnConfirmar = modal.querySelector("#modal-confirmar");

  elTitulo.textContent = titulo;
  elMensaje.textContent = mensaje;
  btnConfirmar.textContent = textoConfirmar;
  btnConfirmar.className = esPeligro ? "btn btn--danger" : "btn btn--primary";

  // Si no hay acción de confirmación (solo aviso informativo), ocultamos "Cancelar"
  btnCancelar.style.display = onConfirmar ? "inline-flex" : "none";

  modal.classList.add("is-open");

  const cerrar = () => modal.classList.remove("is-open");

  btnCancelar.onclick = cerrar;
  btnConfirmar.onclick = () => {
    cerrar();
    if (typeof onConfirmar === "function") onConfirmar();
  };
  modal.onclick = (e) => {
    if (e.target === modal) cerrar();
  };
}

function initModales() {
  // Botones de cancelar reserva (en reservas.html y detalle.html)
  document.querySelectorAll("[data-accion='cancelar-reserva']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const tarjeta = btn.closest(".booking");
      mostrarModal({
        titulo: "¿Cancelar esta reserva?",
        mensaje: "Esta acción liberará tu plaza en el partido y no se puede deshacer.",
        textoConfirmar: "Sí, cancelar",
        esPeligro: true,
        onConfirmar: () => {
          if (tarjeta) {
            tarjeta.remove();
          } else {
            window.location.href = "reservas.html";
          }
        }
      });
    });
  });

  // Botón de unirse al partido (en detalle.html)
  const btnUnirse = document.querySelector("[data-accion='unirse-partido']");
  if (btnUnirse) {
    btnUnirse.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarModal({
        titulo: "¡Te has unido al partido!",
        mensaje: "Tu plaza ha quedado reservada. Puedes verla en la sección Mis reservas.",
        textoConfirmar: "Ir a mis reservas",
        onConfirmar: () => {
          window.location.href = "reservas.html";
        }
      });
    });
  }
}

/* ==========================================================================
   4. VALIDACIÓN AVANZADA DE FORMULARIOS EN TIEMPO REAL (SIN TOOLTIPS NATIVOS)
   ========================================================================== */
function initValidacionFormularios() {
  const formularios = document.querySelectorAll("form[data-validar]");

  formularios.forEach((form) => {
    // Desactivamos los tooltips nativos del navegador
    form.setAttribute("novalidate", "");

    const campos = form.querySelectorAll("input, select, textarea");

    // Creamos un contenedor <span class="error-msg"> debajo de cada campo
    campos.forEach((campo) => {
      if (campo.type === "radio" || campo.type === "checkbox") return;
      const spanError = document.createElement("span");
      spanError.className = "error-msg";
      spanError.setAttribute("aria-live", "polite");
      campo.parentElement.appendChild(spanError);

      // Validación en tiempo real al escribir y al salir del campo
      campo.addEventListener("input", () => validarCampo(campo));
      campo.addEventListener("blur", () => validarCampo(campo));
    });

    // Validación al enviar el formulario
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let formularioValido = true;

      campos.forEach((campo) => {
        if (campo.type === "radio" || campo.type === "checkbox") return;
        const esValido = validarCampo(campo);
        if (!esValido) formularioValido = false;
      });

      if (!formularioValido) return;

      // Si es válido, mostramos modal de confirmación antes de redirigir
      const destino = form.getAttribute("action") || "../index.html";
      const mensajeExito = form.dataset.exito || "Operación realizada correctamente.";

      mostrarModal({
        titulo: "¡Todo listo!",
        mensaje: mensajeExito,
        textoConfirmar: "Continuar",
        onConfirmar: () => {
          window.location.href = destino;
        }
      });
    });
  });
}

function validarCampo(campo) {
  const spanError = campo.parentElement.querySelector(".error-msg");
  const valor = campo.value.trim();
  let error = "";

  // 1. Campo obligatorio
  if (campo.hasAttribute("required") && !valor) {
    error = "Este campo es obligatorio.";
  }
  // 2. Email
  else if (campo.type === "email" && valor) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(valor)) {
      error = "Introduce un correo electrónico válido (ej: nombre@dominio.com).";
    }
  }
  // 3. Contraseña
  else if (campo.type === "password" && valor) {
    const min = Number(campo.getAttribute("minlength")) || 6;
    if (valor.length < min) {
      error = `La contraseña debe tener al menos ${min} caracteres.`;
    }
  }
  // 4. Texto (nombre / apellidos)
  else if (campo.type === "text" && valor && valor.length < 2) {
    error = "Debe tener al menos 2 caracteres.";
  }
  // 5. Fecha (no permitir fechas pasadas)
  else if (campo.type === "date" && valor) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaElegida = new Date(valor + "T00:00:00");
    if (fechaElegida < hoy) {
      error = "La fecha no puede ser anterior a hoy.";
    }
  }
  // 6. Número de jugadores
  else if (campo.type === "number" && valor) {
    const num = Number(valor);
    const min = Number(campo.min) || 1;
    const max = Number(campo.max) || 22;
    if (num < min || num > max) {
      error = `El número debe estar entre ${min} y ${max}.`;
    }
  }

  // Actualizar DOM con el estado visual y el mensaje de error
  if (error) {
    campo.classList.add("is-invalid");
    campo.classList.remove("is-valid");
    if (spanError) spanError.textContent = error;
    return false;
  } else {
    campo.classList.remove("is-invalid");
    if (valor) campo.classList.add("is-valid");
    if (spanError) spanError.textContent = "";
    return true;
  }
}
