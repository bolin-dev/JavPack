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
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// ==/UserScript==

(function () {
  const selector = {
    container: ":is(.actors, .movie-list, .section-container)",
    pagination: "nav.pagination .pagination-next",
  };

  const containerNode = document.querySelector(selector.container);
  if (!containerNode) return;

  const nextUrl = document.querySelector(selector.pagination)?.href;
  if (!nextUrl) return;

  selector.list = `${selector.container} > :is(div, a)`;
  GM_addStyle("nav.pagination,#footer{display:none}");

  const loadNode = document.createElement("div");
  loadNode.setAttribute("class", "has-text-grey pt-4 has-text-centered");
  containerNode.insertAdjacentElement("afterend", loadNode);

  const useCallback = () => {
    let res;
    let next = nextUrl;
    let loading = false;

    const parse = (dom) => {
      const list = dom.querySelectorAll(selector.list);
      const url = dom.querySelector(selector.pagination)?.href;
      return { list, url };
    };

    const onfinally = () => {
      loading = false;
    };

    return async (entries, observer) => {
      if (!entries[0].isIntersecting || loading) return;

      loading = true;
      loadNode.textContent = "加载中...";

      try {
        res = await Req.tasks(next, [parse]).finally(onfinally);
      } catch (_) {
        loadNode.textContent = "加载失败，滚动以重试";
        return;
      }

      const { list, url } = res;

      if (list.length) {
        containerNode.append(...list);
        window.dispatchEvent(new CustomEvent("JavDB.scroll", { detail: list }));
      }

      if (!url) {
        loadNode.textContent = "暂无更多";
        return observer.disconnect();
      }

      next = url;
    };
  };

  const callback = useCallback();
  const observer = new IntersectionObserver(callback, { rootMargin: "500px" });
  observer.observe(loadNode);
})();
