import { Container } from 'react-bootstrap'
import RedesSociales from '../common/RedesSociales'
import Sponsors from '../common/Sponsors'
import { redes, sponsors } from '../../data/club'

const PiePagina = ({ children }) => {
  return (
    <footer className="text-white">
      {children && (
        <div className="bg-body-tertiary text-body border-top border-warning border-3 py-4">
          <Container>{children}</Container>
        </div>
      )}
      <div className="bg-dark py-2">
        <Container className="d-flex justify-content-end">
          <RedesSociales redes={redes} />
        </Container>
      </div>
      <div className="bg-secondary py-3">
        <Sponsors sponsors={sponsors} />
      </div>
    </footer>
  )
}

export default PiePagina
