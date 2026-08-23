import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateWorkspace from './pages/CreateWorkspace'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<CreateWorkspace />} />
    </Routes>
  )
}

export default App
