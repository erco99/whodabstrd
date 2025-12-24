chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "insertUsers" && msg.users) {
    insertElementInPage(msg.users);
  }
});

function insertElementInPage(users) {
  if (!users || users.length === 0) return;

  const existing = document.getElementById("usersContainer");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "usersContainer";
  container.style.backgroundColor = "#945c5cff";
  container.style.padding = "8px";
  container.style.margin = "0";
  container.style.borderBottom = "1px solid #ccc";

  users.forEach(user => {
    const p = document.createElement("p");
    p.textContent = `ID: ${user.id}, Username: ${user.username}`;
    p.style.margin = "0";
    container.appendChild(p);
  });

  const header = document.querySelector("header");
  if (header) {
    header.insertBefore(container, header.firstChild);
  } else {
    document.body.insertBefore(container, document.body.firstChild);
  }
}
