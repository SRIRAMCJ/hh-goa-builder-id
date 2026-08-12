'use client';

import { useEffect, useRef, useState } from 'react';

const terminalLines = [
  'INITIALIZING HH GOA BUILDER SYSTEM...',
  'CONNECTING TO GOA NODE............... ✓',
  'SCANNING BUILDER ID.................. ✓',
  'IDENTITY VERIFIED.................... ✓',
  'LOADING BUILDER PROFILE.............. ✓',
  'DIGITAL IDENTITY READY............... ✓',
];

export default function ExperienceLauncher() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [arOpen, setArOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!terminalOpen) return;
    setStep(0);
    const timer = window.setInterval(() => setStep((value) => Math.min(value + 1, terminalLines.length)), 420);
    return () => window.clearInterval(timer);
  }, [terminalOpen]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const openAR = async () => {
    setCameraError('');
    setArOpen(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError('Camera access was blocked. Allow camera permission and try again.');
    }
  };

  const closeAR = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setArOpen(false);
    setCameraError('');
  };

  return (
    <>
      <div className="experienceLauncher" aria-label="HH Goa interactive experiences">
        <button className="experienceTerminal" onClick={() => setTerminalOpen(true)}>&gt; TERMINAL MODE</button>
        <button className="experienceAR" onClick={openAR}>✨ BUILDER AR</button>
      </div>

      {terminalOpen && (
        <div className="terminalOverlay" role="dialog" aria-modal="true" aria-label="HH Goa Hacker Terminal">
          <div className="terminalWindow">
            <div className="terminalBar"><span>HHG26://BUILDER-SYSTEM</span><button onClick={() => setTerminalOpen(false)} aria-label="Close terminal">×</button></div>
            <div className="terminalBody">
              <div className="terminalLogo">HH GOA // BUILDER SYSTEM v2026.10</div>
              {terminalLines.slice(0, step).map((line) => <div className="terminalLine" key={line}><span>&gt;</span> {line}</div>)}
              {step >= terminalLines.length && (
                <>
                  <div className="terminalProfile">
                    <div>╔══════════════════════════════════╗</div>
                    <div>║ BUILDER SYSTEM ONLINE            ║</div>
                    <div>║ EVENT  : HH GOA 2026             ║</div>
                    <div>║ MODE   : BUILD / CONNECT / SHIP ║</div>
                    <div>║ STATUS : READY ✓                 ║</div>
                    <div>╚══════════════════════════════════╝</div>
                  </div>
                  <div className="terminalReady">BUILD. CONNECT. SHIP. CELEBRATE.</div>
                  <button className="terminalEnter" onClick={() => setTerminalOpen(false)}>[ ENTER BUILDER STUDIO ]</button>
                </>
              )}
              <div className="terminalCursor">▌</div>
            </div>
          </div>
        </div>
      )}

      {arOpen && (
        <div className="arOverlay" role="dialog" aria-modal="true" aria-label="HH Goa Builder AR">
          <video ref={videoRef} className="arVideo" autoPlay playsInline muted />
          <div className="arHud">
            <div className="arTopLine">HH GOA // BUILDER AR <span>● LIVE</span></div>
            <div className="arScanFrame"><i></i><i></i><i></i><i></i><div>POINT CAMERA AT YOUR BUILDER CARD</div></div>
            <div className="arIdentity">
              <div className="arTag">IDENTITY DETECTED</div>
              <div className="arName">BUILDER</div>
              <div className="arClass">HH GOA BUILDER</div>
              <div className="arRole">BUILD · CONNECT · SHIP</div>
              <div className="arStatus">⚡ BUILDER MODE</div>
              <div className="arEnergy">GOA ENERGY <strong>94%</strong></div>
              <div className="arId">HHG26 // VERIFIED</div>
            </div>
            <div className="arGoa">🌴 &nbsp; BUILD IN GOA &nbsp; ✦ &nbsp; SHIP FROM PARADISE &nbsp; 🌴</div>
            {cameraError && <div className="cameraError">{cameraError}</div>}
            <button className="arClose" onClick={closeAR}>CLOSE AR ×</button>
          </div>
        </div>
      )}
    </>
  );
}
