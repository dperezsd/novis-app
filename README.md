# Test NOVIS — Aconpiexpress

Aplicación web para aplicar el Test de Habilidad Mental NOVIS con calificación
automática, análisis por área cognitiva, cronómetro de 30 minutos, progreso
resistente a recargas de página, bloqueo de intentos repetidos, modo
administrador separado del candidato, e historial exportable a PDF.

## Stack

- React 18
- Vite 5
- CSS puro con variables de diseño (sin librerías de UI externas)
- Exportación a PDF vía la función de impresión nativa del navegador (sin
  dependencias adicionales)

## Estructura del proyecto

```
novis-app/
├── index.html
├── package.json
├── vite.config.js
├── .eslintrc.cjs
├── .gitignore
├── .env.example
├── src/
│   ├── main.jsx                        # Punto de entrada de React
│   ├── App.jsx                         # Orquesta las pantallas (maquina de estados)
│   ├── data/
│   │   ├── questions.js                # Banco de 80 reactivos
│   │   ├── scoring.js                  # Clave de respuestas, areas, tabla de rangos
│   │   └── testConfig.js               # Duracion del test (30 min), centralizada
│   ├── utils/
│   │   ├── gradeTest.js                # Logica pura de calificacion (testeable)
│   │   ├── formatters.js               # Utilidades de fecha e iniciales
│   │   ├── candidateId.js              # ID unico de candidato (documento + nombre)
│   │   ├── timeRemaining.js            # Calculo de tiempo restante por reloj real
│   │   └── adminAuth.js                # Validacion de contraseña de administrador
│   ├── hooks/
│   │   ├── useAttempts.js              # Historial de resultados (localStorage)
│   │   ├── useCountdown.js             # Cuenta regresiva generica en segundos
│   │   ├── useTestProgress.js          # Progreso en curso (resiste refresh de pagina)
│   │   └── useAdminSession.js          # Sesion de administrador (en memoria)
│   ├── components/
│   │   ├── shared/                     # Button, Card, ProgressBar, BrandMark
│   │   ├── Intro/                      # Pantalla inicial, formulario, instrucciones
│   │   ├── Test/                       # Pantalla del test, cronometro, figuras
│   │   ├── Result/                     # Pantalla de resultado, metricas, areas
│   │   ├── History/                    # Historial y detalle exportable a PDF (admin)
│   │   └── Admin/                      # Login y panel de administrador
│   └── styles/
│       ├── global.css                  # Variables de diseño y reset
│       ├── layout.css                  # Layout general de la app
│       └── print.css                   # Estilos usados solo al exportar a PDF
```

### Por qué esta organización

- **`data/`** separa el contenido del test (preguntas, clave, tabla de rangos,
  duración) de la lógica y de la interfaz. Si el manual cambia o se agrega la
  Forma B, solo se toca esta carpeta.
- **`utils/gradeTest.js`** es una función pura sin dependencias de React:
  recibe respuestas y sexo, devuelve el resultado. Se puede probar de forma
  aislada sin montar componentes. Lo mismo aplica a `candidateId.js` y
  `timeRemaining.js`.
- **`hooks/`** aísla toda la persistencia (localStorage) y el estado
  compartido del resto de la app. Si en el futuro se cambia a una base de
  datos o API, solo se reemplazan estos archivos.
- **`components/`** está dividido por pantalla y cada una tiene sus propios
  estilos co-ubicados (`*.css` junto al `.jsx`), más una carpeta `shared/`
  para piezas reutilizables.
- Cada componente hace una sola cosa y recibe datos por props — sin estado
  global compartido innecesario, sin lógica de negocio mezclada con JSX.

## Funcionalidad completa

### Flujo del candidato
1. **Datos del candidato** — nombre, documento, edad, sexo, puesto.
2. **Instrucciones** — qué mide el test, tiempo límite, que no se puede repetir.
3. **Test cronometrado (30 min)** — 80 reactivos, navegación libre, figuras
   reales del manual en los 8 reactivos gráficos.
