// ==UserScript==
// @name            JavDB.filter
// @namespace       JavDB.filter@blc
// @version         0.0.1
// @author          blc
// @description     影片筛选
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/).*$/
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-body
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const target = document.querySelector(".movie-list");
  if (!target) return;

  const observer = new MutationObserver(mutationsList => {
    for (let mutation of mutationsList) console.log(mutation);
  });

  observer.observe(target, {
    childList: true,
    attributes: false,
  });
})();
