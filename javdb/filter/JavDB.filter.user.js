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
  const hiddenList = [];
  const highlightList = [];
  if (!hiddenList.length && !highlightList.length) return;

  const container = document.querySelector(".movie-list");
  if (!container) return;

  const childList = container.querySelectorAll(".item");
  if (!childList?.length) return;

  const parseRes = node => {
    const title = node.querySelector(".video-title");
    const code = title.querySelector("strong").textContent;
    const name = title.textContent.replace(code, "").trim();
    const score = node
      .querySelector(".score .value")
      .textContent.replace(/\u00A0/g, "")
      .trim();
    const date = node.querySelector(".meta").textContent.trim();
    const tags = [...node.querySelectorAll(".tags .tag")].map(tag => tag.textContent);
    return `[${code}][${name}][${score}][${date}][${tags}]`;
  };

  const filter = nodeList => {
    for (const node of nodeList) {
      const res = parseRes(node);

      if (hiddenList.some(item => item.test(res))) {
        node.classList.add("is-hidden");
        continue;
      }
      if (highlightList.some(item => item.test(res))) node.classList.add("is-highlight");
    }
  };
  filter(childList);

  const callback = (mutationsList, observer) => {
    for (let { type, addedNodes } of mutationsList) {
      if (type !== "childList") continue;
      if (!addedNodes?.length) continue;
      if (addedNodes.length < 40) observer.disconnect();
      filter(addedNodes);
    }
  };

  const mutationObserver = new MutationObserver(callback);
  mutationObserver.observe(container, { childList: true, attributes: false });

  GM_addStyle(".is-highlight{box-shadow:0 0 0 4px red!important}");
})();
