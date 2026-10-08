import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../shared/Card.jsx';
import Button from '../shared/Button.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import AnswerOption from './AnswerOption.jsx';
import QuestionJumpGrid from './QuestionJumpGrid.jsx';
import { QuestionFigure } from './TestFigures.jsx';
import Timer from './Timer.jsx';
import { useCountdown } from '../../hooks/useCountdown.js';
import { QUESTIONS } from '../../data/questions.js';
import { computeSecondsLeft } from '../../utils/timeRemaining.js';
import './Test.css';

/**
 * Pantalla de aplicacion del test: muestra una pregunta a la vez,
 * permite navegar libremente y confirma antes de finalizar si hay
 * preguntas sin responder. El tiempo restante se calcula en base al
 * momento real de inicio (startedAt) para que sea resistente a
 * recargas de pagina.
 */
export default function TestScreen({ answers, onAnswer, onFinish, startedAt }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const initialSecondsLeft = useMemo(() => computeSecondsLeft(startedAt), [startedAt]);

  const handleTimeExpired = useCallback(() => {
    onFinish();
  }, [onFinish]);

  // Si el tiempo ya se agoto (por ejemplo, el candidato reabrio la
  // pestaña mucho despues), finaliza y califica de inmediato.
  useEffect(() => {
    if (initialSecondsLeft <= 0) {
      onFinish();
    }
    // Solo debe evaluarse una vez al montar la pantalla del test.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const secondsLeft = useCountdown(initialSecondsLeft, handleTimeExpired, initialSecondsLeft > 0);

  const question = QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = useMemo(() => Math.round((currentIndex / QUESTIONS.length) * 100), [currentIndex]);
  const isLast = currentIndex === QUESTIONS.length - 1;

  const goTo = (index) => {
    setCurrentIndex(Math.min(Math.max(index, 0), QUESTIONS.length - 1));
    setConfirmSubmit(false);
  };

  const handleFinishClick = () => {
    if (answeredCount < QUESTIONS.length && !confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }
    onFinish();
  };

  return (
    <div className="anp-page">
      <Card>
        <ProgressBar value={progress} />

        <div className="anp-test-header">
          <span className="anp-test-counter">
            Pregunta {question.n} de {QUESTIONS.length}
          </span>
          <Timer secondsLeft={secondsLeft} />
          <span className="anp-test-counter">{answeredCount} respondidas</span>
        </div>

        <p className="anp-question-text">{question.text}</p>

        {question.figure && (
          <div className="anp-figure-box">
            <QuestionFigure figureKey={question.figure} />
          </div>
        )}

        <div className="anp-options">
          {Object.entries(question.options ?? {}).map(([key, label]) => (
            <AnswerOption
              key={key}
              optionKey={key}
              label={label}
              selected={answers[question.n] === key}
              onSelect={(opt) => onAnswer(question.n, opt)}
            />
          ))}
        </div>

        <div className="anp-nav-row">
          <Button variant="ghost" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
            Anterior
          </Button>

          {!isLast ? (
            <Button onClick={() => goTo(currentIndex + 1)}>Siguiente</Button>
          ) : (
            <Button onClick={handleFinishClick}>Finalizar test</Button>
          )}
        </div>

        {confirmSubmit && answeredCount < QUESTIONS.length && (
          <div className="anp-warn-box">
            <p>
              Faltan {QUESTIONS.length - answeredCount} preguntas sin responder. Se calificarán como incorrectas.
            </p>
            <Button variant="secondary" onClick={onFinish}>
              Finalizar de todas formas
            </Button>
          </div>
        )}

        <QuestionJumpGrid questions={QUESTIONS} answers={answers} currentIndex={currentIndex} onJump={goTo} />
      </Card>
    </div>
  );
}
