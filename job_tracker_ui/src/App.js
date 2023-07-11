import React from 'react';
import { Routes } from 'react-router';
import { BrowserRouter, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

export const App = () => {

 return (
     <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<HomePage />} exact />
              <Route path="/register" element={<RegisterPage />} />
          </Routes>
      </BrowserRouter>
     </div>
 );
}

export default App;