const colorPicker = document.getElementById("colorPicker");
const saveBtn = document.getElementById("saveBtn");

// Carica il colore salvato
chrome.storage.sync.get("buttonColor", ({ buttonColor }) => {
  if (buttonColor) {
    colorPicker.value = buttonColor;
  }
});

// Salva il colore scelto
saveBtn.addEventListener("click", () => {
  const color = colorPicker.value;
  chrome.storage.sync.set({ buttonColor: color }, () => {
    alert("Colore salvato!");
  });
});
