export const ScanUI = {
  button: () => document.getElementById("scanBtn"),
  loader: () => document.getElementById("loader"),
  progress: () => document.getElementById("progressText"),

  setEnabled(enabled) {
    this.button().disabled = !enabled;
  },

  setLoading(state) {
    this.button().disabled = state;
    this.loader().style.display = state ? "block" : "none";
    this.progress().style.display = state ? "block" : "none";
  },

  updateProgress(text) {
    this.progress().textContent = text;
  }
};
