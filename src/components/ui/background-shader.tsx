'use client';

import { MeshGradient } from '@paper-design/shaders-react';

/**
 * Animated mesh-gradient background. Sits fixed behind all content (z-index -1)
 * so the frosted-glass surfaces blur over a living gradient instead of a static
 * photo. pointer-events disabled so it never intercepts interaction.
 */
export default function BackgroundShader() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
    >
      <MeshGradient
        style={{ height: '100%', width: '100%' }}
        distortion={0.8}
        swirl={0.1}
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={1}
        colors={[
          'hsl(216, 90%, 27%)',
          'hsl(243, 68%, 36%)',
          'hsl(205, 91%, 64%)',
          'hsl(211, 61%, 57%)',
        ]}
      />
    </div>
  );
}
