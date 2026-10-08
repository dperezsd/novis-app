import { useCallback, useEffect, useState } from 'react';
import IntroScreen from './components/Intro/IntroScreen.jsx';
import InstructionsScreen from './components/Intro/InstructionsScreen.jsx';
import TestScreen from './components/Test/TestScreen.jsx';
import ResultScreen from './components/Result/ResultScreen.jsx';
import HistoryScreen from './components/History/HistoryScreen.jsx';
import AttemptDetailScreen from './components/History/AttemptDetailScreen.jsx';
import AdminLogin from './components/Admin/AdminLogin.jsx';
import AdminScreen from './components/Admin/AdminScreen.jsx';
import BrandMark from './components/shared/BrandMark.jsx';
import { useAttempts } from './hooks/useAttempts.js';
import { useTestProgress } from './hooks/useTestProgress.js';
import { useAdminSession } from './hooks/useAdminSession.js';
import { gradeTest } from './utils/gradeTest.js';
import { getCandidateId } from './utils/candidateId.js';
import { computeSecondsLeft } from './utils/timeRemaining.js';
import './styles/layout.css';
import './components/Admin/Admin.css';

const STAGES = {
  INTRO: 'intro',
  INSTRUCTIONS: 'instructions',
  TEST: 'test',
  RESULT: 'result',
  ADMIN_LOGIN: 'adminLogin',
  ADMIN: 'admin',
  HISTORY: 'history',
  ATTEMPT_DETAIL: 'attemptDetail',
};

const EMPTY_CANDIDATE = { nombre: '', documento: '', edad: '', sexo: '', puesto: '' };

// Stages en las que no tiene sentido mostrar el enlace discreto de
// acceso administrador (durante el test, para no distraer al
// candidato; y dentro de las propias pantallas de administrador).
const STAGES_WITHOUT_ADMIN_LINK = [
  STAGES.TEST,
  STAGES.ADMIN_LOGIN,
  STAGES.ADMIN,
  STAGES.HISTORY,
  STAGES.ATTEMPT_DETAIL,
];

