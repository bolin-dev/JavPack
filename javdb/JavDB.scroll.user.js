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
  const contSelector = ":is(.actors, .movie-list, .section-container):has(+ nav.pagination)";
  const nextSelector = `${contSelector} + nav.pagination .pagination-next`;
  const listSelector = `${contSelector} > :is(div, a)`;

  const CONT = document.querySelector(contSelector);
  const nextUrl = document.querySelector(nextSelector)?.href;
  const currList = document.querySelectorAll(listSelector);
  if (!CONT || !nextUrl || !currList.length) return;

  const fadeIn = (node) => {
    const img = node.querySelector("img");
    if (!img || img.complete) return;

    img.style.opacity = 0;
    img.addEventListener("load", ({ target }) => target.style.setProperty("opacity", 1), { once: true });
  };

  const delTitle = (node) => {
    node.querySelector("a:has(img)")?.removeAttribute("title");
  };

  const useLoadMore = (next, list, { nextSelector, listSelector }) => {
    const loadCls = "is-loading";
    let _next = next;
    let _list = list;

    const getUrl = (node) => node?.href;
    const getLbl = getUrl(list[0]) ? getUrl : (node) => getUrl(node.querySelector("a"));

    const parser = (dom) => {
      const next = dom?.querySelector(nextSelector)?.href;
      const list = dom?.querySelectorAll(listSelector);
      return { next, list };
    };

    const filter = (list) => {
      const setList = new Set([..._list].map(getLbl));
      return [...list].filter((node) => !setList.has(getLbl(node)));
    };

    return async (entries, obs) => {
      const { isIntersecting = true, target } = entries[0];
      if (!isIntersecting || target.classList.contains(loadCls)) return;

      target.classList.add(loadCls);
      target.setAttribute("disabled", "");

      try {
        const { next, list } = await Req.tasks(_next, [parser]).finally(() => target.classList.remove(loadCls));
        if (!list?.length) throw new Error("Not found list");
        const detail = filter(list);

        if (detail.length) {
          CONT.append(...detail);
          Util.dispatchEvent(detail);
          detail.forEach((node) => fadeIn(node) || delTitle(node));
        }

        if (!next || !detail.length) {
          target.textContent = "暂无更多";
          return obs.disconnect();
        }

        _next = next;
        _list = list;
      } catch (err) {
        target.removeAttribute("disabled");
        Util.print(err?.message);
      }
    };
  };

  const target = document.createElement("button");
  target.classList.add("button", "is-rounded", "has-text-grey", "is-flex", "my-4", "mx-auto", "x-load");
  target.textContent = "重新加载";

  currList.forEach((node) => fadeIn(node) || delTitle(node));
  CONT.insertAdjacentElement("afterend", target);

  const loadMore = useLoadMore(nextUrl, currList, { nextSelector, listSelector });
  const obs = new IntersectionObserver(loadMore, { rootMargin: "500px" });

  target.addEventListener("click", () => loadMore([{ target }], obs));
  obs.observe(target);
})();
