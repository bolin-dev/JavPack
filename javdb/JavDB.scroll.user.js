// ==UserScript==
// @name            JavDB.scroll
// @namespace       JavDB.scroll@blc
// @version         0.0.1
// @author          blc
// @description     滚动加载
// @include         /^https:\/\/javdb\.com\/(?!v\/)/
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         self
// @run-at          document-body
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
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

  GM_addStyle(
    "nav.pagination{display:none}.x-indicator{padding-top:1rem;font-size:0.875rem;text-align:center}",
  );

  const loading = document.createElement("div");
  loading.classList.add("x-indicator");
  loading.textContent = "加载中...";
  container.insertAdjacentElement("afterend", loading);

  const queryNext = (dom) => {
    const url = dom.querySelector(selector.pagination)?.href;
    const list = dom.querySelectorAll(`${selector.container} > :is(div, a)`);
    return { url, list };
  };

  const useCallback = () => {
    let isLoading = false;
    return async (entries, observer) => {
      if (!entries[0].isIntersecting || isLoading) return;

      isLoading = true;
      const { url, list } = await Req.tasks(nextUrl, [queryNext]);
      isLoading = false;

      if (list?.length) container.append(...list);

      if (!url) {
        loading.textContent = "暂无更多";
        return observer.disconnect();
      }

      nextUrl = url;
    };
  };

  const callback = useCallback();

  const intersectionObserver = new IntersectionObserver(callback);
  intersectionObserver.observe(loading);
})();
