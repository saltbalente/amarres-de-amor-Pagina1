/* ═══════════════════════════════════════════════════════════════════════
   Amarres de Amor Efectivos · comportamiento de la página
   - El número de WhatsApp se lee de los propios enlaces wa.me: si el
     dashboard lo cambia en el HTML, todo lo demás lo sigue solo.
   - Cada enlace [data-wa] lleva su mensaje (data-wa-text) y su origen
     (data-origen), que se publica en dataLayer como wa_click.
   - Las conversiones de Google Ads las dispara wa-tracker.js (data-sendto);
     aquí no se duplican.
   Sin dependencias. Sin JS la página se lee entera y los wa.me funcionan.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var doc = document;
  var body = doc.body;
  body.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TEXTO_POR_DEFECTO = "Hola, quiero mi consulta gratis sobre un amarre de amor.";

  /* ── Medición (GTM-T4BCC6P lee estos eventos del dataLayer) ───────── */
  function medir(evento, datos) {
    try {
      window.dataLayer = window.dataLayer || [];
      var o = { event: evento };
      for (var k in datos) if (Object.prototype.hasOwnProperty.call(datos, k)) o[k] = datos[k];
      window.dataLayer.push(o);
    } catch (e) { /* la medición nunca debe romper la navegación */ }
  }

  /* ── WhatsApp ──────────────────────────────────────────────────────── */
  function numeroDe(href) {
    var m = /wa\.me\/(\d{8,15})/.exec(String(href || ""));
    return m ? m[1] : "";
  }
  var enlacesWa = Array.prototype.slice.call(doc.querySelectorAll("[data-wa]"));
  var NUMERO = "";
  for (var i = 0; i < enlacesWa.length && !NUMERO; i++) NUMERO = numeroDe(enlacesWa[i].getAttribute("href"));

  function urlWa(texto, num) {
    return "https://wa.me/" + (num || NUMERO) + "?text=" + encodeURIComponent(texto || TEXTO_POR_DEFECTO);
  }
  function enlazar(a) {
    var num = numeroDe(a.getAttribute("href")) || NUMERO;
    if (!num) return;
    if (a.hasAttribute("data-wa-numero")) { a.href = "https://wa.me/" + num; return; }
    a.href = urlWa(a.dataset.waText, num);
  }
  enlacesWa.forEach(function (a) {
    enlazar(a);
    /* pointerdown llega antes que click: el tracker lee el href ya con el
       mensaje final, aunque se haya compuesto en ese momento (diagnóstico). */
    a.addEventListener("pointerdown", function () { enlazar(a); });
  });

  /* Cualquier enlace a wa.me de la página (también el que añade la barra de
     ubicación) publica wa_click con su origen, como en la web de referencia. */
  doc.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href*='wa.me']") : null;
    if (!a) return;
    var sec = a.closest("section");
    var datos = { origen: a.dataset.origen || (sec && sec.id) || "otro" };
    if (a.dataset.ciudad) datos.ciudad = a.dataset.ciudad;
    medir("wa_click", datos);
  });
  medir("pagina_lista", { pagina: body.dataset.pagina || "amarres-de-amor" });

  /* Números visibles: +14802439808 → +1 (480) 243-9808 */
  function formatear(d) {
    d = String(d);
    if (d.length === 11 && d.charAt(0) === "1") return "+1 (" + d.slice(1, 4) + ") " + d.slice(4, 7) + "-" + d.slice(7);
    return "+" + d;
  }
  doc.querySelectorAll("[data-wa-numero]").forEach(function (a) {
    var n = numeroDe(a.getAttribute("href"));
    if (n) a.textContent = formatear(n);
  });

  /* ── Menú ──────────────────────────────────────────────────────────── */
  var burger = doc.getElementById("burger");
  var menu = doc.getElementById("menu");
  if (burger && menu) {
    var cerrar = function () {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Abrir menú");
      menu.classList.remove("is-open");
    };
    burger.addEventListener("click", function () {
      if (burger.getAttribute("aria-expanded") === "true") { cerrar(); return; }
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Cerrar menú");
      menu.classList.add("is-open");
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", cerrar); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });
    doc.addEventListener("click", function (e) {
      if (menu.classList.contains("is-open") && !menu.contains(e.target) && !burger.contains(e.target)) cerrar();
    });
  }

  /* ── Cabecera, barra de progreso y barra fija ──────────────────────── */
  var top = doc.getElementById("top");
  var barra = doc.querySelector("[data-progress]");
  var dock = doc.querySelector("[data-dock]");
  var final = doc.getElementById("consulta");
  var enCola = false;
  function alDesplazar() {
    if (enCola) return;
    enCola = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || doc.documentElement.scrollTop;
      if (top) top.classList.toggle("is-scrolled", y > 10);
      if (barra) {
        var alto = doc.documentElement.scrollHeight - window.innerHeight;
        barra.style.setProperty("--p", (alto > 0 ? Math.min(100, (y / alto) * 100) : 0) + "%");
      }
      if (dock) {
        var finalVisible = false;
        if (final) finalVisible = final.getBoundingClientRect().top < window.innerHeight * 0.85;
        dock.classList.toggle("is-up", y > 480 && !finalVisible);
      }
      enCola = false;
    });
  }
  window.addEventListener("scroll", alDesplazar, { passive: true });
  window.addEventListener("resize", alDesplazar, { passive: true });
  alDesplazar();

  /* ── Revelados con escalonado por grupo ────────────────────────────── */
  var aRevelar = doc.querySelectorAll("[data-reveal], .steps");
  if ("IntersectionObserver" in window && aRevelar.length) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.classList.contains("steps")) { el.classList.add("is-tied"); io.unobserve(el); return; }
        var padre = el.parentElement;
        if (padre) {
          var hermanos = Array.prototype.filter.call(padre.children, function (c) { return c.hasAttribute("data-reveal"); });
          var n = hermanos.indexOf(el);
          if (n > 0) el.style.setProperty("--d", Math.min(n, 6) * 80 + "ms");
        }
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    aRevelar.forEach(function (el) { io.observe(el); });
  } else {
    aRevelar.forEach(function (el) { el.classList.add("is-in", "is-tied"); });
  }

  /* ── Contadores ────────────────────────────────────────────────────── */
  function contar(el) {
    var destino = parseInt(el.dataset.count, 10);
    if (isNaN(destino)) return;
    var sufijo = el.dataset.suffix || "";
    var pinta = function (v) { el.firstChild.nodeValue = v.toLocaleString("es-ES") + sufijo; };
    if (reduce) { pinta(destino); return; }
    var inicio = performance.now();
    var dur = 1600;
    (function paso(t) {
      var p = Math.min(1, (t - inicio) / dur);
      pinta(Math.round(destino * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(paso);
    })(inicio);
  }
  var contadores = doc.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && contadores.length) {
    var ioC = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        contar(en.target);
        ioC.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    contadores.forEach(function (el) { ioC.observe(el); });
  }

  /* ── Diagnóstico en 3 toques ───────────────────────────────────────── */
  var quiz = doc.querySelector("[data-quiz]");
  if (quiz) {
    var preguntas = Array.prototype.slice.call(quiz.querySelectorAll("[data-quiz-q]"));
    var nudos = Array.prototype.slice.call(quiz.querySelectorAll("[data-knot]"));
    var hiloNudos = quiz.querySelector(".quiz-knots");
    var pasoQ = quiz.querySelector("[data-quiz-step]");
    var salida = quiz.querySelector("[data-quiz-out]");
    var oTitulo = quiz.querySelector("[data-quiz-title]");
    var oTexto = quiz.querySelector("[data-quiz-text]");
    var oTiempo = quiz.querySelector("[data-quiz-time]");
    var oFuerza = quiz.querySelector("[data-quiz-force]");
    var oLlamas = quiz.querySelectorAll("[data-quiz-flames] svg");
    var oCta = quiz.querySelector("[data-quiz-cta]");
    var reiniciar = quiz.querySelector("[data-quiz-reset]");
    var respuestas = [];

    var pintaNudos = function (actual, terminado) {
      nudos.forEach(function (n, j) {
        n.classList.toggle("is-done", terminado || j < actual);
        n.classList.toggle("is-now", !terminado && j === actual);
      });
      if (hiloNudos) hiloNudos.style.setProperty("--avance", terminado ? 1 : actual / (nudos.length - 1));
    };
    var mostrar = function (i, enfocar) {
      preguntas.forEach(function (q, j) { q.classList.toggle("is-on", j === i); });
      pintaNudos(i, false);
      if (pasoQ) pasoQ.textContent = String(i + 1);
      if (enfocar) {
        var b = preguntas[i].querySelector("button");
        if (b) b.focus({ preventScroll: true });
      }
    };

    /* La primera regla que encaja es la que manda. */
    var decidir = function (r) {
      var s = r[0] || "", t = r[1] || "", g = r[2] || "";
      var hayTercero = /otra persona/i.test(s) || /corte con la otra/i.test(g);
      var muyLargo = /más de un año/i.test(t);
      var meses = /varios meses/i.test(t);
      if (hayTercero) return {
        nombre: "Separación de Terceros + Amarre de Amor", tiempo: "9 a 21 días", fuerza: "Fuerza alta", llamas: 3,
        texto: "Con una tercera persona en medio, el trabajo va en dos tiempos: primero se corta la atadura que la mantiene ahí y después se reabre el camino hacia ti. Es el caso que más atiendo, y también el que antes se nota cuando se hace en el orden correcto."
      };
      if (muyLargo || (meses && /se fue|desapareció/i.test(s))) return {
        nombre: "Regreso del Ser Amado", tiempo: "7 a 15 días", fuerza: "Fuerza alta", llamas: 3,
        texto: "Cuando ha pasado tanto tiempo, el vínculo no está roto: está dormido bajo la costumbre de vivir sin ti. Este trabajo reforzado existe justo para eso, y funciona aunque esté en otro país o haya bloqueado tu número."
      };
      if (/discutimos/i.test(s)) return {
        nombre: "Endulzamiento · Amarre Dulce", tiempo: "3 a 7 días", fuerza: "Fuerza suave", llamas: 1,
        texto: "Todavía están juntos, y eso juega a tu favor. Aquí no hace falta traer a nadie de vuelta: hace falta ablandar el carácter, apagar las discusiones y devolver la ternura antes de que el desgaste haga el resto."
      };
      if (/pasión/i.test(g)) return {
        nombre: "Amarre de Pasión", tiempo: "3 a 10 días", fuerza: "Fuerza media-alta", llamas: 2,
        texto: "El cariño sigue ahí; lo que se apagó es el deseo. Este trabajo reaviva la atracción física y el pensamiento constante hacia ti. Se hace solo entre adultos y sobre una relación que ya existe."
      };
      if (/comprometa/i.test(g)) return {
        nombre: "Amarre de Compromiso", tiempo: "10 a 20 días", fuerza: "Fuerza media-alta", llamas: 2,
        texto: "Lo tuyo no es traerlo de vuelta, es que se decida. Este trabajo asienta la relación: fidelidad, convivencia y decisión. Es el que se pide cuando ya no quieres seguir esperando a que se le ocurra."
      };
      if (/se fije en mí/i.test(s)) return {
        nombre: "Amarre de Atracción", tiempo: "5 a 12 días", fuerza: "Fuerza media", llamas: 2,
        texto: "Aquí no hay nada roto que reparar: hay un camino que abrir. El trabajo hace que esa persona empiece a notarte, a pensarte y a buscar el acercamiento por su cuenta."
      };
      return {
        nombre: "Amarre de Amor", tiempo: "3 a 9 días", fuerza: "Fuerza media", llamas: 2,
        texto: "Tu caso es de los que mejor responden al trabajo base: reavivar el recuerdo del cariño, quitar el rencor de en medio y devolverle las ganas de buscarte. Cuanto antes se hace, menos días tarda en notarse."
      };
    };

    var terminar = function () {
      var res = decidir(respuestas);
      preguntas.forEach(function (q) { q.classList.remove("is-on"); });
      pintaNudos(nudos.length - 1, true);

      oTitulo.textContent = res.nombre;
      oTexto.textContent = res.texto;
      oTiempo.textContent = "Primeras señales en " + res.tiempo;
      oFuerza.textContent = res.fuerza;
      Array.prototype.forEach.call(oLlamas, function (s, j) { s.classList.toggle("on", j < res.llamas); });

      oCta.dataset.waText =
        "Hola Maestro. Hice el diagnóstico en su página y este es mi caso:\n" +
        "• " + respuestas[0] + ".\n" +
        "• " + respuestas[1] + ".\n" +
        "• " + respuestas[2] + ".\n\n" +
        "Me salió: " + res.nombre + " (" + res.tiempo + "). Quiero mi consulta gratis.";
      enlazar(oCta);

      salida.hidden = false;
      medir("diagnostico_completado", { diagnostico_trabajo: res.nombre });
    };

    quiz.querySelectorAll("[data-quiz-q] button").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.closest("[data-quiz-q]").dataset.quizQ, 10);
        respuestas[i] = b.dataset.val;
        if (i + 1 < preguntas.length) mostrar(i + 1, true);
        else terminar();
      });
    });
    if (reiniciar) {
      reiniciar.addEventListener("click", function () {
        respuestas = [];
        salida.hidden = true;
        mostrar(0, true);
      });
    }
    mostrar(0, false);
  }

  /* ── Carrusel de testimonios ───────────────────────────────────────── */
  var rail = doc.querySelector("[data-rail]");
  if (rail) {
    var tarjetas = Array.prototype.slice.call(rail.querySelectorAll(".testi"));
    var puntos = doc.querySelector("[data-rail-dots]");
    if (puntos) puntos.innerHTML = tarjetas.map(function () { return "<i></i>"; }).join("");
    var pasoRail = function () {
      var t = tarjetas[0];
      return t ? t.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 20) : rail.clientWidth * 0.8;
    };
    var marcar = function () {
      if (!puntos) return;
      var max = rail.scrollWidth - rail.clientWidth;
      var idx = max <= 4 ? 0 : Math.round(rail.scrollLeft / pasoRail());
      if (rail.scrollLeft >= max - 4) idx = tarjetas.length - 1;
      Array.prototype.forEach.call(puntos.children, function (p, j) { p.classList.toggle("is-on", j === Math.min(idx, tarjetas.length - 1)); });
    };
    var mover = function (dir) { rail.scrollBy({ left: dir * pasoRail(), behavior: reduce ? "auto" : "smooth" }); };
    var prev = doc.querySelector("[data-rail-prev]");
    var next = doc.querySelector("[data-rail-next]");
    if (prev) prev.addEventListener("click", function () { mover(-1); });
    if (next) next.addEventListener("click", function () { mover(1); });
    rail.addEventListener("scroll", function () { requestAnimationFrame(marcar); }, { passive: true });
    rail.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); mover(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); mover(-1); }
    });
    marcar();
  }

  /* ── Comentarios ───────────────────────────────────────────────────── */
  var lista = doc.querySelector("[data-comments]");
  if (lista) {
    var VISIBLES = 4;
    var marcador = doc.querySelector("[data-count-el]");
    var toggle = doc.querySelector("[data-toggle-comments]");
    var total = function () { return lista.querySelectorAll(".comment").length; };
    var actualizarTotal = function () { if (marcador) marcador.textContent = String(total()); };

    var enlazarLike = function (btn) {
      btn.addEventListener("click", function () {
        var n = parseInt(btn.dataset.like, 10) || 0;
        var on = btn.classList.toggle("is-on");
        n = on ? n + 1 : Math.max(0, n - 1);
        btn.dataset.like = String(n);
        btn.firstChild.nodeValue = n + " ";
        btn.setAttribute("aria-pressed", String(on));
      });
    };
    lista.querySelectorAll(".like").forEach(enlazarLike);

    var plegar = function (plegado) {
      lista.querySelectorAll(".comment").forEach(function (c, i) {
        c.classList.toggle("is-hidden", plegado && i >= VISIBLES);
        if (!plegado) c.classList.add("is-in");
      });
      if (!toggle) return;
      toggle.setAttribute("aria-expanded", String(!plegado));
      toggle.textContent = plegado ? "Ver los " + total() + " comentarios" : "Ver menos";
    };
    if (toggle) toggle.addEventListener("click", function () { plegar(toggle.getAttribute("aria-expanded") === "true"); });
    plegar(true);
    actualizarTotal();

    lista.querySelectorAll("[data-av]").forEach(function (av) {
      var nombre = av.parentElement.querySelector(".c-meta b");
      if (nombre) av.textContent = nombre.textContent.trim().charAt(0).toUpperCase();
    });

    /* Publicar un comentario (queda solo en esta pantalla) */
    var form = doc.querySelector("[data-comment-form]");
    if (form) {
      var estrellas = Array.prototype.slice.call(form.querySelectorAll("[data-rating] button"));
      var area = form.querySelector("textarea");
      var enviar = form.querySelector(".btn-send");
      var nota = 0;
      estrellas.forEach(function (b, i) {
        b.addEventListener("click", function () {
          nota = i + 1;
          estrellas.forEach(function (x, j) { x.classList.toggle("is-on", j < nota); });
          if (enviar) enviar.hidden = false;
        });
      });
      area.addEventListener("input", function () { if (enviar) enviar.hidden = area.value.trim() === "" && nota === 0; });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var texto = area.value.trim();
        if (!texto) { area.focus(); return; }
        var li = doc.createElement("li");
        li.className = "comment is-in";
        var svgs = "";
        for (var s = 0; s < nota; s++) svgs += '<svg><use href="#ico-star"/></svg>';
        li.innerHTML =
          '<span class="c-av">V</span><div class="c-body">' +
          '<p class="c-meta"><b>Visitante</b><span>ahora</span></p>' +
          (nota ? '<div class="stars" aria-label="' + nota + ' de 5 estrellas">' + svgs + "</div>" : "") +
          '<p class="c-text"></p>' +
          '<button class="like" type="button" data-like="0">0 <svg aria-hidden="true"><use href="#ico-heart"/></svg></button></div>';
        li.querySelector(".c-text").textContent = texto;
        lista.insertBefore(li, lista.firstChild);
        enlazarLike(li.querySelector(".like"));
        actualizarTotal();
        plegar(false);
        area.value = "";
        nota = 0;
        estrellas.forEach(function (x) { x.classList.remove("is-on"); });
        if (enviar) enviar.hidden = true;
      });
    }
  }

  /* ── Acordeón: una pregunta abierta a la vez ───────────────────────── */
  var acordeon = doc.querySelector("[data-accordion]");
  if (acordeon) {
    var items = Array.prototype.slice.call(acordeon.querySelectorAll("details"));
    items.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  /* ── Dominio actual en el aviso legal y año del pie ────────────────── */
  var host = String(location.hostname || "").replace(/^www\./, "");
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    doc.querySelectorAll("[data-dominio]").forEach(function (el) { el.textContent = host; });
  }
  doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ── Barra de ubicación de wa-tracker.js, con el estilo de esta web ────
     En móvil el tracker monta un <div id="wa-geo-bar"> fijo arriba, dentro
     de un Shadow DOM, con la ciudad del visitante. El CSS de la página no
     llega ahí, así que en cuanto aparece se lee la ciudad y la bandera y se
     sustituye su contenido por uno propio. El botón de WhatsApp va FUERA del
     Shadow DOM (hijo del host, proyectado con <slot>) para que lo alcancen
     los oyentes del tracker (conversión, [ref:]) y el wa_click de arriba. */
  var GEO_CSS =
    ":host,*{box-sizing:border-box;margin:0;padding:0}" +
    ".bar{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;" +
    "padding:9px 12px;padding-top:calc(9px + env(safe-area-inset-top,0px));color:#fbefe9;overflow:hidden;" +
    "background:radial-gradient(circle at 10% 140%,rgba(255,46,77,.35),transparent 45%)," +
    "radial-gradient(circle at 90% -40%,rgba(245,191,148,.22),transparent 50%),linear-gradient(180deg,#2a0c18,#0c0306);" +
    "border-bottom:1px solid rgba(245,199,156,.45);box-shadow:0 10px 30px rgba(0,0,0,.6);" +
    "animation:gb-in .9s cubic-bezier(.22,1,.36,1) both}" +
    ".bar::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1.5px;" +
    "background:linear-gradient(90deg,transparent,#ff2e4d 30%,#ffd6bd 50%,#ff2e4d 70%,transparent);" +
    "background-size:250% 100%;animation:gb-hilo 5s ease-in-out infinite}" +
    ".left{display:flex;align-items:center;gap:10px;min-width:0}" +
    ".mark{flex:none;width:32px;height:32px;color:#ff2e4d;filter:drop-shadow(0 0 8px rgba(255,46,77,.6));animation:gb-late 1.6s ease-in-out infinite}" +
    ".txt{display:grid;gap:1px;min-width:0}" +
    ".kicker{display:inline-flex;align-items:center;gap:6px;font:800 9.5px/1.2 Manrope,system-ui,sans-serif;" +
    "letter-spacing:.2em;text-transform:uppercase;color:#f5c79c;white-space:nowrap}" +
    ".dot{position:relative;width:7px;height:7px;border-radius:50%;background:#25d366;box-shadow:0 0 8px #25d366}" +
    ".city{display:inline-flex;align-items:center;gap:7px;min-width:0;font:italic 500 17px/1.15 Fraunces,Georgia,serif;" +
    "white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".city .flg{width:18px;height:12px;border-radius:2px;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.25)}" +
    "::slotted(.geobar-cta){flex:none}" +
    "@media (max-width:360px){.city{font-size:15px}.kicker{font-size:8.5px;letter-spacing:.14em}.mark{width:28px;height:28px}}" +
    "@keyframes gb-in{from{transform:translateY(-110%);opacity:0}to{transform:none;opacity:1}}" +
    "@keyframes gb-hilo{0%{background-position:120% 0}100%{background-position:-120% 0}}" +
    "@keyframes gb-late{0%,100%{transform:scale(1)}15%{transform:scale(1.1)}30%{transform:scale(1)}}" +
    "@media (prefers-reduced-motion:reduce){.bar,.bar *,.bar::after{animation:none!important}}";
  var GEO_MARK =
    '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M32 51 15 34a10.5 10.5 0 0 1 15-15l2 2 2-2a10.5 10.5 0 0 1 15 15z"/>' +
    '<path d="M5 41c10-2 16 6 27 2s14-10 27-6" fill="none" stroke="#f5bf94" stroke-width="2.4" stroke-linecap="round"/></svg>';
  var GEO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ico-wa"/></svg>';

  function ajustarBarra(raiz) {
    var b = raiz.querySelector(".bar");
    var h = b ? Math.ceil(b.getBoundingClientRect().height) : 0;
    doc.documentElement.style.setProperty("--geobar-h", h + "px");
  }
  function vestirBarra(host) {
    if (!host || host.dataset.vestida) return;
    var raiz = host.shadowRoot || host;
    var nodoCiudad = raiz.querySelector(".city span") || raiz.querySelector(".city");
    var ciudad = (nodoCiudad ? nodoCiudad.textContent : "").trim();
    if (!ciudad) return;
    var bandera = raiz.querySelector(".flg");
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

    host.dataset.vestida = "1";
    raiz.innerHTML =
      "<style>" + GEO_CSS + "</style>" +
      '<div class="bar" role="region" aria-label="Atención en tu zona"><div class="left">' + GEO_MARK +
      '<div class="txt"><span class="kicker"><i class="dot"></i>Atendiendo en</span>' +
      '<span class="city">' + (bandera ? bandera.outerHTML : "") + "<span>" + esc(ciudad) + "</span></span></div></div>" +
      '<slot name="cta"></slot></div>';

    var cta = doc.createElement("a");
    cta.className = "geobar-cta";
    cta.slot = "cta";
    cta.href = urlWa("Hola Maestro, le escribo desde " + ciudad + ". Quiero mi consulta gratis sobre un amarre de amor.");
    cta.target = "_blank";
    cta.rel = "noopener";
    cta.dataset.origen = "geobar";
    cta.dataset.ciudad = ciudad;
    cta.setAttribute("aria-label", "Consulta gratis por WhatsApp desde " + ciudad);
    cta.innerHTML = '<span class="wic">' + GEO_WA + "</span><b>Consulta gratis<small>respuesta en minutos</small></b>";
    if (host.shadowRoot) host.appendChild(cta);
    else raiz.querySelector(".bar").appendChild(cta);

    medir("geobar_vista", { ciudad: ciudad });
    ajustarBarra(raiz);
    setTimeout(function () { ajustarBarra(raiz); }, 400);
    setTimeout(function () { ajustarBarra(raiz); }, 1200);
    window.addEventListener("resize", function () { ajustarBarra(raiz); }, { passive: true });
  }
  (function vigilarBarra() {
    var ya = doc.getElementById("wa-geo-bar");
    if (ya) vestirBarra(ya);
    if (!("MutationObserver" in window)) return;
    var mo = new MutationObserver(function (cambios) {
      for (var c = 0; c < cambios.length; c++) {
        var nuevos = cambios[c].addedNodes;
        for (var n = 0; n < nuevos.length; n++) {
          if (nuevos[n].nodeType === 1 && nuevos[n].id === "wa-geo-bar") {
            /* el tracker rellena la ciudad justo después de insertarlo */
            var host = nuevos[n];
            vestirBarra(host);
            setTimeout(function () { vestirBarra(host); }, 300);
            setTimeout(function () { vestirBarra(host); }, 1200);
          }
        }
      }
    });
    mo.observe(doc.documentElement, { childList: true, subtree: true });
  })();
})();
