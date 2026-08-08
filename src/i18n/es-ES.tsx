import React from "react"
import en, { ParseErrorDictionary } from "./en-GB.tsx"

export default {
  name: "Español",
  back: "Atrás",
  settings: "Ajustes",
  fullscreen: "Pantalla completa",
  exitFullscreen: "Salir de pantalla completa",
  fullscreenError: "Error: no es posible",
  newTimerProgram: "Nuevo programa de temporizador",
  tryDemoTimer: "Probar temporizador de demostración",
  confirmClearProgram: "Se borrará tu programa actual. ¿Continuar?",
  createdBy: "Creado por",
  starOn: "Danos una estrella en",

  beepCountdownTitle: "Cuenta atrás con «pitido»",
  beepHint:
    "Cuenta atrás los últimos 3 segundos de una actividad con un sonido de " +
    "«pitido». (Nota: asegúrate de desactivar el silencio de tu dispositivo " +
    "para que esto funcione.)",
  volume: "Volumen:",
  callOutTitlesTitle: "Anunciar títulos",
  callOutTitlesHint: "Lee en voz alta el título cuando empieza una actividad.",
  voiceLanguage: "Voz/Idioma:",
  appLanguageTitle: "Idioma de la app",
  appLanguageHint:
    "Si cambias el idioma, considera cambiar también la voz (véase abajo, «Anunciar títulos»).",

  appTitle: "Temporizador programable",
  paused: "(Pausado)",

  edit: "Editar",
  share: "Compartir",
  menu: "Menú",
  start: "Iniciar",
  pause: "Pausar",
  resume: "Reanudar",
  reset: "Reiniciar",
  confirmReset: "¿Estás seguro?",

  save: "Guardar",
  titlePlaceholder: "Título",
  programPlaceholder: "Programa",
  readonlyHint: "Reinicia el temporizador para poder editar.",
  syntaxRulesTitle: "Reglas de sintaxis",
  errorPrefix: "Error: ",
  lineNumber: (n: number) => `Línea ${n}:`,

  copyUrl: "Copiar URL al portapapeles",
  urlCopied: "¡URL copiada!",
  copyFailed: "¡Error al copiar!",
  shareHint: [
    "Tu programa de temporizador está codificado en la URL y en el código QR.",
    "Puedes compartirlo con otras personas o guardarlo como marcador.",
  ],

  unsavedChangesConfirm:
    "Tienes cambios sin guardar. ¿Seguro que quieres salir?",

  parseErrors: {
    TITLE_TOO_LONG: {
      message: "El título no puede tener más de 30 caracteres",
    },
    EMPTY_LINE: {
      message: "Línea vacía no permitida",
      hint: "No se permiten líneas en blanco o vacías.",
    },
    INVALID_INDENTATION: {
      message: "Sangría no válida",
      hint: "La sangría debe ser un múltiplo de 2 espacios.",
    },
    INVALID_DURATION: {
      message: "Duración no válida",
      hint: "Una duración debe tener el formato MM:SS o M:SS.",
    },
    MISSING_SPACE_SEPARATOR: {
      message: "Falta el espacio separador antes del título de la actividad",
    },
    EMPTY_LOOP: {
      message: "Bucle vacío no permitido",
      hint: "Un bucle debe contener al menos una actividad u otro bucle.",
    },
    INVALID_ENTRY: {
      message: "Entrada no válida",
      hint: "Se esperaba una actividad o un bucle.",
    },
  } as ParseErrorDictionary,

  demoProgram: {
    title: "¡Deporte!",
    items: [
      {
        kind: "ACTIVITY",
        title: "Prepárate",
        duration: 10,
        skipLast: false,
      },
      {
        kind: "LOOP",
        repeat: 3,
        items: [
          {
            kind: "ACTIVITY",
            title: "Entrena",
            duration: 30,
            skipLast: false,
          },
          {
            kind: "ACTIVITY",
            title: "Descansa",
            duration: 15,
            skipLast: true,
          },
        ],
      },
      {
        kind: "LOOP",
        repeat: 4,
        items: [
          {
            kind: "ACTIVITY",
            title: "Estira",
            duration: 45,
            skipLast: false,
          },
          {
            kind: "ACTIVITY",
            title: "Relájate",
            duration: 15,
            skipLast: false,
          },
          {
            kind: "ACTIVITY",
            title: "Cambia de posición",
            duration: 10,
            skipLast: true,
          },
        ],
      },
      {
        kind: "ACTIVITY",
        title: "Enfría",
        duration: 20,
        skipLast: false,
      },
    ],
  },

  SyntaxRules() {
    return (
      <>
        <p>
          Un programa de temporizador se procesa línea por línea, donde cada
          línea representa una actividad o un bucle.
        </p>
        <h4>Actividad</h4>
        <p>
          Una actividad se expresa mediante un valor de tiempo, seguido
          opcionalmente de un título (separado por un espacio). El valor de
          tiempo debe tener el formato <code>MM:SS</code> o <code>M:SS</code>{" "}
          (minutos, segundos). Ejemplos:
          <br />
          <code>0:45</code>, <code>10:00</code>, <code>2:30 ¡Entrena!</code>
        </p>
        <h4>Bucle</h4>
        <p>
          Un bucle se expresa como número de repeticiones, p. ej.{" "}
          <code>2x</code>, lo que indica que el siguiente bloque de líneas
          sangradas se repetirá esa cantidad de veces. La sangría es de
          2&nbsp;espacios. Los bucles se pueden anidar.
        </p>
        <p>
          Si al valor de tiempo de una actividad le sigue un asterisco (p.
          ej., <code>0:45*</code>), la actividad se omite en la última
          repetición del bucle.
        </p>
      </>
    )
  },
} satisfies typeof en
