import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Admin from './Admin.jsx';
import './styles.css';
createRoot(document.getElementById('root')).render(location.pathname.startsWith('/admin') ? <Admin /> : <App />);
