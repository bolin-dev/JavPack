// ==UserScript==
// @name            JavDB.sprite
// @namespace       JavDB.sprite@blc
// @version         0.0.2
// @author          blc
// @description     雪碧图
// @match           https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.ReqSprite.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @connect         javstore.net
// @connect         pixhost.to
// @connect         javfree.me
// @connect         javbee.me
// @connect         *
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValues
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_info
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

Util.upStore();

(function () {
  const mid = unsafeWindow.appData?.split("/").at(-1);
  if (!mid) return;

  const setSprite = (source) => {
    const target = "x-sprite";

    const imgStr = `<img src="${source}" loading="lazy" referrerpolicy="no-referrer">`;
    document.body.insertAdjacentHTML("beforeend", `<div style="display: none;" id="${target}">${imgStr}</div>`);

    const itemStr = `
    <a
      class="tile-item"
      href="javascript:void(0);"
      data-fancybox="gallery"
      data-caption="雪碧图"
      data-src="#${target}"
    >
      ${imgStr}
    </a>
    `;

    const container = document.querySelector(".tile-images.preview-images");
    if (!container) {
      return document.querySelector(".video-meta-panel").insertAdjacentHTML(
        "afterend",
        `<div class="columns"><div class="column"><article class="message video-panel">
          <div class="message-body"><div class="tile-images preview-images">${itemStr}</div></div>
        </article></div></div>`,
      );
    }

    const tileItem = container.querySelector(".tile-item");
    if (tileItem) return tileItem.insertAdjacentHTML("beforebegin", itemStr);
    container.insertAdjacentHTML("beforeend", itemStr);
  };

  const sprite = GM_getValue(mid);
  if (sprite) return setSprite(sprite);

  const code = document.querySelector(".first-block .value").textContent.trim();
  const codeDetails = Util.codeParse(code);

  ReqSprite.getSprite(codeDetails)
    .then((source) => {
      GM_setValue(mid, source);
      setSprite(source);
    })
    .catch((err) => Util.print(err?.message));
})();
