import { Table } from 'react-bootstrap'
import EstadoBadge from '../common/EstadoBadge'
import { formatearPesos } from '../../utils/carnet'
import { columnasPagos } from '../../utils/pagos'

function Encabezado({ columna, orden, onOrdenar }) {
  if (!onOrdenar) return <th scope="col">{columna.etiqueta}</th>
  const activa = orden.campo === columna.id
  return (
    <th scope="col" aria-sort={activa ? (orden.asc ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="btn btn-link p-0 text-reset text-decoration-none fw-bold text-uppercase small d-inline-flex align-items-center gap-1" onClick={() => onOrdenar(columna.id)}>
        {columna.etiqueta}
        <span className={activa ? 'text-primary' : 'text-body-tertiary'} aria-hidden="true">
          {activa ? (orden.asc ? '↑' : '↓') : '↕'}
        </span>
      </button>
    </th>
  )
}

function TablaPagos({ pagos, orden, onOrdenar }) {
  return (
    <Table responsive hover className="align-middle mb-0">
      <thead>
        <tr className="text-uppercase small">
          {columnasPagos.map((columna) => (
            <Encabezado key={columna.id} columna={columna} orden={orden} onOrdenar={onOrdenar} />
          ))}
        </tr>
      </thead>
      <tbody>
        {pagos.length === 0 && (
          <tr>
            <td colSpan={columnasPagos.length} className="text-center text-body-secondary py-4">
              No hay pagos que coincidan con el filtro.
            </td>
          </tr>
        )}
        {pagos.map((pago) => (
          <tr key={pago.id}>
            <td className="text-nowrap">{pago.fecha}</td>
            <td>{pago.concepto}</td>
            <td className="text-nowrap">{pago.medio}</td>
            <td className="text-nowrap">{formatearPesos(pago.monto)}</td>
            <td>
              <EstadoBadge estado={pago.estado} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default TablaPagos
