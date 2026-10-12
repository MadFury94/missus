'use client';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';

interface Product {
    id: string | number;
    name: string;
    price?: string;
    image: string;
    hanger?: 'shoulders' | 'clips';
}

interface ClothRackProps {
    products?: Product[];
    onSelect?: (product: Product) => void;
    height?: string;
    renderSelection?: (product: Product) => ReactNode;
}

/**
 * products: [{ id, name, price, image }]  (image = URL of the product photo)
 * onSelect(product): called from the "View product" button
 * Load with: dynamic(() => import('./ClothRack'), { ssr: false })
 */
export default function ClothRack({ products = [], onSelect, height = '100vh', renderSelection }: ClothRackProps) {
    const mount = useRef<HTMLDivElement>(null);
    const priceTags = useRef<(HTMLButtonElement | null)[]>([]);
    const chooseProduct = useRef<(index: number) => void>(() => {});
    const [active, setActive] = useState<Product | null>(null);
    const [unavailable, setUnavailable] = useState(false);

    useEffect(() => {
        const el = mount.current;
        if (!el || !products.length) return;
        const n = products.length, GAP = 2.0, RAILY = 1.9, PH = 2.3;
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        let W = el.clientWidth, H = el.clientHeight;

        let disposed = false;
        setActive(null);
        let R: THREE.WebGLRenderer;
        try {
            R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            setUnavailable(false);
        } catch {
            setUnavailable(true);
            return;
        }
        R.setPixelRatio(Math.min(devicePixelRatio, 2));
        el.appendChild(R.domElement);
        R.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y';
        R.domElement.tabIndex = 0;
        R.domElement.setAttribute('role', 'region');
        R.domElement.setAttribute('aria-label', 'Clothing rack. Use left and right arrow keys to browse, Escape to put a piece back.');
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
        const disposables: { dispose: () => void }[] = [rail.geometry, rail.material];
        const groups: THREE.Group[] = [], meshes: THREE.Mesh[] = [];
        const hookMat = new THREE.MeshStandardMaterial({ color: 0x8a8f99, metalness: 0.8, roughness: 0.3 });
        const wireMat = new THREE.LineBasicMaterial({ color: 0x7a5a48 });
        disposables.push(hookMat, wireMat);

        products.forEach((p, i) => {
            const g = new THREE.Group();
            const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, alphaTest: 0.5, transparent: false });
            const pg = new THREE.PlaneGeometry(1.6, PH, 24, 28);
            pg.translate(0, -PH / 2, 0);
            const m = new THREE.Mesh(pg, mat);
            m.visible = false;
            m.position.y = -0.3;
            (m as any).userData = { i, base: pg.attributes.position.array.slice(), w: 1.6 };
            g.add(m);
            meshes.push(m);
            disposables.push(pg, mat);

            // when the photo loads, resize the cloth to the photo's aspect ratio
            loader.load(p.image, (t) => {
                if (disposed) { t.dispose(); return; }
                t.colorSpace = THREE.SRGBColorSpace;
                // Trim transparent margins in UV space, keeping collars attached to hangers.
                const canvas = document.createElement('canvas');
                canvas.width = t.image.width; canvas.height = t.image.height;
                const context = canvas.getContext('2d', { willReadFrequently: true });
                let bounds = { x: 0, y: 0, width: canvas.width, height: canvas.height };
                if (context) {
                    try {
                        context.drawImage(t.image, 0, 0);
                        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
                        let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
                        for (let y = 0; y < canvas.height; y++) {
                            for (let x = 0; x < canvas.width; x++) {
                                if (pixels.data[(y * canvas.width + x) * 4 + 3] < 128) continue;
                                left = Math.min(left, x); right = Math.max(right, x);
                                top = Math.min(top, y); bottom = Math.max(bottom, y);
                            }
                        }
                        if (right >= left) bounds = { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
                        m.userData.alpha = pixels;
                    } catch { /* Cross-origin photos remain usable without pixel picking. */ }
                }
                m.userData.bounds = bounds;
                t.repeat.set(bounds.width / canvas.width, bounds.height / canvas.height);
                t.offset.set(bounds.x / canvas.width, 1 - (bounds.y + bounds.height) / canvas.height);
                const w = PH * bounds.width / bounds.height;
                const ng = new THREE.PlaneGeometry(w, PH, 24, 28);
                ng.translate(0, -PH / 2, 0);
                m.geometry.dispose();
                m.geometry = ng;
                (m as any).userData.base = ng.attributes.position.array.slice();
                (m as any).userData.w = w;
                mat.map = t;
                mat.needsUpdate = true;
                m.visible = true;
                wire.scale.x = p.hanger === 'clips' ? w * 0.3 / hw : w * 0.32 / hw;
                m.position.y = p.hanger === 'clips' ? -0.47 : -0.14;
                clips.forEach((clip, index) => { clip.position.x = (index ? 1 : -1) * w * 0.27; });
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
            const clips: THREE.Mesh[] = [];
            if (p.hanger === 'clips') {
                for (const side of [-1, 1]) {
                    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.17, 0.06), hookMat);
                    clip.position.set(side * 0.4, -0.49, 0.04);
                    g.add(clip);
                    clips.push(clip);
                    disposables.push(clip.geometry);
                }
            }

            const rest = (i % 2 ? 1 : -1) * (1.05 + 0.12 * (i % 3));
            (g as any).userData = { slot: (i - (n - 1) / 2) * GAP, ph: i * 1.3, rest, ry: rest, vy: 0, agit: 0, m };
            g.rotation.y = rest;
            S.add(g);
            groups.push(g);
        });

        let VW = 10, scroll = 0, scrollT = 0, range = 0;
        const size = () => {
            W = Math.max(1, el.clientWidth); H = Math.max(1, el.clientHeight);
            R.setSize(W, H, false);
            C.aspect = W / H;
            const visible = W < 600 ? 2 : 6;
            const z = Math.max(11, (Math.min(n, visible) * GAP * 1.1) / (2 * Math.tan((17.5 * Math.PI) / 180) * C.aspect));
            C.position.set(0, 0.2, z);
            C.updateProjectionMatrix();
            VW = 2 * z * Math.tan((17.5 * Math.PI) / 180) * C.aspect;
            range = Math.max(0, (n * GAP - VW * 0.85) / 2);
        };
        size();
        const ro = new ResizeObserver(size);
        ro.observe(el);

        const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
        let mx = 0, my = 0, hov = -1, sel = -1, down: number | null = null, dragged = false;
        const pick = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            mv.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            ray.setFromCamera(mv, C);
            const h = ray.intersectObjects(meshes).find((hit) => {
                if (!hit.object.visible) return false;
                const pixels = hit.object.userData.alpha as ImageData | undefined;
                const bounds = hit.object.userData.bounds;
                if (!pixels || !hit.uv || !bounds) return true;
                const x = Math.min(pixels.width - 1, Math.max(0, Math.floor(bounds.x + hit.uv.x * bounds.width)));
                const y = Math.min(pixels.height - 1, Math.max(0, Math.floor(bounds.y + (1 - hit.uv.y) * bounds.height)));
                return pixels.data[(y * pixels.width + x) * 4 + 3] >= 128;
            });
            return h ? (h.object as any).userData.i : -1;
        };
        const choose = (i: number) => { sel = i; setActive(i < 0 ? null : products[i]); };
        chooseProduct.current = (i) => choose(i === sel ? -1 : i);
        const onMove = (e: PointerEvent) => {
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
        const onDown = (e: PointerEvent) => {
            if (e.button !== 0) return;
            down = e.clientX; dragged = false;
            R.domElement.setPointerCapture(e.pointerId);
        };
        const onUp = (e: PointerEvent) => {
            if (down === null) return;
            down = null;
            if (R.domElement.hasPointerCapture(e.pointerId)) R.domElement.releasePointerCapture(e.pointerId);
            if (!dragged) { const i = pick(e); choose(i === sel ? -1 : i); }
        };
        const onCancel = () => { down = null; hov = -1; };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') choose(-1);
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const next = sel < 0 ? 0 : (sel + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
                choose(next);
                scrollT = Math.max(-range, Math.min(range, -groups[next].userData.slot));
            }
        };
        const onWheel = (e: WheelEvent) => { scrollT = Math.max(-range, Math.min(range, scrollT - (e.deltaX || e.deltaY) * 0.01)); };
        R.domElement.addEventListener('pointermove', onMove as any);
        R.domElement.addEventListener('pointerdown', onDown as any);
        R.domElement.addEventListener('pointerup', onUp);
        R.domElement.addEventListener('pointercancel', onCancel);
        R.domElement.addEventListener('pointerleave', onCancel);
        R.domElement.addEventListener('keydown', onKey);
        R.domElement.addEventListener('wheel', onWheel, { passive: true });

        let raf: number, tl = performance.now();
        const t0 = tl;
        const tagPosition = new THREE.Vector3();
        const loop = () => {
            raf = requestAnimationFrame(loop);
            const now = performance.now(), t = reduce ? 0 : (now - t0) / 1000, dt = Math.min((now - tl) / 1000, 0.033);
            tl = now;
            scroll += (scrollT - scroll) * 0.12;
            groups.forEach((g, i) => {
                const u = (g as any).userData, isSel = i === sel, isHov = i === hov && sel < 0;
                const tx = isSel ? 0 : u.slot + scroll, ty = isSel ? RAILY - 0.5 : RAILY;
                const tz = isSel ? 4.2 : isHov ? 0.9 : 0, ts = isSel ? 1.35 : 1;
                const px = g.position.x, py = g.position.y, pz = g.position.z;
                g.position.x += (tx - px) * 0.1; g.position.y += (ty - py) * 0.08; g.position.z += (tz - pz) * 0.08;
                const moved = Math.abs(g.position.x - px) + Math.abs(g.position.y - py) + Math.abs(g.position.z - pz);
                g.scale.setScalar(g.scale.x + (ts - g.scale.x) * 0.08);

                // spring: sideways on the rack, turns to face front on hover / select
                const target = isHov || isSel ? 0 : u.rest + (reduce ? 0 : Math.sin(t * 0.9 + u.ph) * 0.06);
                if (reduce) { u.ry = target; u.vy = 0; }
                u.vy += ((target - u.ry) * 85 - u.vy * 7) * dt;
                u.ry += u.vy * dt;
                g.rotation.y = u.ry;
                u.agit += (Math.abs(u.vy) * 0.05 + moved * 1.2 - u.agit) * 0.25;
                if (reduce) u.agit = 0;

                // cloth: hem trails behind the motion, a ripple runs down the fabric
                const pa = u.m.geometry.attributes.position, a = pa.array, b = u.m.userData.base;
                const drag = Math.max(-0.6, Math.min(0.6, -u.vy * 0.08)), amp = reduce ? 0 : 0.03 + Math.min(u.agit, 0.45);
                for (let k = 0; k < a.length; k += 3) {
                    const f = -b[k + 1] / PH;
                    a[k + 2] = f * f * (drag * 1.4 + amp * Math.sin(b[k] * 2.4 - t * 6 + u.ph + f * 4)) + Math.sin(f * 3.14) * 0.05;
                    a[k] = b[k] * (1 - f * 0.03 * Math.min(u.agit * 3, 1));
                }
                pa.needsUpdate = true;
                u.m.geometry.computeVertexNormals();
            });
            C.position.x += ((reduce ? 0 : mx * 1.2) - C.position.x) * 0.05;
            C.position.y += (0.2 - (reduce ? 0 : my * 0.8) - C.position.y) * 0.05;
            C.lookAt(0, 0.2, 0);
            R.render(S, C);
            // HTML price labels follow the cloth without rerendering React each frame.
            groups.forEach((g, i) => {
                const tag = priceTags.current[i];
                if (!tag) return;
                const cloth = meshes[i];
                tagPosition.set(cloth.userData.w * 0.18, cloth.position.y - PH * 0.68, 0.06);
                g.localToWorld(tagPosition);
                tagPosition.project(C);
                const x = (tagPosition.x + 1) * W / 2;
                const y = (1 - tagPosition.y) * H / 2;
                const shown = cloth.visible && tagPosition.z < 1 && x > 35 && x < W - 35 && y > 0 && y < H - 85;
                tag.style.visibility = shown ? 'visible' : 'hidden';
                tag.style.opacity = sel >= 0 && sel !== i ? '0.3' : '1';
                tag.style.transform = `translate(${x}px, ${y}px) translate(-50%, 0) rotate(${reduce ? 0 : Math.sin(t * 0.9 + i) * 3}deg)`;
                tag.style.zIndex = sel === i ? '3' : '2';
                tag.setAttribute('aria-pressed', String(sel === i));
            });
        };
        loop();

        return () => {
            disposed = true;
            chooseProduct.current = () => {};
            cancelAnimationFrame(raf);
            ro.disconnect();
            R.domElement.removeEventListener('pointermove', onMove);
            R.domElement.removeEventListener('pointerdown', onDown);
            R.domElement.removeEventListener('pointerup', onUp);
            R.domElement.removeEventListener('pointercancel', onCancel);
            R.domElement.removeEventListener('pointerleave', onCancel);
            R.domElement.removeEventListener('keydown', onKey);
            R.domElement.removeEventListener('wheel', onWheel);
            disposables.forEach((d) => d.dispose && d.dispose());
            R.dispose();
            el.removeChild(R.domElement);
        };
    }, [products]);

    return (
        <div>
        <style>{`
            .rack-price-tag { position: absolute; top: 0; left: 0; visibility: hidden; border: 1px solid #d5ccba; border-radius: 1px; background: #fffdf4; color: #433b2c; padding: 9px 10px 6px; font-family: Georgia, serif; font-size: 12px; font-variant-numeric: tabular-nums; box-shadow: 0 2px 7px #201b1312; cursor: pointer; min-height: 36px; transition: opacity .2s; }
            .rack-price-tag::before { content: ''; position: absolute; left: 50%; top: -23px; width: 1px; height: 24px; background: #9c8c6c; }
            .rack-price-tag::after { content: ''; position: absolute; left: calc(50% - 2px); top: 3px; width: 4px; height: 4px; border-radius: 50%; background: #b9a889; }
            .rack-price-tag:focus-visible { outline: 2px solid #796545; outline-offset: 4px; }
        `}</style>
        <div ref={mount} style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
            {products.map((product, i) => <button
                key={product.id}
                ref={el => { priceTags.current[i] = el; }}
                className="rack-price-tag"
                aria-label={`${product.name}, ${product.price || 'view price and options'}`}
                onClick={() => chooseProduct.current(i)}
            >{product.price}</button>)}
            {unavailable && <p style={{ padding: 24 }}>The 3D rack is unavailable in this browser. Select Product grid to browse the collection.</p>}
            <div style={{ position: 'absolute', zIndex: 1, left: 16, right: 16, bottom: 28, textAlign: 'center', pointerEvents: 'none' }}>
                <p aria-live="polite" style={{ margin: '0 0 12px', fontSize: 14 }}>
                    {active ? (renderSelection ? 'Your selected piece · details below' : `${active.name}${active.price ? ' · ' + active.price : ''}`) : 'Tap a piece or its price tag to take a closer look'}
                </p>
                {!active && !unavailable && <p style={{ margin: '0 0 12px', fontSize: 12 }}>Drag or scroll to browse · Use arrow keys when the rack is focused</p>}
                {active && !renderSelection && (
                    <button
                        onClick={() => onSelect && onSelect(active)}
                        style={{
                            pointerEvents: 'auto',
                            font: 'inherit',
                            fontSize: 12,
                            padding: '8px 20px',
                            borderRadius: 99,
                            border: '1px solid currentColor',
                            background: 'rgba(255,255,255,0.9)',
                            color: 'inherit',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)',
                            textShadow: 'none'
                        }}
                    >
                        View product
                    </button>
                )}
            </div>
        </div>
        {active && renderSelection && <div style={{ padding: '0 16px 28px' }}>{renderSelection(active)}</div>}
        </div>
    );
}
