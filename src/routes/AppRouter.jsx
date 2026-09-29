import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Inicio from '../pages/Inicio'
import RutaProtegida from './RutaProtegida'

const Login = lazy(() => import('../pages/Login'))
const Registro = lazy(() => import('../pages/Registro'))
const PanelSocio = lazy(() => import('../pages/PanelSocio'))
const PanelEmpleado = lazy(() => import('../pages/PanelEmpleado'))
const PanelAdmin = lazy(() => import('../pages/PanelAdmin'))
const NoEncontrado = lazy(() => import('../pages/NoEncontrado'))

const cargando = (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-black">
    <Spinner animation="border" variant="warning" role="status">
      <span className="visually-hidden">Cargando…</span>
    </Spinner>
  </div>
)

function AppRouter() {
  return (
    <Suspense fallback={cargando}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/socio"
          element={
            <RutaProtegida rol="socio">
              <PanelSocio />
            </RutaProtegida>
          }
        />
        <Route
          path="/empleado"
          element={
            <RutaProtegida rol="empleado">
              <PanelEmpleado />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin"
          element={
            <RutaProtegida rol="admin">
              <PanelAdmin />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
