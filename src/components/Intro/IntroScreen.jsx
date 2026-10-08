import { useState } from 'react';
import Card from '../shared/Card.jsx';
import Button from '../shared/Button.jsx';
import BrandMark from '../shared/BrandMark.jsx';
import CandidateForm from './CandidateForm.jsx';
import { QUESTIONS } from '../../data/questions.js';
import './Intro.css';

/**
 * Pantalla inicial: presenta el test y captura los datos del candidato
 * antes de habilitar el boton de inicio. No expone el historial de
 * aplicaciones -- eso solo es accesible desde el modo administrador.
 */
export default function IntroScreen({ candidate, onCandidateChange, onStart, alreadyAttempted, onGoToAdmin }) {
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!candidate.nombre.trim() || !candidate.documento.trim() || !candidate.edad || !candidate.sexo) {
      setError('Completa nombre, documento, edad y sexo para continuar.');
      return;
    }

    if (alreadyAttempted) {
      setError('Este documento ya presentó el test NOVIS. No se puede repetir.');
      return;
    }

    setError('');
    onStart();
  };

  return (
    <div className="anp-page">
      <Card>
        <div className="anp-intro-hero">
          <p className="anp-intro-hero__eyebrow">Test de habilidad mental</p>
          <h1 className="anp-intro-hero__title">NOVIS</h1>
          <p className="anp-intro-hero__lead">
            Mide agilidad mental y solución de problemas bajo presión de tiempo, a través de {QUESTIONS.length}{' '}
            reactivos de razonamiento verbal, abstracto y lógico.
          </p>
        </div>

        <BrandMark size="sm" />

        <CandidateForm candidate={candidate} onChange={onCandidateChange} error={error} />

                <div className="anp-intro-actions">
          <Button onClick={handleStart}>Comenzar test</Button>
          <Button variant="ghost" onClick={onGoToAdmin}>
            Acceso administrador
          </Button>
        </div>

        <p className="anp-intro-footnote">
          {QUESTIONS.length} reactivos · tiempo límite 30 minutos · un intento por persona
        </p>
      </Card>
    </div>
  );
}