export default function App() {
  const [stage, setStage] = useState(STAGES.INTRO);
  const [candidate, setCandidate] = useState(EMPTY_CANDIDATE);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [testStartedAt, setTestStartedAt] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [hasResumed, setHasResumed] = useState(false);

  const { attempts, addAttempt, removeAttempt, clearAttempts, hasAttempted, isLoaded: attemptsLoaded } = useAttempts();
  const { progress, isLoaded: progressLoaded, saveProgress, clearProgress } = useTestProgress();
  const { isAdmin, login: adminLogin, logout: adminLogout } = useAdminSession();

  // --- Recuperar un test a medias si la pagina se recargo ---
  useEffect(() => {
    if (!attemptsLoaded || !progressLoaded || hasResumed) return;

    if (!progress) {
      setHasResumed(true);
      return;
    }

    const alreadyGraded = hasAttempted(progress.candidateId);
    if (alreadyGraded) {
      // El progreso quedo huerfano (el intento ya fue calificado antes).
      clearProgress();
      setHasResumed(true);
      return;
    }

    const remaining = computeSecondsLeft(progress.startedAt);

    if (remaining <= 0) {
      // El tiempo se agoto mientras la pestaña estaba cerrada: se
      // califica con las respuestas que alcanzo a guardar.
      const graded = gradeTest({ answers: progress.answers, sexo: progress.candidate.sexo });
      const attempt = {
        id: Date.now(),
        candidateId: progress.candidateId,
        fecha: new Date().toISOString(),
        nombre: progress.candidate.nombre,
        documento: progress.candidate.documento,
        edad: progress.candidate.edad,
        sexo: progress.candidate.sexo,
        puesto: progress.candidate.puesto,
        ...graded,
      };

      addAttempt(attempt);
      clearProgress();
      setCandidate(progress.candidate);
      setResult(attempt);
      setStage(STAGES.RESULT);
      setHasResumed(true);
      return;
    }

    // Progreso valido: retomar el test exactamente donde iba.
    setCandidate(progress.candidate);
    setAnswers(progress.answers);
    setTestStartedAt(progress.startedAt);
    setStage(STAGES.TEST);
    setHasResumed(true);
  }, [attemptsLoaded, progressLoaded, hasResumed, progress, hasAttempted, addAttempt, clearProgress]);

  // --- Flujo candidato ---

  const handleGoToInstructions = useCallback(() => {
    setStage(STAGES.INSTRUCTIONS);
  }, []);

  const handleStartTest = useCallback(() => {
    const startedAt = Date.now();
    const candidateId = getCandidateId(candidate);

    setAnswers({});
    setTestStartedAt(startedAt);
    saveProgress({ candidateId, candidate, answers: {}, startedAt });
    setStage(STAGES.TEST);
  }, [candidate, saveProgress]);

  const handleAnswer = useCallback(
    (questionNumber, optionKey) => {
      setAnswers((prev) => {
        const updated = { ...prev, [questionNumber]: optionKey };
        saveProgress({
          candidateId: getCandidateId(candidate),
          candidate,
          answers: updated,
          startedAt: testStartedAt,
        });
        return updated;
      });
    },
    [saveProgress, candidate, testStartedAt]
  );

  const handleFinishTest = useCallback(() => {
    const graded = gradeTest({ answers, sexo: candidate.sexo });

    const attempt = {
      id: Date.now(),
      candidateId: getCandidateId(candidate),
      fecha: new Date().toISOString(),
      nombre: candidate.nombre,
      documento: candidate.documento,
      edad: candidate.edad,
      sexo: candidate.sexo,
      puesto: candidate.puesto,
      ...graded,
    };

    setResult(attempt);
    addAttempt(attempt);
    clearProgress();
    setStage(STAGES.RESULT);
  }, [answers, candidate, addAttempt, clearProgress]);

  const handleRestart = useCallback(() => {
    setCandidate(EMPTY_CANDIDATE);
    setAnswers({});
    setResult(null);
    setTestStartedAt(null);
    setStage(STAGES.INTRO);
  }, []);

  const candidateId = getCandidateId(candidate);
  const alreadyAttempted =
    candidate.documento.trim() && candidate.nombre.trim() ? hasAttempted(candidateId) : false;

  // --- Flujo administrador ---

  const handleGoToAdminLogin = useCallback(() => setStage(STAGES.ADMIN_LOGIN), []);

  const handleAdminLoginSuccess = useCallback(() => {
    adminLogin();
    setStage(STAGES.ADMIN);
  }, [adminLogin]);

  const handleAdminCancel = useCallback(() => setStage(STAGES.INTRO), []);

  const handleAdminLogout = useCallback(() => {
    adminLogout();
    setStage(STAGES.INTRO);
  }, [adminLogout]);

  const handleShowHistoryFromAdmin = useCallback(() => setStage(STAGES.HISTORY), []);

  const handleBackFromHistory = useCallback(() => setStage(STAGES.ADMIN), []);

  const handleSelectAttempt = useCallback((attempt) => {
    setSelectedAttempt(attempt);
    setStage(STAGES.ATTEMPT_DETAIL);
  }, []);

  const handleBackFromDetail = useCallback(() => setStage(STAGES.HISTORY), []);

  const showAdminLink = !STAGES_WITHOUT_ADMIN_LINK.includes(stage);

  return (
    <div className="anp-app">
      <header className="anp-app__header">
        <div className="anp-app__header-inner">
          <BrandMark />
        </div>
      </header>

      <main className="anp-app__main">
                {stage === STAGES.INTRO && (
          <IntroScreen
            candidate={candidate}
            onCandidateChange={setCandidate}
            onStart={handleGoToInstructions}
            alreadyAttempted={alreadyAttempted}
            onGoToAdmin={handleGoToAdminLogin}
          />
        )}

        {stage === STAGES.INSTRUCTIONS && (
          <InstructionsScreen
            candidateName={candidate.nombre}
            onBack={() => setStage(STAGES.INTRO)}
            onConfirm={handleStartTest}
          />
        )}

        {stage === STAGES.TEST && (
          <TestScreen
            answers={answers}
            onAnswer={handleAnswer}
            onFinish={handleFinishTest}
            startedAt={testStartedAt}
          />
        )}

        {stage === STAGES.RESULT && result && <ResultScreen result={result} onRestart={handleRestart} />}

        {stage === STAGES.ADMIN_LOGIN && (
          <AdminLogin onSuccess={handleAdminLoginSuccess} onCancel={handleAdminCancel} />
        )}

        {stage === STAGES.ADMIN && isAdmin && (
          <AdminScreen
            attemptsCount={attempts.length}
            onShowHistory={handleShowHistoryFromAdmin}
            onLogout={handleAdminLogout}
          />
        )}

        {stage === STAGES.HISTORY && isAdmin && (
          <HistoryScreen
            attempts={attempts}
            onBack={handleBackFromHistory}
            onSelectAttempt={handleSelectAttempt}
            onDeleteAttempt={removeAttempt}
            onClearAll={clearAttempts}
          />
        )}

        {stage === STAGES.ATTEMPT_DETAIL && isAdmin && selectedAttempt && (
          <AttemptDetailScreen attempt={selectedAttempt} onBack={handleBackFromDetail} />
        )}
      </main>

            <footer className="anp-app__footer">
        <p>Test NOVIS · Aconpiexpress · uso interno</p>
      </footer>
    </div>
  );
}
