// ==UserScript==
// @name            JavDB.sprite
// @namespace       JavDB.sprite@blc
// @version         0.0.1
// @author          blc
// @description     雪碧图
// @match           https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.ReqSprite.lib.js
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

(function () {
  Util.upLocal();

  const mid = `sprite_${location.pathname.split("/").pop()}`;

  const setSprite = (sprite) => {
    if (!sprite || document.querySelector("#x-sprite")) return;

    localStorage.setItem(mid, sprite);
    const box = document.querySelector(".tile-images.preview-images");
    const innerHTML = `
    <a class="tile-item" id="x-sprite" href="${sprite}" data-fancybox="gallery" data-caption="sprite">
      <img src="${sprite}" alt="雪碧图" loading="lazy">
    </a>
    `;

    if (!box) {
      const target = document.querySelector(".video-meta-panel");
      return target.insertAdjacentHTML(
        "afterend",
        `<div class="columns">
          <div class="column">
            <article class="message video-panel">
              <div class="message-body">
                <div class="tile-images preview-images">${innerHTML}</div>
              </div>
            </article>
          </div>
        </div>`,
      );
    }

    const item = box.querySelector(".tile-item");
    if (item) {
      item.insertAdjacentHTML("beforebegin", innerHTML);
    } else {
      box.insertAdjacentHTML("beforeend", innerHTML);
    }
  };

  const sprite = localStorage.getItem(mid);
  if (sprite) return setSprite(sprite);

  const code = document.querySelector(".first-block .value").textContent;
  ReqSprite.blogjav(code).then(setSprite);
  ReqSprite.javstore(code).then(setSprite);
})();
