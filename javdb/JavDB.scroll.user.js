// ==UserScript==
// @name            JavDB.scroll
// @namespace       JavDB.scroll@blc
// @version         0.0.1
// @author          blc
// @description     滚动加载
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const selector = {
    container: ":is(.actors, .movie-list, .section-container)",
    pagination: "nav.pagination .pagination-next",
  };

  const container = document.querySelector(selector.container);
  if (!container) return;

  const nextUrl = document.querySelector(selector.pagination)?.href;
  if (!nextUrl) return;

  selector.list = `${selector.container} > :is(div, a)`;
  GM_addStyle("nav.pagination,#footer{display:none}");

  const loading = document.createElement("div");
  loading.setAttribute("class", "has-text-grey pt-4 has-text-centered");
  loading.textContent = "加载中...";
  container.insertAdjacentElement("afterend", loading);

  const useCallback = () => {
    let next = nextUrl;
    let isLoading = false;

    const parseDom = (dom) => {
      const list = dom.querySelectorAll(selector.list);
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
  const intersectionObserver = new IntersectionObserver(callback, { rootMargin: "400px" });
  intersectionObserver.observe(loading);
})();
