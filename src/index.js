import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
