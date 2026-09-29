import { Routes, Route } from 'react-router-dom'
import Inicio from '../pages/Inicio'
import Login from '../pages/Login'
import Registro from '../pages/Registro'
import PanelSocio from '../pages/PanelSocio'
import PanelEmpleado from '../pages/PanelEmpleado'
import PanelAdmin from '../pages/PanelAdmin'
import NoEncontrado from '../pages/NoEncontrado'
import RutaProtegida from './RutaProtegida'

function AppRouter() {
  return (
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
  )
}

export default AppRouter
