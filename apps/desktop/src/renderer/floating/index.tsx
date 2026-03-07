import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import FloatingApp from './FloatingApp';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FloatingApp />
  </StrictMode>
);
