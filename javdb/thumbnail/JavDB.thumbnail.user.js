// ==UserScript==
// @name            JavDB.thumbnail
// @namespace       JavDB.thumbnail@blc
// @version         0.0.1
// @author          blc
// @description     缩略图
// @include         /^https:\/\/javdb\d*\.com\/v\/\w+/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/thumbnail/JavPack.thumbnail.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         javstore.net
// @connect         blogjav.net
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(async function () {
  let mid = location.pathname.split("/").at(-1);
  if (!mid) return;
  mid = `thumbnail_${mid}`;

  let thumbnail = localStorage.getItem(mid);

  if (!thumbnail) {
    const code = document.querySelector(".movie-panel-info .first-block .value")?.textContent;
    if (!code) return;

    thumbnail = await fetchBlogJav(code);
    if (!thumbnail) thumbnail = await fetchJavStore(code);
  }
  if (!thumbnail) return;

  localStorage.setItem(mid, thumbnail);

  document.querySelector(".tile-images.preview-images .tile-item")?.insertAdjacentHTML(
    "beforebegin",
    `<a class="tile-item" href="${thumbnail}" data-fancybox="gallery" data-caption="缩略图">
      <img src="${thumbnail}" alt="缩略图" loading="lazy">
    </a>`
  );
})();
