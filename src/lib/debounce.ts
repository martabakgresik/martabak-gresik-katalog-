// Utility function untuk debouncing
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Utility untuk debounce dengan immediate option
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<any> {
  let timeout: NodeJS.Timeout | null = null;
  let lastPromise: Promise<any> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    return new Promise((resolve) => {
      const later = async () => {
        timeout = null;
        lastPromise = func(...args);
        const result = await lastPromise;
        resolve(result);
      };

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    });
  };
}
