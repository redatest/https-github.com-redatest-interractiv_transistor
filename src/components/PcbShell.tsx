import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';

/**
 * Habillage 3D commun des platines : épaisseur réelle (tranche FR-4), masque de soudure texturé,
 * ombre portée sur le plan de travail et reflet qui suit l'inclinaison.
 * Les enfants (le SVG du circuit) sont posés sur la face supérieure.
 */

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// Tranche : les couches les plus basses sont les plus sombres (fibre de verre + résine).
const EDGE_LAYERS = [
  { z: -1.5, color: '#8f7a45' },
  { z: -3, color: '#7c6a3c' },
  { z: -4.5, color: '#6b5b33' },
  { z: -6, color: '#5a4c2b' },
];

interface PcbShellProps {
  children: ReactNode;
  /** Inclinaison en degrés */
  rx: number;
  rz?: number;
  className?: string;
  radius?: number;
  /** Durée de la transition d'inclinaison (ms) ; 0 pour la couper (drag). */
  transitionMs?: number;
  style?: CSSProperties;
}

export function PcbShell({
  children,
  rx,
  rz = 0,
  className = '',
  radius = 14,
  transitionMs = 250,
  style,
}: PcbShellProps) {
  const reduceMotion =
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const dur = reduceMotion ? 0 : transitionMs;

  // Le reflet glisse avec l'angle de vue : plus la platine se couche, plus il monte.
  const sheenX = 50 + rz * 5;
  const sheenY = 18 + rx * 0.9;

  return (
    <div
      className={`relative ${className}`}
      dir="ltr"
      style={{
        transform: `rotateX(${rx}deg) rotateZ(${rz}deg)`,
        transformStyle: 'preserve-3d',
        transition: dur ? `transform ${dur}ms ease-out` : 'none',
        ...style,
      }}
    >
      {/* Ombre de contact + ombre diffuse sur le plan de travail */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: radius,
          transform: 'translateZ(-26px) translateY(10px) scale(0.985)',
          background: 'rgba(5, 14, 10, 0.55)',
          filter: 'blur(14px)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: radius,
          transform: 'translateZ(-8px) translateY(3px)',
          background: 'rgba(0, 0, 0, 0.5)',
          filter: 'blur(3px)',
        }}
      />

      {/* Tranche de la carte */}
      {EDGE_LAYERS.map((l) => (
        <div
          key={l.z}
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: radius, transform: `translateZ(${l.z}px)`, background: l.color }}
        />
      ))}

      {/* Face supérieure : masque de soudure */}
      <div
        className="relative"
        style={{
          borderRadius: radius,
          background:
            'radial-gradient(120% 90% at 30% 15%, #23996a 0%, #1a7c53 45%, #0f5a3b 100%)',
          boxShadow:
            'inset 0 0 0 1px rgba(167, 243, 208, 0.28), inset 0 2px 0 rgba(255,255,255,0.10), inset 0 -18px 30px rgba(3, 30, 18, 0.45)',
        }}
      >
        {/* Grain du vernis */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: radius, backgroundImage: GRAIN, backgroundSize: '180px 180px', opacity: 0.16, mixBlendMode: 'overlay' }}
        />
        {children}
        {/* Reflet du vernis, au-dessus du circuit */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: radius,
            background: `radial-gradient(60% 45% at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.20), rgba(255,255,255,0) 70%)`,
            mixBlendMode: 'soft-light',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Inclinaison à la souris/au doigt. Le glisser ne démarre qu'après quelques pixels de déplacement,
 * pour ne pas gêner les clics sur les composants de la platine ; un clic qui termine un glisser est ignoré.
 * Double-clic (ou double tap) : retour à l'angle initial.
 */
export function usePcbTilt(
  initial: { rx: number; rz: number },
  limits = { rxMin: 4, rxMax: 54, rzMax: 35 },
) {
  const [rot, setRot] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const ref = useRef({ down: false, moved: false, x: 0, y: 0, justDragged: false });

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    ref.current = { down: true, moved: false, x: e.clientX, y: e.clientY, justDragged: false };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const r = ref.current;
    if (!r.down) return;
    const dx = e.clientX - r.x;
    const dy = e.clientY - r.y;
    if (!r.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      r.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    r.x = e.clientX;
    r.y = e.clientY;
    setRot((prev) => ({
      rx: Math.max(limits.rxMin, Math.min(limits.rxMax, prev.rx - dy * 0.35)),
      rz: Math.max(-limits.rzMax, Math.min(limits.rzMax, prev.rz + dx * 0.35)),
    }));
  };

  const end = () => {
    const r = ref.current;
    r.justDragged = r.moved;
    r.down = false;
    r.moved = false;
    setDragging(false);
  };

  return {
    rot,
    dragging,
    reset: () => setRot(initial),
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onDoubleClick: () => setRot(initial),
      onClickCapture: (e: React.MouseEvent) => {
        if (ref.current.justDragged) {
          ref.current.justDragged = false;
          e.stopPropagation();
          e.preventDefault();
        }
      },
    },
  };
}
