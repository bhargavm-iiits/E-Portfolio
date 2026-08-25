export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent("toast:show", { detail: message }));
}
