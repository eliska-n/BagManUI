import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from "react-router-dom";
import "./scss/custom.scss"


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);