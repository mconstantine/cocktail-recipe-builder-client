import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { App } from './App'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Ingredients } from './pages/Ingredients/Ingredients'
import { Ingredient } from './pages/Ingredient/Ingredient'
import { Cocktails } from './pages/Cocktails/Cocktails'
import { Cocktail } from './pages/Cocktail/Cocktail'
import { CreateIngredient } from './pages/CreateIngredient/CreateIngredient'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="ingredients/create" element={<CreateIngredient />} />
          <Route path="ingredients/:id" element={<Ingredient />} />
          <Route path="cocktails" element={<Cocktails />} />
          <Route path="cocktails/:id" element={<Cocktail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
)

reportWebVitals(console.log)
