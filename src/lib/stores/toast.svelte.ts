export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

class ToastStore {
  toasts = $state<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3500) {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.push({ id, message, type });

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}

export const toast = new ToastStore();
