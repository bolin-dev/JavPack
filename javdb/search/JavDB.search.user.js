// ==UserScript==
// @name            JavDB.search
// @namespace       JavDB.search@blc
// @version         0.0.1
// @author          blc
// @description     快捷搜索
// @include         /^https:\/\/javdb\d*\.com/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const search = async e => {
    if (e.ctrlKey && e.key === "/") {
      const text = (await navigator.clipboard.readText())?.trim();
      if (!text) return;

      const { origin, pathname } = location;
      const url = `${origin}/search?q=${text}`;
      pathname === "/search" ? (location.href = url) : GM_openInTab(url, { active: true, setParent: true });
    }
  };
  document.addEventListener("keydown", search);

  const focusSearch = e => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.nodeName)) return;
    if (e.key === "/") document.querySelector("#video-search")?.focus();
  };
  document.addEventListener("keyup", focusSearch);
})();
