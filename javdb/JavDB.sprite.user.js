// ==UserScript==
// @name            JavDB.sprite
// @namespace       JavDB.sprite@blc
// @version         0.0.1
// @author          blc
// @description     雪碧图
// @match           https://javdb.com/v/*
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.UtilSprite.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         javstore.net
// @connect         blogjav.net
// @connect         pixhost.to
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(async function () {
  Util.upLocal();

  const mid = `sprite_${location.pathname.split("/").pop()}`;
  let sprite = localStorage.getItem(mid);

  if (!sprite) {
    const code = document.querySelector(".movie-panel-info .first-block .value").textContent;
    const resList = await Promise.allSettled([UtilSprite.blogjav(code), UtilSprite.javstore(code)]);

    for (const { status, value } of resList) {
      if (status !== "fulfilled" || !value) continue;
      sprite = value;
      break;
    }
  }
  if (!sprite) return;

  localStorage.setItem(mid, sprite);

  const innerHTML = `<a class="tile-item" href="${sprite}" data-fancybox="gallery" data-caption="雪碧图"><img src="${sprite}" alt="雪碧图" loading="lazy"></a>`;
  const box = document.querySelector(".tile-images.preview-images");

  if (!box) {
    const target = document.querySelector(".video-meta-panel");
    return target.insertAdjacentHTML(
      "afterend",
      `<div class="columns"><div class="column"><article class="message video-panel"><div class="message-body"><div class="tile-images preview-images">${innerHTML}</div></div></article></div></div>`,
    );
  }

  const item = box.querySelector(".tile-item");
  if (item) {
    item.insertAdjacentHTML("beforebegin", innerHTML);
  } else {
    box.insertAdjacentHTML("beforeend", innerHTML);
  }
})();
