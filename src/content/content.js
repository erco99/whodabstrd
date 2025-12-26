const urlBase = "https://www.instagram.com/api/v1/friendships/destroy/"
const headers = {
  'accept': '*/*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,fr;q=0.5,pt;q=0.4',
  'dpr': '1',
  'priority': 'u=1, i',
  'sec-ch-prefers-color-scheme': 'dark',
  'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
  'sec-ch-ua-full-version-list': '"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.6834.159", "Google Chrome";v="132.0.6834.159"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-model': '""',
  'sec-ch-ua-platform': '"Linux"',
  'sec-ch-ua-platform-version': '"6.8.0"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
  'viewport-width': '1920',
  'x-ig-app-id': '936619743392459',
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "insertUsers" && msg.users) {
    insertElementInPage(msg.users);
  }
});

function insertElementInPage(users) {
  if (!users || users.length === 0) return;

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
    const row = document.createElement("div");
    row.className = "userRow";

    const btn = document.createElement("button");
    btn.textContent = "UNFOLLOW";
    btn.addEventListener("click", async () => {
      try {
        btn.disabled = true;
        btn.textContent = "Unfollowing...";
        await unfollow(user.id);
        btn.textContent = "Done";
      } catch (e) {
        console.error(e);
        btn.textContent = "Error";
        btn.disabled = false;
      }
    });

    const link = document.createElement("a");
    link.href = `https://www.instagram.com/${user.username}`;
    link.textContent = user.username;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    row.appendChild(btn);
    row.appendChild(link);
    container.appendChild(row);
  });

  const header = document.querySelector("header");
  if (header) {
    header.insertBefore(container, header.firstChild);
  } else {
    document.body.insertBefore(container, document.body.firstChild);
  }
}

async function unfollow(id) {
  const unfollowAPI = urlBase + id + "/";
  const csrftoken = await getCsrftoken()
  const requestHeaders = {
    ...headers,
    "x-csrftoken": csrftoken
  }

  const res = await fetch(unfollowAPI, {
    method: "POST",
    body: JSON.stringify({
      userId: 1,
      title: "Fix my bugs",
      completed: false
    }),
    headers: requestHeaders
  });

  if (!res.ok) {
    throw new Error(`Unfollow failed (${res.status})`);
  }

  const data = await res.json();
  console.log("data:", data);
  return data;
}

async function getCsrftoken() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "get_csrftoken" }, (response) => {
      resolve(response.csrftoken);
    });
  });
}
