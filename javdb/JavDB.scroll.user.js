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
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_info
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

(function () {
  const fadeIn = (img) => {
    if (!img || img.complete) return;
    img.style.opacity = 0;
    img.addEventListener("load", ({ target }) => target.style.setProperty("opacity", 1), { once: true });
  };

  const IMGS = document.querySelectorAll(":is(.actors, .movie-list) img");
  IMGS.forEach(fadeIn);

  const contSelector = ":is(.actors, .movie-list, .section-container):has(+ nav.pagination)";
  const nextSelector = `${contSelector} + nav.pagination .pagination-next`;
  const listSelector = `${contSelector} > :is(div, a)`;

  const CONTAINER = document.querySelector(contSelector);
  const nextUrl = document.querySelector(nextSelector)?.href;
  const currList = document.querySelectorAll(listSelector);
  if (!CONTAINER || !nextUrl || !currList.length) return;

  const LOAD_CLASS = "is-loading";
  const INDICATOR = document.createElement("button");
  INDICATOR.classList.add("button", "is-rounded", "has-text-grey", "is-flex", "my-4", "mx-auto", "x-load");
  INDICATOR.textContent = "重新加载";
  CONTAINER.insertAdjacentElement("afterend", INDICATOR);

  const useCallback = (next, list, { nextSelector, listSelector }) => {
    let _next = next;
    let _list = list;

    const parse = (dom) => {
      const next = dom?.querySelector(nextSelector)?.href;
      const list = dom?.querySelectorAll(listSelector);
      return { next, list };
    };

    const filter = (list) => {
      const setList = new Set([..._list].map((node) => node.outerHTML));
      return [...list].filter((node) => !setList.has(node.outerHTML));
    };

    return async (entries, obs) => {
      if (!entries[0].isIntersecting || INDICATOR.classList.contains(LOAD_CLASS)) return;
      INDICATOR.classList.add(LOAD_CLASS);
      INDICATOR.setAttribute("disabled", "");

      try {
        const { next, list } = await Req.tasks(_next, [parse]).finally(() => INDICATOR.classList.remove(LOAD_CLASS));
        if (!list?.length) throw new Error("Not found list");
        const detail = filter(list);

        if (detail.length) {
          CONTAINER.append(...detail);
          Util.dispatchEvent(detail);
          if (IMGS.length) detail.forEach((item) => fadeIn(item.querySelector("img")));
        }

        if (!next || !detail.length) {
          INDICATOR.textContent = "暂无更多";
          return obs.disconnect();
        }

        _next = next;
        _list = list;
      } catch (err) {
        INDICATOR.removeAttribute("disabled");
        Util.print(err?.message);
      }
    };
  };

  const callback = useCallback(nextUrl, currList, { nextSelector, listSelector });
  const OBSERVER = new IntersectionObserver(callback, { rootMargin: "500px" });

  OBSERVER.observe(INDICATOR);
  INDICATOR.addEventListener("click", () => callback([{ isIntersecting: true }], OBSERVER));
})();
