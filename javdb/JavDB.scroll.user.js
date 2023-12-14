// ==UserScript==
// @name            JavDB.scroll
// @namespace       JavDB.scroll@blc
// @version         0.0.1
// @author          blc
// @description     滚动加载
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         self
// @run-at          document-end
// @grant           GM_addStyle
// @grant           GM_xmlhttpRequest
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const selector = {
    container: ":is(.movie-list, .actors, .section-container)",
    pagination: "nav.pagination .pagination-next",
  };

  const container = document.querySelector(selector.container);
  if (!container) return;

  let nextUrl = document.querySelector(selector.pagination)?.href;
  if (!nextUrl) return;

  GM_addStyle("nav.pagination,#footer{display:none}");
  const loading = document.createElement("div");
  loading.setAttribute("class", "has-text-grey pt-4 has-text-centered");
  loading.textContent = "加载中...";
  container.insertAdjacentElement("afterend", loading);

  const useCallback = () => {
    let next = nextUrl;
    let isLoading = false;

    const parseDom = (dom) => {
      const list = dom.querySelectorAll(`${selector.container} > :is(div, a)`);
      const url = dom.querySelector(selector.pagination)?.href;
      return { list, url };
    };

    return async (entries, observer) => {
      if (!entries[0].isIntersecting || isLoading) return;

      isLoading = true;
      const { list, url } = await Req.tasks(next, [parseDom]);
      isLoading = false;

      if (list?.length) {
        container.append(...list);
        window.dispatchEvent(new CustomEvent("loadmore", { detail: list }));
      }

      if (!url) {
        loading.textContent = "暂无更多";
        return observer.disconnect();
      }

      next = url;
    };
  };

  const callback = useCallback();
  const intersectionObserver = new IntersectionObserver(callback);
  intersectionObserver.observe(loading);
})();
