// ==UserScript==
// @name            JavDB.lists
// @namespace       JavDB.lists@blc
// @version         0.0.1
// @author          blc
// @description     相关清单
// @match           https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.ReqDB.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @connect         hechuangxinxi.xyz
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_setValue
// @grant           GM_getValue
// ==/UserScript==

Util.upStore();

(function () {
  const mid = location.pathname.split("/").pop();
  const tabsNode = document.querySelector(".tabs.no-bottom");
  const magnetsNode = document.querySelector("#magnets");
  const reviewsNode = document.querySelector("#reviews");
  const listsNode = document.querySelector("#lists");
  const loadNode = document.querySelector("#tabs-container > article");

  const createDom = (domStr) => {
    return `<article class="message video-panel"><div class="message-body">${domStr}</div></article>`;
  };

  const createList = ({ id, name, movies_count }) => {
    return `<a class="item box" href="/lists/${id}" title="${name}" target="_blank"><strong>${name}</strong><span>(${movies_count})</span></a>`;
  };

  const onstart = () => {
    loadNode.style.display = "block";
  };

  const onload = ({ data }, isCache = false) => {
    let domStr = "暂无数据";

    if (data?.lists?.length) {
      const lists = data.lists.map(({ id, name, movies_count }) => ({ id, name, movies_count }));
      domStr = lists.reduce((acc, cur) => `${acc}${createList(cur)}`, "");
      domStr = `<div class="plain-grid-list">${domStr}</div>`;
      if (!isCache) GM_setValue(mid, lists);
    }

    listsNode.innerHTML = createDom(domStr);
  };

  const onerror = () => {
    listsNode.innerHTML = createDom("读取失败");
  };

  const onfinally = () => {
    loadNode.style.display = "none";
  };

  const loadLists = () => {
    magnetsNode.style.display = "none";
    reviewsNode.style.display = "none";
    listsNode.style.display = "block";
    if (listsNode.hasChildNodes()) return;

    const lists = GM_getValue(mid);
    if (lists) return onload({ data: { lists } }, true);

    onstart();
    ReqDB.related(mid).then(onload).catch(onerror).finally(onfinally);
  };

  const onclick = (e) => {
    const target = e.target.closest("li");
    if (!target) return;

    const { dataset, classList } = target;
    if (dataset.movieTabTarget !== "listTab") return;

    e.preventDefault();
    e.stopPropagation();
    if (classList.contains("is-active")) return;

    tabsNode.querySelector("li.is-active").classList.remove("is-active");
    classList.add("is-active");
    loadLists();
  };

  tabsNode.addEventListener("click", onclick, true);
})();
