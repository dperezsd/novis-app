import { useState } from 'react';
import Card from '../shared/Card.jsx';
import Button from '../shared/Button.jsx';
import BrandMark from '../shared/BrandMark.jsx';
import { checkAdminPassword } from '../../utils/adminAuth.js';
import './Admin.css';

/**
 * Pantalla de acceso al modo administrador. Pide una contrasena
 * simple antes de habilitar el historial y la exportacion de PDF.
 */
export default function AdminLogin({ onSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!checkAdminPassword(password)) {
      setError('Contraseña incorrecta.');
      return;
    }

    setError('');
    setPassword('');
    onSuccess();
  };

  return (
    <div className="anp-page">
      <Card>
        <BrandMark size="sm" />
        <h1 className="anp-admin-title">Acceso administrador</h1>
        <p className="anp-admin-lead">
          Ingresa la contraseña de administrador para ver el historial de aplicaciones y exportar
          resultados.
        </p>

        <form onSubmit={handleSubmit} className="anp-form">
          <label className="anp-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Contraseña de administrador"
              autoFocus
            />
          </label>

          {error && <p className="anp-form__error">{error}</p>}

          <div className="anp-admin-actions" style={{ flexDirection: 'row' }}>
            <Button type="submit">Ingresar</Button>
            <Button variant="ghost" onClick={onCancel} type="button">
              Volver
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
