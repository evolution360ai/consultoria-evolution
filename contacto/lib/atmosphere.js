/*!
 * atmosphere.js — el "aire" de la escena: polvo/motas que flotan en profundidad.
 * Es la capa que hace que el objeto 3D deje de estar en un VACÍO negro y pase a
 * vivir en un sitio. Barata (canvas 2D), 0 deps, file://. Global window.Atmosphere.
 *
 *   Atmosphere.mount({
 *     canvas: '#atmo',           // <canvas> a pantalla completa detrás del hero
 *     color: '201,168,118',      // rgb de las motas (el acento de marca)
 *     count: 90,                  // nº de motas (se escala por área)
 *     glow: true                  // halo radial suave de fondo (color cálido)
 *   });
 *
 * Reacciona sutilmente a la velocidad de scroll y al ratón → sensación de estar vivo.
 * Respeta prefers-reduced-motion (pinta estático, sin rAF).
 */
(function (root) {
  'use strict';

  function mount(opts) {
    opts = opts || {};
    var canvas = typeof opts.canvas === 'string' ? document.querySelector(opts.canvas) : opts.canvas;
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var rgb = opts.color || '255,255,255';
    var glow = opts.glow !== false;
    var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var dpr = Math.min(root.devicePixelRatio || 1, 2);
    var W = 0, H = 0, motes = [];
    var mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    var lastScroll = root.scrollY || 0, sv = 0;

    function rnd(a, b) { return a + Math.random() * (b - a); }

    function build() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var base = opts.count || 80;
      var n = Math.round(base * Math.min(1.6, (W * H) / (1280 * 720)));
      motes = [];
      for (var i = 0; i < n; i++) {
        var z = rnd(0.15, 1);                 // profundidad: cerca = grande y rápida
        motes.push({
          x: rnd(0, W), y: rnd(0, H), z: z,
          r: rnd(0.4, 2.2) * z,
          a: rnd(0.05, 0.35) * z,
          vx: rnd(-0.12, 0.12) * z,
          vy: rnd(-0.22, -0.05) * z,          // deriva lenta hacia arriba
          tw: rnd(0.002, 0.01)                // parpadeo
        });
      }
    }

    function paint(t) {
      ctx.clearRect(0, 0, W, H);
      if (glow) {
        var g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.7);
        g.addColorStop(0, 'rgba(' + rgb + ',0.07)');
        g.addColorStop(1, 'rgba(' + rgb + ',0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx + (mx - 0.5) * 0.4 * m.z;
        m.y += m.vy - sv * 0.06 * m.z;         // el scroll arrastra las motas
        if (m.y < -6) { m.y = H + 6; m.x = rnd(0, W); }
        if (m.y > H + 6) { m.y = -6; m.x = rnd(0, W); }
        if (m.x < -6) m.x = W + 6; if (m.x > W + 6) m.x = -6;
        var tw = 0.6 + 0.4 * Math.sin(t * m.tw + i);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + rgb + ',' + (m.a * tw).toFixed(3) + ')';
        ctx.arc(m.x, m.y, m.r, 0, 6.283);
        ctx.fill();
      }
      sv *= 0.9;
    }

    build();
    root.addEventListener('resize', build, { passive: true });
    root.addEventListener('mousemove', function (e) {
      tmx = e.clientX / root.innerWidth; tmy = e.clientY / root.innerHeight;
    }, { passive: true });
    root.addEventListener('scroll', function () {
      var y = root.scrollY || 0; sv = y - lastScroll; lastScroll = y;
    }, { passive: true });

    if (reduced) { paint(0); return { stop: function () {} }; }
    var raf, running = true;
    (function loop(t) { if (!running) return; paint(t || 0); raf = requestAnimationFrame(loop); })(0);
    return { stop: function () { running = false; cancelAnimationFrame(raf); } };
  }

  root.Atmosphere = { mount: mount };
})(window);
