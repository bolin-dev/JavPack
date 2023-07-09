// ==UserScript==
// @name            JavDB.trailer
// @namespace       JavDB.trailer@blc
// @version         0.0.1
// @author          blc
// @description     预告片
// @include         /^https:\/\/javdb\d*\.com\/v\/\w+/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         *
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const mid = location.pathname.split("/").at(-1);
  if (!mid) return;

  let trailer =
    localStorage.getItem(mid) ??
    document.querySelector("#preview-video source")?.getAttribute("src");

  if (!trailer) {
    const infoNode = document.querySelector(".movie-panel-info");
    const code = infoNode.querySelector(".first-block .value")?.textContent;
    if (!code) return;

    const title = document.querySelector(".title.is-4");
    if (title.querySelector("strong").textContent.includes("無碼")) {
      console.log("无码");
    } else {
      console.log("有码");
    }
  }
})();
