import { INSTAGRAM_HEADERS } from "../config/instagramHeaders.js";
import { ScanProgressService } from "./scanProgressService.js";

const MAX_COUNT = 25;

export const InstagramService = {
  async getUsernameFromId(id) {
    const res = await fetch(
      `https://i.instagram.com/api/v1/users/${id}/info/`,
      { headers: INSTAGRAM_HEADERS }
    );
    const data = await res.json();
    return data.user.username;
  },

  async getFollowersAndFollowingCount(username) {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      { headers: INSTAGRAM_HEADERS }
    );
    const data = await res.json();

    return (
      (data?.data?.user?.edge_followed_by?.count ?? 0) +
      (data?.data?.user?.edge_follow?.count ?? 0)
    );
  },

  async fetchAll(type, userId) {
    let users = [];
    let nextMaxId = null;

    const base =
      `https://www.instagram.com/api/v1/friendships/${userId}/${type}/?count=${MAX_COUNT}`;

    do {
      const url = nextMaxId ? `${base}&max_id=${nextMaxId}` : base;
      const res = await fetch(url, { headers: INSTAGRAM_HEADERS });
      const data = await res.json();

      users.push(...data.users);
      ScanProgressService.increment(data.users.length);

      nextMaxId = data.next_max_id ?? null;
    } while (nextMaxId);

    return users;
  }
};
