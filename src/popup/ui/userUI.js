export const UserUI = {
  el: () => document.getElementById("loggedUsername"),

  setUsername(username) {
    const el = this.el();
    el.textContent = username;
    el.href = `https://www.instagram.com/${username}/`;
  },

  setNotLogged() {
    const el = this.el();
    el.textContent = "not logged";
    el.removeAttribute("href");
  }
};
