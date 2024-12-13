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
// ==/UserScript==

(function () {
  const selector = {
    cont: ":is(.actors, .movie-list, .section-container):has(+ nav.pagination)",
    list: ":is(.actors, .movie-list, .section-container):has(+ nav.pagination) > :is(div, a)",
    next: ":is(.actors, .movie-list, .section-container):has(+ nav.pagination) + nav.pagination .pagination-next",
  };

  const contNode = document.querySelector(selector.cont);
  if (!contNode) return;

  const nextUrl = document.querySelector(selector.next)?.href;
  if (!nextUrl) return;

  const loadNode = document.createElement("div");
  loadNode.classList.add("has-text-grey", "pt-4", "has-text-centered", "x-load");
  contNode.insertAdjacentElement("afterend", loadNode);

  const useCallback = () => {
    let load = false;
    let next = nextUrl;

    const parse = (dom) => {
      const list = dom.querySelectorAll(selector.list);
      const url = dom.querySelector(selector.next)?.href;
      return { list, url };
    };

    const onfinally = () => {
      load = false;
    };

    const onerror = () => {
      loadNode.textContent = "加载失败，滚动以重试";
    };

    return async (entries, obs) => {
      if (!entries[0].isIntersecting || load) return;

      load = true;
      loadNode.textContent = "加载中...";

      try {
        const { list, url } = await Req.tasks(next, [parse]).finally(onfinally);
        if (!list.length) return onerror();

        contNode.append(...list);
        window.dispatchEvent(new CustomEvent("JavDB.scroll", { detail: list }));

        if (!url) {
          loadNode.textContent = "暂无更多";
          return obs.disconnect();
        }

        next = url;
      } catch (_) {
        onerror();
      }
    };
  };

  const callback = useCallback();
  const observer = new IntersectionObserver(callback, { rootMargin: "500px" });
  observer.observe(loadNode);
})();
