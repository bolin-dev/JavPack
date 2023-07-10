// ==UserScript==
// @name            JavDB.trailer
// @namespace       JavDB.trailer@blc
// @version         0.0.1
// @author          blc
// @description     预告片
// @include         /^https:\/\/javdb\d*\.com\/v\/\w+/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/trailer/JavPack.trailer.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         caribbeancom.com
// @connect         pacopacomama.com
// @connect         tokyo-hot.com
// @connect         10musume.com
// @connect         javspyl.tk
// @connect         1pondo.tv
// @connect         heyzo.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(async function () {
  const mid = location.pathname.split("/").at(-1);
  if (!mid) return;

  let trailer =
    localStorage.getItem(mid) ??
    document.querySelector("#preview-video source")?.getAttribute("src");

  if (!trailer) {
    const infoNode = document.querySelector(".movie-panel-info");
    const code = infoNode.querySelector(".first-block .value")?.textContent;
    if (!code) return;

    if (document.querySelector(".title.is-4 strong").textContent.includes("無碼")) {
      let studio = "";
      infoNode.querySelectorAll(".panel-block").forEach(node => {
        if (node.querySelector("strong")?.textContent === "片商:") {
          studio = node.querySelector(".value").textContent;
          return;
        }
      });

      if (studio) trailer = await fetchStudio(code, studio);
    }

    if (!trailer) trailer = await fetchJavspyl(code);
  }

  if (!trailer || /\.m3u8?$/i.test(trailer)) return;

  if (!trailer.includes("//")) trailer = `https://${trailer}`;
  localStorage.setItem(mid, trailer);

  console.log(trailer);
})();