4. **Resultado** — CI, rango y desglose por área cognitiva.

El candidato **no tiene acceso** al historial de otros resultados en ningún
punto de este flujo.

### Cronómetro resistente a recargas de página
El tiempo restante no se calcula con un contador que reinicia en cada
montaje del componente, sino a partir del **momento real de inicio**
(`startedAt`, guardado como timestamp). Si el candidato refresca la página a
mitad de test:
- Sus respuestas se recuperan tal como estaban (guardadas en cada clic, ver
  `useTestProgress.js`).
- El cronómetro sigue contando desde el tiempo real transcurrido, no desde
  30:00 de nuevo — así un refresh no regala tiempo extra.
- Si el tiempo ya se agotó mientras la pestaña estaba cerrada, el sistema
  califica automáticamente con las respuestas guardadas hasta ese momento.

### Bloqueo de intentos repetidos
Cada candidato se identifica de forma única combinando **documento +
nombre** (normalizados: sin mayúsculas ni espacios extra). Si ese mismo
documento ya tiene un resultado en el historial, el sistema no permite
iniciar el test de nuevo.

### Modo administrador
Accesible desde un enlace discreto **"Acceso administrador"** en el pie de
la aplicación (oculto mientras alguien está rindiendo el test). Pide una
contraseña simple definida en `src/utils/adminAuth.js`:

```js
const ADMIN_PASSWORD = 'novis-admin-2026';
```

**Cambia esta contraseña antes de usar la app con candidatos reales.**

La sesión de administrador vive solo en memoria (no se guarda en
localStorage/sessionStorage): si se recarga la página o se cierra el
navegador, hay que volver a ingresar la contraseña. Esto evita que, en un
computador compartido de recepción, quede una sesión admin abierta para el
siguiente candidato.

Desde el panel de administrador se accede a:
- **Historial de aplicaciones** — todos los resultados guardados.
- **Detalle de cada resultado** — clic en cualquier fila del historial.

### Exportar a PDF
Desde el detalle de un resultado (solo administrador), el botón **"Descargar
PDF"** abre el diálogo de impresión del navegador con una vista ya
formateada (logo, nombre, documento, CI, rango, desglose por área). Elige
**"Guardar como PDF"** como destino de impresión para generar el archivo.

Se optó por este mecanismo (en vez de una librería de generación de PDF)
porque no agrega dependencias externas, funciona en cualquier navegador
moderno sin instalar nada adicional, y es más robusto para un uso interno en
un solo computador fijo de la empresa.

## Paleta de diseño (Aconpiexpress)

Basada en el sitio corporativo: azul marino profundo como color de marca,
azul medio como acento interactivo y cian como detalle. Definida como
variables CSS en `src/styles/global.css`:

| Variable | Uso |
|---|---|
| `--anp-navy-950` / `--anp-navy-900` | Fondos oscuros, textos de marca |
| `--anp-blue-600` / `--anp-blue-700` | Botones primarios, acentos interactivos |
| `--anp-cyan-400` | Detalles, gradientes, resaltados |
| `--anp-surface` / `--anp-surface-alt` | Fondos de tarjetas y de página |

## Novedades de esta versión

### 1. Progreso persistente + bloqueo de repetición

- Cada candidato se identifica de forma única combinando **documento + nombre**
  (ver `src/utils/candidateId.js`). Si el mismo documento ya presentó el test,
  el sistema bloquea un segundo intento con un mensaje claro en la pantalla
  inicial.
- El progreso del test (respuestas + momento exacto de inicio) se guarda en
  `localStorage` en cada respuesta (`src/hooks/useTestProgress.js`). Si el
  navegador se recarga a mitad de test, la app retoma automáticamente al
  candidato justo donde iba.
