// ==UserScript==
// @name            JavDB.openTab
// @namespace       JavDB.openTab@blc
// @version         0.0.2
// @author          blc
// @description     新标签页打开
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @run-at          document-start
// @grant           GM_openInTab
// ==/UserScript==

(function () {
  const SELECTOR = ":is(.actors, .movie-list, .section-container) a:not(.button)";

  const click = (e) => {
    const target = e.target.closest(SELECTOR);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    Grant.openTab(target.href);
  };

  const useRightClick = () => {
    let timer = null;
    let currElem = null;
    let prevX = null;
    let prevY = null;

    const mousedown = (e) => {
      const target = e.target.closest(SELECTOR);
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();

      prevX = e.pageX;
      prevY = e.pageY;

      clearTimeout(timer);
      currElem = target;

      timer = setTimeout(() => {
        currElem = null;
        timer = null;
      }, 500);
    };

    const contextmenu = (e) => {
      if (!currElem) return;

      e.preventDefault();
      e.stopPropagation();
    };

    const mouseup = (e) => {
      if (!currElem) return;

      e.preventDefault();
      e.stopPropagation();

      const diffX = Math.abs(e.pageX - prevX);
      const diffY = Math.abs(e.pageY - prevY);

      if (diffX < 5 && diffY < 5) Grant.openTab(currElem.href, false);
    };

    return (e) => {
      if (e.button !== 2) return;
      if (e.type === "mousedown") mousedown(e);
      if (e.type === "contextmenu") contextmenu(e);
      if (e.type === "mouseup") mouseup(e);
    };
  };

  const rightClick = useRightClick();
  document.addEventListener("mousedown", rightClick);
  document.addEventListener("contextmenu", rightClick);
  document.addEventListener("mouseup", rightClick);
  document.addEventListener("click", click);
})();
