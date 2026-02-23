import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TrayMenu } from './TrayMenu';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TrayMenu />
  </StrictMode>
);
