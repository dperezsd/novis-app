import { useCallback, useState } from 'react';

/**
 * Maneja el estado de sesion del modo administrador. Deliberadamente
 * NO persiste en localStorage/sessionStorage: si se recarga la pagina
 * o se cierra el navegador, el acceso admin se pierde y hay que volver
 * a ingresar la contrasena. Esto evita que, en un computador compartido
 * de recepcion, una sesion admin quede abierta para el siguiente
 * candidato que use el equipo.
 */
export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);

  const login = useCallback(() => {
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}
