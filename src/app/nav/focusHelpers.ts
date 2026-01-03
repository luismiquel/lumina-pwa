export function focusByLuminaId(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-lumina-id="${CSS.escape(id)}"]`);
  if (!el) return false;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  // highlight temporal
  el.classList.add("lumina-focus-ring");
  window.setTimeout(() => el.classList.remove("lumina-focus-ring"), 1800);

  return true;
}
