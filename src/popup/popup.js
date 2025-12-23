const button = document.getElementById("colorBtn");

// Carica il colore dalle opzioni
chrome.storage.sync.get("buttonColor", ({ buttonColor }) => {
  if (buttonColor) {
    button.style.backgroundColor = buttonColor;
  }
});

// Cambia colore quando cliccato
button.addEventListener("click", () => {
  chrome.storage.sync.get("buttonColor", ({ buttonColor }) => {
    const currentColor = button.style.backgroundColor || "steelblue";
    button.style.backgroundColor = currentColor === buttonColor ? "steelblue" : buttonColor;
  });
});
