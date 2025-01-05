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
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

(function () {
  const selector = {
    cont: ":is(.actors, .movie-list, .section-container):has(+ nav.pagination)",
    list: ":is(.actors, .movie-list, .section-container):has(+ nav.pagination) > :is(div, a)",
    next: ":is(.actors, .movie-list, .section-container):has(+ nav.pagination) + nav.pagination .pagination-next",
  };

  const contNode = document.querySelector(selector.cont);
  const currList = document.querySelectorAll(selector.list);
  const nextUrl = document.querySelector(selector.next)?.href;
  if (!contNode || !currList.length || !nextUrl) return;

  const loadNode = document.createElement("div");
  loadNode.classList.add("has-text-grey", "pt-4", "has-text-centered", "x-load");
  contNode.insertAdjacentElement("afterend", loadNode);

  const useCallback = () => {
    let load = false;
    let next = nextUrl;
    let curr = currList;

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

    const serialize = (node) => {
      return node.outerHTML || new XMLSerializer().serializeToString(node);
    };

    const filter = (list) => {
      const arrCurr = Array.from(curr);
      const arrList = Array.from(list);

      const setCurr = new Set(arrCurr.map(serialize));
      return arrList.filter((node) => !setCurr.has(serialize(node)));
    };

    return async (entries, obs) => {
      if (!entries[0].isIntersecting || load) return;

      load = true;
      loadNode.textContent = "加载中...";

      try {
        const { list, url } = await Req.tasks(next, [parse]).finally(onfinally);
        if (!list.length) return onerror();

        const detail = filter(list);

        if (detail.length) {
          contNode.append(...detail);
          window.dispatchEvent(new CustomEvent("JavDB.scroll", { detail }));
        }

        if (!url || !detail.length) {
          loadNode.textContent = "暂无更多";
          return obs.disconnect();
        }

        curr = list;
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
