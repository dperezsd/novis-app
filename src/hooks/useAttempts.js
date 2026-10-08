import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'novis:attempts';

function readFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('No se pudo leer el historial de intentos:', error);
    return [];
  }
}

function writeToStorage(attempts) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    return true;
  } catch (error) {
    console.error('No se pudo guardar el historial de intentos:', error);
    return false;
  }
}

/**
 * Hook que expone el historial de aplicaciones del test y permite
 * agregar nuevos resultados, persistiendolos en localStorage.
 */
export function useAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAttempts(readFromStorage());
    setIsLoaded(true);
  }, []);

  const addAttempt = useCallback((attempt) => {
    setAttempts((prev) => {
      const updated = [attempt, ...prev];
      writeToStorage(updated);
      return updated;
    });
  }, []);

  const clearAttempts = useCallback(() => {
    setAttempts([]);
    writeToStorage([]);
  }, []);

  /**
   * Elimina un unico intento del historial por su id.
   */
  const removeAttempt = useCallback((attemptId) => {
    setAttempts((prev) => {
      const updated = prev.filter((attempt) => attempt.id !== attemptId);
      writeToStorage(updated);
      return updated;
    });
  }, []);

  /**
   * Verifica si un candidato (identificado por su candidateId, ver
   * utils/candidateId.js) ya presento el test previamente.
   */
  const hasAttempted = useCallback(
    (candidateId) => attempts.some((attempt) => attempt.candidateId === candidateId),
    [attempts]
  );

  return { attempts, addAttempt, clearAttempts, removeAttempt, hasAttempted, isLoaded };
}
