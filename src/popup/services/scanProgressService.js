let processed = 0;
let onChange = null;

export const ScanProgressService = {
  reset(callback) {
    processed = 0;
    onChange = callback;
    onChange?.(processed);
  },

  increment(value) {
    processed += value;
    onChange?.(processed);
  }
};
