import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Orb from './components/Orb';

createRoot(document.getElementById('orb-root')).render(
  <StrictMode>
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Orb
        hoverIntensity={0.5}
        rotateOnHover={true}
        hue={0}
        forceHoverState={false}
        backgroundColor="#020617"
      />
    </div>
  </StrictMode>
);
