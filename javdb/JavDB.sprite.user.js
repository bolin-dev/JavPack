// ==UserScript==
// @name            JavDB.sprite
// @namespace       JavDB.sprite@blc
// @version         0.0.1
// @author          blc
// @description     雪碧图
// @match           https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.ReqSprite.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
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
    if (!sprite) return;

    const TARGET_ID = "x-sprite";
    if (document.querySelector(`#${TARGET_ID}`)) return;

    const IMG_ALT = "雪碧图";
    localStorage.setItem(mid, sprite);
    const targetHTML = `<div style="display: none;" id="${TARGET_ID}"><img src="${sprite}" alt="${IMG_ALT}"></div>`;
    document.body.insertAdjacentHTML("beforeend", targetHTML);

    const insertHTML = `
    <a
      class="tile-item"
      href="javascript:void(0);"
      data-fancybox="gallery"
      data-caption="${IMG_ALT}"
      data-src="#${TARGET_ID}"
    >
      <img src="${sprite}" alt="${IMG_ALT}" loading="lazy">
    </a>
    `;

    const container = document.querySelector(".tile-images.preview-images");
    if (!container) {
      const previous = document.querySelector(".video-meta-panel");
      return previous.insertAdjacentHTML(
        "afterend",
        `<div class="columns">
          <div class="column">
            <article class="message video-panel">
              <div class="message-body">
                <div class="tile-images preview-images">${insertHTML}</div>
              </div>
            </article>
          </div>
        </div>`,
      );
    }

    const tileItem = container.querySelector(".tile-item");
    if (tileItem) {
      tileItem.insertAdjacentHTML("beforebegin", insertHTML);
    } else {
      container.insertAdjacentHTML("beforeend", insertHTML);
    }
  };

  const sprite = localStorage.getItem(mid);
  if (sprite) return setSprite(sprite);

  const code = document.querySelector(".first-block .value").textContent;
  ReqSprite.blogjav(code).then(setSprite);
  ReqSprite.javstore(code).then(setSprite);
})();
