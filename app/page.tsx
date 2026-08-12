'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getBuilderTitle } from '@/lib/builderTitles';
import { createBuilderId, safeFilename } from '@/lib/builderId';

const moods = ['⚡ SHIPPING', '🧠 LOCKED IN', '🚀 BUILDING', '☕ DEBUGGING', '🌴 CHILL', '🌊 FLOW STATE', '🤖 AI MODE'];

function getBuilderVibe(role: string, stack: string) {
  const text = `${role} ${stack}`.toLowerCase();
  if (text.includes('ai') || text.includes('ml') || text.includes('qwen') || text.includes('agent')) return 'MAKE IT INTELLIGENT.';
  if (text.includes('unity') || text.includes('game') || text.includes('3d')) return 'MAKE IT REAL.';
  if (text.includes('design') || text.includes('ui') || text.includes('ux')) return 'MAKE IT BEAUTIFUL.';
  if (text.includes('backend') || text.includes('devops') || text.includes('cloud')) return 'MAKE IT SCALE.';
  if (text.includes('founder') || text.includes('product')) return 'START WITH ZERO.';
  return 'BUILD. SHIP. REPEAT.';
}

function getQuote(role: string) {
  const text = role.toLowerCase();
  if (text.includes('ai') || text.includes('ml')) return 'TEACH MACHINES TO DREAM.';
  if (text.includes('design')) return 'MAKE THE SIGNAL BEAUTIFUL.';
  if (text.includes('game') || text.includes('unity')) return 'TURN IDEAS INTO WORLDS.';
  if (text.includes('founder')) return 'START SMALL. SHIP LOUD.';
  return 'NO MAP. JUST BUILD.';
}

function Barcode({ value }: { value: string }) {
  const bars = value.split('').map((char, index) => {
    const n = char.charCodeAt(0);
    return { width: 1 + (n % 4), gap: n % 2, index };
  });
  return (
    <div className="barcode" aria-label={`Decorative barcode for ${value}`}>
      {bars.map((bar) => <span key={`${bar.index}-${value}`} style={{ width: `${bar.width}px`, marginRight: `${bar.gap}px` }} />)}
    </div>
  );
}

