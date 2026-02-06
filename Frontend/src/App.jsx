import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import Students from './pages/Students'
import Settings from './pages/Settings'
import Teams from './pages/Teams'
import Military from './pages/Military'
import Research from './pages/Research'
import OAuth from './pages/OAuth'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

export default function App(){
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>نظام التربية العسكرية - لوحة الإدارة</h1>
        <nav className="nav">
          <NavLink to="/" end className={({isActive})=> isActive? 'active' : ''}>بيانات الطلبة</NavLink>
          <NavLink to="/settings" className={({isActive})=> isActive? 'active' : ''}>الإعدادات</NavLink>
          <NavLink to="/teams" className={({isActive})=> isActive? 'active' : ''}>بيانات المجموعات</NavLink>
          <NavLink to="/military" className={({isActive})=> isActive? 'active' : ''}>المقيدين في التربية العسكرية</NavLink>
          <NavLink to="/research" className={({isActive})=> isActive? 'active' : ''}>الأبحاث</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Students/>} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/teams" element={<Teams/>} />
          <Route path="/military" element={<Military/>} />
          <Route path="/research" element={<Research/>} />

          {/* OAuth redirect handler */}
          <Route path="/oauth" element={<OAuth/>} />
        </Routes>
      </main>
    </div>
  )
}
