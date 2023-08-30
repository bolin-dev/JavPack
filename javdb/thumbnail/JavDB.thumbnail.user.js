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
// @connect         pixhost.to
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

    const list = await Promise.allSettled([fetchBlogJav(code), fetchJavStore(code)]);
    for (const { status, value } of list) {
      if (status !== "fulfilled" || !value) continue;

      thumbnail = value;
      break;
    }
  }
  if (!thumbnail) return;

  localStorage.setItem(mid, thumbnail);
  const box = document.querySelector(".tile-images.preview-images");
  const innerHTML = `<a class="tile-item" href="${thumbnail}" data-fancybox="gallery" data-caption="缩略图"><img src="${thumbnail}" alt="缩略图" loading="lazy"></a>`;

  if (!box) {
    document
      .querySelector(".video-meta-panel")
      .insertAdjacentHTML(
        "afterend",
        `<div class="columns"><div class="column"><article class="message video-panel"><div class="message-body"><div class="tile-images preview-images">${innerHTML}</div></div></article></div></div>`
      );
  } else {
    const item = box.querySelector(".tile-item");
    if (item) {
      item.insertAdjacentHTML("beforebegin", innerHTML);
    } else {
      box.insertAdjacentHTML("beforeend", innerHTML);
    }
  }
})();
