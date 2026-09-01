/**
 * Canal de correo corporativo (sección 21 del brief).
 *
 * Esta implementación es un placeholder deliberado: no hay credenciales de
 * SMTP/Microsoft 365 / Graph configuradas en este entorno, y el brief pide
 * explícitamente no inventar integraciones (sección 31). En vez de simular
 * un envío real, este canal deja constancia en logs y marca el correo como
 * "no enviado" para que quede visible en la UI.
 *
 * Para producción: implementar `send()` contra el proveedor de correo
 * corporativo real (SMTP de Exchange/O365, o la API de Microsoft Graph) y
 * nada más en el resto del sistema debería cambiar — todo el código llama
 * a esta función, nunca a un proveedor de correo directamente.
 */
export async function sendCorporateEmail(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ sent: boolean }> {
  if (process.env.SMTP_HOST) {
    // Placeholder: aquí se conectaría un transporte SMTP real cuando TI
    // entregue las credenciales corporativas. No se implementa un envío
    // real sin esa configuración.
  }

  console.log(
    `[correo-corporativo:no-configurado] para=${params.to} asunto="${params.subject}"`
  );
  return { sent: false };
}
