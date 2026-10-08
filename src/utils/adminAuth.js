/**
 * Contrasena de acceso al modo administrador.
 *
 * IMPORTANTE: esto es una validacion simple en el codigo del cliente,
 * pensada para uso interno en un unico computador de la empresa. No es
 * un mecanismo de seguridad robusto: cualquiera con acceso al codigo
 * fuente puede leer esta contrasena. Cambiala por una propia antes de
 * usar la app en produccion, y si en el futuro el test se aplica desde
 * varios dispositivos, este mecanismo deberia reemplazarse por un login
 * real contra un backend.
 */
const ADMIN_PASSWORD = 'Novis/2026';

/**
 * Verifica si la contrasena ingresada corresponde a la de administrador.
 */
export function checkAdminPassword(input) {
  return input === ADMIN_PASSWORD;
}
