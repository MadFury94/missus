'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * products: [{ id, name, price, image }]  (image = URL of the product photo)
 * onSelect(product): called from the "View product" button
 * Load with: dynamic(() => import('./ClothRack'), { ssr: false })
 */
export default function ClothRack({ products = [], onSelect, height = '100vh' }) {
  const mount = useRef(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const el = mount.current;
    if (!el || !products.length) return;
    const n = products.length, GAP = 2.0, RAILY = 1.9, PH = 2.3;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = el.clientWidth, H = el.clientHeight;

    const R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(R.domElement);
    R.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y';
    const S = new THREE.Scene();
    const C = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
    S.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(-3, 5, 8);
    S.add(dl);

    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, n * GAP + 4, 24),
      new THREE.MeshStandardMaterial({ color: 0xc9ccd2, metalness: 0.9, roughness: 0.25 })
    );
    rail.rotation.z = Math.PI / 2;
    rail.position.y = RAILY;
    S.add(rail);

    const loader = new THREE.TextureLoader().setCrossOrigin('anonymous');
    const disposables = [rail.geometry, rail.material];
    const groups = [], meshes = [];
    const hookMat = new THREE.MeshStandardMaterial({ color: 0x8a8f99, metalness: 0.8, roughness: 0.3 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x7a5a48 });
    disposables.push(hookMat, wireMat);

    products.forEach((p, i) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, alphaTest: 0.05, transparent: false });
      const pg = new THREE.PlaneGeometry(1.6, PH, 24, 28);
      pg.translate(0, -PH / 2, 0);
      const m = new THREE.Mesh(pg, mat);
      m.position.y = -0.3;
      m.userData = { i, base: pg.attributes.position.array.slice(), w: 1.6 };
      g.add(m);
      meshes.push(m);
      disposables.push(pg, mat);

      // when the photo loads, resize the cloth to the photo's aspect ratio
      loader.load(p.image, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        const w = Math.min(2.4, Math.max(1.0, PH * (t.image.width / t.image.height)));
        const ng = new THREE.PlaneGeometry(w, PH, 24, 28);
        ng.translate(0, -PH / 2, 0);
        m.geometry.dispose();
        m.geometry = ng;
        m.userData.base = ng.attributes.position.array.slice();
        m.userData.w = w;
        mat.map = t;
        mat.needsUpdate = true;
        disposables.push(ng, t);
      });

      const hw = 0.75;
      const wire = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-hw, -0.47, 0), new THREE.Vector3(0, -0.12, 0),
          new THREE.Vector3(hw, -0.47, 0), new THREE.Vector3(-hw, -0.47, 0),
        ]), wireMat);
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 20, Math.PI * 1.4), hookMat);
      hook.position.y = -0.02;
      hook.rotation.z = Math.PI * 0.15;
      g.add(wire, hook);
      disposables.push(wire.geometry, hook.geometry);

      const rest = (i % 2 ? 1 : -1) * (1.05 + 0.12 * (i % 3));
      g.userData = { slot: (i - (n - 1) / 2) * GAP, ph: i * 1.3, rest, ry: rest, vy: 0, agit: 0, m };
      g.rotation.y = rest;
      S.add(g);
      groups.push(g);
    });

    let VW = 10, scroll = 0, scrollT = 0, range = 0;
    const size = () => {
      W = el.clientWidth; H = el.clientHeight;
      R.setSize(W, H, false);
      C.aspect = W / H;
      const z = Math.max(11, (Math.min(n, 6) * GAP * 1.1) / (2 * Math.tan((17.5 * Math.PI) / 180) * C.aspect));
      C.position.set(0, 0.2, z);
      C.updateProjectionMatrix();
      VW = 2 * z * Math.tan((17.5 * Math.PI) / 180) * C.aspect;
      range = Math.max(0, (n * GAP - VW * 0.85) / 2);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
    let mx = 0, my = 0, hov = -1, sel = -1, down = null, dragged = false;
    const pick = (e) => {
      const r = el.getBoundingClientRect();
      mv.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mv, C);
      const h = ray.intersectObjects(meshes)[0];
      return h ? h.object.userData.i : -1;
    };
    const choose = (i) => { sel = i; setActive(i < 0 ? null : products[i]); };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      if (down !== null) {
        const dx = e.clientX - down;
        if (Math.abs(dx) > 4) dragged = true;
        scrollT = Math.max(-range, Math.min(range, scrollT + (dx * VW) / W));
        down = e.clientX;
      }
      hov = pick(e);
      R.domElement.style.cursor = hov >= 0 ? 'pointer' : 'grab';
    };
    const onDown = (e) => { down = e.clientX; dragged = false; };
    const onUp = (e) => { down = null; if (!dragged) { const i = pick(e); choose(i === sel ? -1 : i); } };
    const onKey = (e) => { if (e.key === 'Escape') choose(-1); };
    const onWheel = (e) => { scrollT = Math.max(-range, Math.min(range, scrollT - (e.deltaX || e.deltaY) * 0.01)); };
    R.domElement.addEventListener('pointermove', onMove);
    R.domElement.addEventListener('pointerdown', onDown);
    addEventListener('pointerup', onUp);
    addEventListener('keydown', onKey);
    R.domElement.addEventListener('wheel', onWheel, { passive: true });

    let raf, tl = performance.now();
    const t0 = tl;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now(), t = (now - t0) / 1000, dt = Math.min((now - tl) / 1000, 0.033);
      tl = now;
      scroll += (scrollT - scroll) * 0.12;
      groups.forEach((g, i) => {
        const u = g.userData, isSel = i === sel, isHov = i === hov && sel < 0;
        const tx = isSel ? 0 : u.slot + scroll, ty = isSel ? RAILY - 0.5 : RAILY;
        const tz = isSel ? 4.2 : isHov ? 0.9 : 0, ts = isSel ? 1.35 : 1;
        const px = g.position.x, py = g.position.y, pz = g.position.z;
        g.position.x += (tx - px) * 0.1; g.position.y += (ty - py) * 0.08; g.position.z += (tz - pz) * 0.08;
        const moved = Math.abs(g.position.x - px) + Math.abs(g.position.y - py) + Math.abs(g.position.z - pz);
        g.scale.setScalar(g.scale.x + (ts - g.scale.x) * 0.08);

        // spring: sideways on the rack, turns to face front on hover / select
        const target = isHov || isSel ? 0 : u.rest + (reduce ? 0 : Math.sin(t * 0.9 + u.ph) * 0.06);
        u.vy += ((target - u.ry) * 85 - u.vy * 7) * dt;
        u.ry += u.vy * dt;
        g.rotation.y = u.ry;
        u.agit += (Math.abs(u.vy) * 0.05 + moved * 1.2 - u.agit) * 0.25;
        if (reduce) u.agit = 0;

        // cloth: hem trails behind the motion, a ripple runs down the fabric
        const pa = u.m.geometry.attributes.position, a = pa.array, b = u.m.userData.base;
        const drag = Math.max(-0.6, Math.min(0.6, -u.vy * 0.08)), amp = 0.03 + Math.min(u.agit, 0.45);
        for (let k = 0; k < a.length; k += 3) {
          const f = -b[k + 1] / PH;
          a[k + 2] = f * f * (drag * 1.4 + amp * Math.sin(b[k] * 2.4 - t * 6 + u.ph + f * 4)) + Math.sin(f * 3.14) * 0.05;
          a[k] = b[k] * (1 - f * 0.03 * Math.min(u.agit * 3, 1));
        }
        pa.needsUpdate = true;
        u.m.geometry.computeVertexNormals();
      });
      C.position.x += (mx * 1.2 - C.position.x) * 0.05;
      C.position.y += (0.2 - my * 0.8 - C.position.y) * 0.05;
      C.lookAt(0, 0.2, 0);
      R.render(S, C);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener('pointerup', onUp);
      removeEventListener('keydown', onKey);
      disposables.forEach((d) => d.dispose && d.dispose());
      R.dispose();
      el.removeChild(R.domElement);
    };
  }, [products]);

  return (
    <div ref={mount} style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 28, textAlign: 'center', pointerEvents: 'none' }}>
        <p style={{ margin: '0 0 12px', fontSize: 14 }}>
          {active ? `${active.name}${active.price ? ' · ' + active.price : ''}` : 'Tap a piece to pull it off the rack'}
        </p>
        {active && (
          <button
            onClick={() => onSelect && onSelect(active)}
            style={{ pointerEvents: 'auto', font: 'inherit', fontSize: 12, padding: '8px 20px', borderRadius: 99, border: '1px solid currentColor', background: 'transparent', color: 'inherit', cursor: 'pointer' }}
          >
            View product
          </button>
        )}
      </div>
    </div>
  );
}
