import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import AppBackground from './components/AppBackground'
import Home from './pages/Home'

function Layout() {
  return (
    <>
      <AppBackground />
      <Navbar />
      <Home />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
