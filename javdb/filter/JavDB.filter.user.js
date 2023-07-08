// ==UserScript==
// @name            JavDB.filter
// @namespace       JavDB.filter@blc
// @version         0.0.1
// @author          blc
// @description     影片筛选
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/).*$/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-body
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const container = document.querySelector(".movie-list");
  if (!container) return;

  const childList = container.querySelectorAll(".item");
  if (!childList?.length) return;

  const filter = nodeList => {
    console.log(nodeList);
  };
  filter(childList);

  const mutationObserver = new MutationObserver((mutationsList, observer) => {
    for (let { type, addedNodes } of mutationsList) {
      if (type === "childList" && addedNodes?.length) filter(addedNodes);
    }
  });
  mutationObserver.observe(container, { childList: true, attributes: false });

  GM_addStyle(`.hightlight {}`);
})();
