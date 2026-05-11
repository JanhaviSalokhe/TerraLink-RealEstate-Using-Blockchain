import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { App } from './App';
import { Web3Provider } from './providers/Web3Provider';
import './index.css';

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('User rejected')) toast.error('Wallet request rejected');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3Provider>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(2,6,23,.9)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,.12)',
              backdropFilter: 'blur(16px)',
            },
          }}
        />
      </BrowserRouter>
    </Web3Provider>
  </React.StrictMode>,
);
