const button = document.getElementById("scanBtn")
const loader = document.getElementById("loader");

const maxCount = 25

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

let totalUsers = 0;
let processedUsers = 0;

chrome.storage.sync.get("buttonColor", ({ buttonColor }) => {
  if (buttonColor) {
    button.style.backgroundColor = buttonColor;
  }
});

button.addEventListener("click", async () => {
  if (!(await checkIfOnProfilePage())) {
    console.warn("Not on profile page");
    return;
  }

  try {
    button.disabled = true;
    loader.style.display = "block";
    progressText.style.display = "block";

    totalUsers = await getFollowersAndFollowing();
    processedUsers = 0;
    updateProgress();

    const userId = await getUserId();
    if (!userId) throw new Error("ds_user_id not found");

    const [allFollowers, allFollowing] = await Promise.all([
      fetchAllUsers("followers", maxCount, userId),
      fetchAllUsers("following", maxCount, userId)
    ]);
    const idsFollowers = new Set(allFollowers.map(u => u.id));
    const notFollowingBack = allFollowing.filter(u => !idsFollowers.has(u.id));

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: "insertUsers", 
        users: notFollowingBack 
      });
    });

  } catch (err) {
    console.error(err);
  } finally {
    progressText.style.display = "none";
    loader.style.display = "none";
    button.disabled = false;
  }
});

async function fetchAllUsers(type, count, userId) {
  let allUsers = [];
  let next_max_id = null;

  const urlBase = `https://www.instagram.com/api/v1/friendships/${userId}/${type}/?count=${count}`;

  do {
    const url = next_max_id ? `${urlBase}&max_id=${next_max_id}` : urlBase;

    const res = await fetch(url, { method: "GET", headers: headers });
    if (!res.ok) throw new Error(`Error fetch ${type}`);

    const data = await res.json();

    allUsers = allUsers.concat(data.users);

    processedUsers += data.users.length;
    updateProgress();

    next_max_id = data.next_max_id || null;

  } while (next_max_id);

  return allUsers;
}

async function getUserId() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "get_ds_user_id" }, (response) => {
      resolve(response.ds_user_id);
    });
  });
}

async function getUsernameFromId(id) {
  const response = await fetch(
    `https://i.instagram.com/api/v1/users/${id}/info/`,
    {
      headers: headers
    }
  );

  const data = await response.json();
  return data.user.username;
}


async function getFollowersAndFollowing() {
  const userId = await getUserId();
  const username = await getUsernameFromId(userId);

  const response = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    {
      headers: headers,
    }
  );

  const data = await response.json();

  const followers = data?.data?.user?.edge_followed_by?.count ?? 0;
  const following = data?.data?.user?.edge_follow?.count ?? 0;

  return followers + following;
}



document.addEventListener("DOMContentLoaded", async () => {
  const usernameEl = document.getElementById("loggedUsername");

  try {
    const userId = await getUserId();

    if (!userId) {
      throw new Error("No user id");
    }

    const username = await getUsernameFromId(userId);
    usernameEl.textContent = username;
    usernameEl.href = `https://www.instagram.com/${username}/`;

    button.disabled = !(await checkIfOnProfilePage());
  } catch (err) {
    console.error(err);
    usernameEl.textContent = "not logged";
    usernameEl.removeAttribute("href");
  }
});

async function checkIfOnProfilePage() {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("No user id");
  }

  const username = await getUsernameFromId(userId);

  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.url) {
        resolve(false);
        return;
      }

      const url = new URL(tab.url);

      const isCorrectPage =
        url.hostname === "www.instagram.com" &&
        url.pathname === `/${username}/`;

      resolve(isCorrectPage);
    });
  });
}

function updateProgress() {
  progressText.textContent = `${processedUsers} / ${totalUsers}`;
}