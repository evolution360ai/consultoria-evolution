/*!
 * ghost-cursor.js — cursor propio con estela suave (spring). Capa barata que sube
 * mucho la percepción "premium/hecho a mano". Vanilla, 0 deps, file://.
 * Se desactiva solo en táctil y en prefers-reduced-motion.
 *
 *   GhostCursor.mount({ color: '201,168,118', ring: 26 });
 *
 * Añade dos nodos (punto + anillo). Marca .gc-hot sobre a/button/[data-hot] al hover.
 */
(function (root) {
  'use strict';
  function mount(opts) {
    opts = opts || {};
    var coarse = root.matchMedia && root.matchMedia('(pointer:coarse)').matches;
    var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return null;

    var rgb = opts.color || '255,255,255';
    var ringSize = opts.ring || 26;
    var dot = document.createElement('div');
    var ring = document.createElement('div');
    dot.className = 'gc-dot'; ring.className = 'gc-ring';
    var css = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;border-radius:999px;' +
      'transform:translate(-50%,-50%);will-change:transform;mix-blend-mode:difference';
    dot.style.cssText = css + ';width:6px;height:6px;background:rgba(' + rgb + ',1)';
    ring.style.cssText = css + ';width:' + ringSize + 'px;height:' + ringSize + 'px;' +
      'border:1px solid rgba(' + rgb + ',.8);transition:width .25s,height .25s,opacity .25s';
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.documentElement.style.cursor = 'none';

    var tx = root.innerWidth / 2, ty = root.innerHeight / 2;
    var rx = tx, ry = ty;                     // anillo con retardo (estela)
    root.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)';
    }, { passive: true });

    function hot(on) {
      ring.style.width = ring.style.height = (on ? ringSize * 1.7 : ringSize) + 'px';
      ring.style.opacity = on ? '1' : '.7';
    }
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest('a,button,[data-hot]')) hot(true);
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest('a,button,[data-hot]')) hot(false);
    });

    (function loop() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    return { dot: dot, ring: ring };
  }
  root.GhostCursor = { mount: mount };
})(window);