export default function Home() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [stack, setStack] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [mood, setMood] = useState(moods[0]);
  const [siteUrl, setSiteUrl] = useState('https://hh-goa-builder-id.vercel.app');
  const id = useMemo(() => createBuilderId(), []);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') setSiteUrl(window.location.origin);
  }, []);

  const title = getBuilderTitle(role, stack);
  const vibe = getBuilderVibe(role, stack);
  const quote = getQuote(role);

  const readPhoto = async (file: File) => {
    setError('');
    let f = file;
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        const heic = (await import('heic2any')).default;
        const out = await heic({ blob: file, toType: 'image/jpeg', quality: 0.9 });
        f = new File([Array.isArray(out) ? out[0] : out], 'photo.jpg', { type: 'image/jpeg' });
      } catch {
        setError('HEIC conversion failed. Try JPG or PNG.');
        return;
      }
    }
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
      setError('Please use JPG, PNG, WebP, or HEIC.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(f);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!photo) return;
    setDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (drag) setOffset({ x: e.clientX - drag.x, y: e.clientY - drag.y });
  };

  const download = async () => {
    if (!cardRef.current) return;
    const node = cardRef.current;
    if (document.fonts?.ready) await document.fonts.ready;
    const html2canvas = await import('html2canvas-pro');

    // Keep the exact live-preview layout, but render it at a much higher
    // raster resolution before downsampling to the required 1600x1000 PNG.
    // html2canvas-pro preserves the live CSS object-fit behavior of the
    // profile photo, so the person's displayed crop/size is not changed.
    const rect = node.getBoundingClientRect();
    const cssWidth = Math.max(1, rect.width);
    const cssHeight = Math.max(1, rect.height);
    const targetWidth = 1600;
    const targetHeight = 1000;
    const renderWidth = 2400;
    const renderScale = Math.min(4, Math.max(1, renderWidth / cssWidth));

    const rendered = await html2canvas.default(node, {
      width: cssWidth,
      height: cssHeight,
      scale: renderScale,
      useCORS: true,
      backgroundColor: '#f4ebd0',
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: 0,
      allowTaint: false,
    });

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetWidth;
    exportCanvas.height = targetHeight;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(rendered, 0, 0, rendered.width, rendered.height, 0, 0, targetWidth, targetHeight);

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HH-Goa-Builder-ID-${safeFilename(name || 'Builder')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  const share = () => {
    const text = `Just created my HH Goa Builder ID.\n\n${title} ⚡\n\n${vibe}\n\nSee you in Goa. 🌴\n\n#FrameInGoa`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">HH GOA 2026</div>
        <div className="tag">GOA, INDIA · 28—31 OCT 2026</div>
      </header>

      <section className="hero">
        <div className="heroGrid">
          <div>
            <div className="eyebrow">BUILDER ID GENERATOR / #FRAMEINGOA</div>
            <h1 className="title">BUILD YOUR<br /><span>BUILDER ID.</span></h1>
            <p className="subtitle">One photo. One identity. One frame. Create a share-ready HH Goa builder card in seconds.</p>

            <div className="panel">
              <div className="field">
                <label className="label">PHOTO</label>
                <div className="upload">
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,.heic" onChange={(e) => e.target.files?.[0] && readPhoto(e.target.files[0])} />
                  <div><strong>{photo ? 'CHANGE PHOTO' : 'DROP YOUR PHOTO'}</strong><small>JPG · PNG · HEIC · WEBP</small></div>
                </div>
                {error && <div className="error">{error}</div>}
              </div>

              <div className="row">
                <div className="field"><label className="label">NAME</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name." /></div>
                <div className="field"><label className="label">ROLE</label><input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" /></div>
              </div>

              <div className="field"><label className="label">STACK <span>(OPTIONAL)</span></label><input className="input" value={stack} onChange={(e) => setStack(e.target.value)} placeholder="Python · Qwen · Unity · MCP" /></div>

              <div className="field">
                <label className="label">BUILDER MOOD</label>
                <select className="input moodSelect" value={mood} onChange={(e) => setMood(e.target.value)}>{moods.map((item) => <option key={item}>{item}</option>)}</select>
              </div>

              {photo && <div className="field"><label className="label">PHOTO ZOOM</label><input style={{ width: '100%' }} type="range" min="1" max="2" step=".01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /></div>}
              <button className="primary" onClick={download}>GENERATE & DOWNLOAD PNG ↓</button>
              <div className="notice">Your photo stays on your device. No login. No upload server.</div>
            </div>
          </div>

          <div className="previewWrap">
            <div className="previewHeader"><div className="previewTitle">LIVE BUILDER ID</div><div className="previewHint">1600 × 1000 / PNG</div></div>
            <div className="cardShell">
              <div ref={cardRef} className="idcard">
                <div className="cardTop">
                  <div className="hh">HACKER<br />HOUSE</div>
                  <div className="date">GOA, INDIA<br />28—31 OCT 2026</div>
                </div>

                <div className="stamp">✦ BUILD IN GOA ✦<br /><small>SHIP FROM PARADISE</small></div>
                

                <div className="photoFrame" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
                  {photo ? <img src={photo} alt="Builder" style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin: 'center' }} /> : <div className="photoPlaceholder">YOUR<br />PHOTO<br />HERE</div>}
                </div>

                <div className="buildSticker">LET&apos;S<br />BUILD!</div>

                <div className="cardInfo">
                  <div className="cardName">{name || 'YOUR NAME'}</div>
                  <div className="cardRole">{role || 'BUILDER'}</div>
                  {stack && <div className="cardStack">{stack}</div>}
                  <div className="builderTitle">{title}</div>
                </div>

                <div className="quote">“{quote}”</div>
                <div className="moodBadge">{mood}</div>
                <div className="vibeLine">{vibe}</div>

                <div className="qrPanel">
                  <div className="qrCode"><QRCodeSVG value={siteUrl} size={92} bgColor="#f4ebd0" fgColor="#063b20" includeMargin /></div>
                  <div className="qrText">SCAN / VISIT<br /><strong>BUILDER STUDIO</strong></div>
                </div>

                <div className="miniFacts"><span>✦ BEACH BAG</span><span>✦ BUILD MODE</span><span>✦ GOA ENERGY</span></div>

                <div className="builderMeta">
                  <div className="metaLabel">BUILDER ID</div>
                  <div className="builderIdValue">#{id}</div>
                  <Barcode value={id} />
                </div>

                <div className="footer">#FrameInGoa</div>
                <div className="cardBottom">✦ BUILD · CONNECT · SHIP · CELEBRATE ✦</div>
              </div>
            </div>
            <div className="actions"><button className="action" onClick={download}>↓ DOWNLOAD PNG</button><button className="action x" onClick={share}>𝕏 SHARE TO X</button></div>
          </div>
        </div>
      </section>
      <footer className="footerSite"><span>BUILD · CONNECT · SHIP · CELEBRATE</span><span>HH GOA 2026</span><span>Use desktop mode when accessing it on mobile</span></footer>
    </main>
  );
}
