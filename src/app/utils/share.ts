export async function shareText(title: string, text: string) {
  const payload = { title, text };

  // 1) Share nativo (móvil)
  try {
    const nav: any = navigator as any;
    if (nav?.share) {
      await nav.share(payload);
      return;
    }
  } catch {
    // si el usuario cancela, no hacemos nada
    return;
  }

  // 2) Clipboard
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      alert("Copiado al portapapeles.");
      return;
    }
  } catch {
    // sigue fallback
  }

  // 3) Fallback final
  try {
    window.prompt("Copia este texto:", text);
  } catch {
    // silencio
  }
}
