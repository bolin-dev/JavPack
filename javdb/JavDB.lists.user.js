// ==UserScript==
// @name            JavDB.lists
// @namespace       JavDB.lists@blc
// @version         0.0.2
// @author          blc
// @description     相关清单
// @match           https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.ReqDB.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @connect         ffaoa.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValues
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_getValue
// @grant           GM_setValue
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

Util.upStore();

(function () {
  const mid = unsafeWindow.appData?.split("/").at(-1);
  if (!mid) return;

  const tabsNode = document.querySelector(".tabs.no-bottom");
  const magnetsNode = document.querySelector("#magnets");
  const reviewsNode = document.querySelector("#reviews");
  const listsNode = document.querySelector("#lists");
  const loadNode = document.querySelector("#tabs-container > article");

  const renderCont = (insert) => {
    return `<article class="message video-panel"><div class="message-body">${insert}</div></article>`;
  };

  const renderList = ({ id, name, movies_count }) => {
    return `<a class="item box" href="/lists/${id}" title="${name}" target="_blank"><strong>${name}</strong><span>(${movies_count})</span></a>`;
  };

  const setLists = (sources) => {
    let domStr = "暂无数据";
    if (sources.length) domStr = `<div class="plain-grid-list">${sources.map(renderList).join("")}</div>`;
    listsNode.innerHTML = renderCont(domStr);
  };

  const showLists = ({ dataset }) => {
    magnetsNode.style.display = "none";
    reviewsNode.style.display = "none";
    listsNode.style.display = "block";

    if (dataset.loaded === "true") return;
    dataset.loaded = "true";

    const lists = GM_getValue(mid, []);
    if (lists.length) return setLists(lists);

    listsNode.innerHTML = "";
    loadNode.style.display = "block";

    ReqDB.related(mid)
      .then(({ data }) => {
        const sources = data?.lists ?? [];
        GM_setValue(mid, sources);
        setLists(sources);
      })
      .catch(() => {
        dataset.loaded = "false";
        listsNode.innerHTML = renderCont("读取失败");
      })
      .finally(() => loadNode.style.setProperty("display", "none"));
  };

  const onclick = (e) => {
    const target = e.target.closest("li");
    if (!target) return;

    const { dataset, classList } = target;
    if (dataset.movieTabTarget !== "listTab") return;

    e.preventDefault();
    e.stopPropagation();
    if (classList.contains("is-active")) return;

    tabsNode.querySelector(".is-active").classList.remove("is-active");
    classList.add("is-active");
    showLists(target);
  };

  tabsNode.addEventListener("click", onclick, true);
})();
