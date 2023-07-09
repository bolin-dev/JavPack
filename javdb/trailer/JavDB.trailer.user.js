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
// @run-at          document-body
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(async function () {
  let trailer = document.querySelector("#preview-video source")?.src;

  // if (trailer) {
  //   const code = document.querySelector(".movie-panel-info .first-block .value")?.textContent;
  //   console.log(code);

  //   const cid = await taskQueue(`https://db.msin.jp/branch/search?sort=jp.movie&str=${code}`, [
  //     dom => {
  //       return dom.querySelector(".mv_fileName")?.textContent;
  //     },
  //   ]);
  //   console.log(cid);
  // }

  if (!trailer) return;

  // GM_addStyle();
})();
