import Card from '../shared/Card.jsx';
import Button from '../shared/Button.jsx';
import BrandMark from '../shared/BrandMark.jsx';
import './Admin.css';

/**
 * Panel de administrador: punto de entrada a las herramientas
 * internas (historial, exportacion) despues de iniciar sesion.
 */
export default function AdminScreen({ attemptsCount, onShowHistory, onLogout }) {
  return (
    <div className="anp-page">
      <Card>
        <BrandMark size="sm" />
        <h1 className="anp-admin-title">Panel de administrador</h1>
        <p className="anp-admin-lead">Herramientas internas de Aconpiexpress para el test NOVIS.</p>

        <div className="anp-admin-actions">
          <button type="button" className="anp-admin-menu-item" onClick={onShowHistory}>
            <span className="anp-admin-menu-item__title">Historial de aplicaciones</span>
            <span className="anp-admin-menu-item__desc">
              {attemptsCount} {attemptsCount === 1 ? 'resultado guardado' : 'resultados guardados'} · ver
              detalle y exportar a PDF
            </span>
          </button>
        </div>

        <div className="anp-admin-footer-row">
          <Button variant="ghost" onClick={onLogout}>
            Cerrar sesión de administrador
          </Button>
        </div>
      </Card>
    </div>
  );
}
