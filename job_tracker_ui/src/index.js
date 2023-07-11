import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

// See https://react.dev/reference/react-dom/client/createRoot#createroot for
// information on rendering root node in React.
const rootNode = document.getElementById('root');
const root = createRoot(rootNode);
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();