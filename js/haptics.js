// Pequeñas vibraciones para que la app se sienta más "nativa" en celular.
// No hace nada si el dispositivo/navegador no soporta vibración (ej. iPhone).
export function vibrate(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) {}
}

export const HAPTIC = {
  tap: 12,
  favorite: 18,
  success: [30, 60, 30, 60, 90],
};
