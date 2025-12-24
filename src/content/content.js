chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "insertUsers" && msg.users) {
    insertElementInPage(msg.users);
  }
});

function insertElementInPage(users) {
  if (!users || users.length === 0) return;

  // Inietta il CSS se non già presente
  if (!document.getElementById("contentCss")) {
    const link = document.createElement("link");
    link.id = "contentCss";
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("src/content/content.css");
    document.head.appendChild(link);
  }

  const existing = document.getElementById("usersContainer");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "usersContainer";

  const title = document.createElement("h1");
  title.textContent = "List of BASTARDS:";
  container.appendChild(title);

  users.forEach(user => {
    const p = document.createElement("p");
    p.textContent = `ID: ${user.id}, Username: ${user.username}`;
    container.appendChild(p);
  });

  const header = document.querySelector("header");
  if (header) {
    header.insertBefore(container, header.firstChild);
  } else {
    document.body.insertBefore(container, document.body.firstChild);
  }
}