- El cronómetro se calcula por **tiempo real transcurrido** desde que se
  presionó "Entendido, comenzar" (`src/utils/timeRemaining.js`), no por un
  contador que reinicia al recargar. Esto evita que refrescar la página le dé
  minutos extra al candidato. Si el tiempo ya se agotó mientras la pestaña
  estaba cerrada, el sistema califica automáticamente con lo que se alcanzó a
  responder.

### 2. Modo administrador

- Acceso mediante un enlace discreto **"Acceso administrador"** en el pie de
  página (oculto mientras un candidato está rindiendo el test).
- Protegido con una contraseña simple definida en `src/utils/adminAuth.js`
  (contraseña por defecto: `novis-admin-2026`). **Cámbiala antes de usar la
  app en producción.**
- La sesión de administrador vive solo en memoria (no se guarda en
  `localStorage`/`sessionStorage`): si se recarga la página, hay que volver a
  ingresar la contraseña. Esto evita que quede una sesión abierta en un
  computador de recepción compartido.
- El candidato **nunca** ve el historial ni el botón de administrador durante
  el test ni en la pantalla de resultado.

### 3. Exportar / imprimir resultado en PDF

- Desde el historial (solo accesible en modo administrador), cada resultado
  se puede abrir en una vista de detalle con nombre, documento, CI, rango y
  desglose por área.
- El botón **"Descargar PDF"** usa la función de impresión nativa del
  navegador (`window.print()`) con estilos dedicados (`src/styles/print.css`)
  que ocultan todo el resto de la interfaz y dejan solo el resultado con el
  membrete de Aconpiexpress. Al imprimir, se elige "Guardar como PDF" como
  destino. Esta decisión evita depender de una librería externa de generación
  de PDF (más peso, más riesgo de fallas de instalación) y funciona igual en
  Chrome, Edge y Firefox sin configuración adicional.

## Configuración del entorno (paso a paso)

### 1. Instala Node.js

Necesitas Node.js 18 o superior. Verifica si ya lo tienes:

```bash
node -v
```

Si no lo tienes, descárgalo desde [nodejs.org](https://nodejs.org) (elige la
versión LTS).

### 2. Instala las dependencias del proyecto

Desde la carpeta raíz del proyecto (`novis-app/`):

```bash
npm install
```

### 3. Corre el proyecto en modo desarrollo

```bash
npm run dev
```

Esto levanta un servidor local (normalmente en `http://localhost:5173`) y
abre el navegador automáticamente.

### 4. Genera la build de producción (opcional)

```bash
npm run build
```

Para previsualizar esa build localmente:

```bash
npm run preview
```

### 5. Revisa el código con el linter (opcional pero recomendado)

```bash
npm run lint
```

## Notas sobre las figuras del test

Las 6 preguntas con contenido gráfico (5, 18, 39, 54, 66 y 78, esta última
compartida con las preguntas 79 y 80) usan las imágenes reales del manual
NOVIS, ubicadas en `src/assets/figures/`. Si necesitas reemplazarlas,
mantén los mismos nombres de archivo referenciados en
`src/components/Test/TestFigures.jsx`.

## Persistencia de datos

El historial de aplicaciones y el progreso en curso se guardan en el
`localStorage` del navegador. Esto significa que:

- Los datos quedan solo en el dispositivo/navegador donde se aplicó el test
  — pensado para uso en un único computador fijo de la empresa.
- La clave de respuestas correctas (`ANSWER_KEY` en `src/data/scoring.js`)
  viaja al navegador del candidato como parte del código de la aplicación.
  Para uso interno en un equipo controlado esto es un riesgo bajo, pero si
  en el futuro el test se aplica desde múltiples dispositivos o de forma
  pública, conviene mover la calificación a un backend.
- Si necesitas centralizar resultados entre varios equipos de la empresa,
  el siguiente paso natural es reemplazar `useAttempts.js` y
  `useTestProgress.js` por llamadas a una API o base de datos, y el login de
  administrador por autenticación real (avísame si quieres que lo prepare).
