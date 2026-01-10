let total = 0;
let processed = 0;
let onChange = null;

export const ScanProgressService = {
  reset(value, callback) {
    total = value;
    processed = 0;
    onChange = callback;
    onChange?.(processed, total);
  },

  increment(value) {
    console.log("chiamato")
    processed += value;
    onChange?.(processed, total);
  }
};
