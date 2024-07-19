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
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         hechuangxinxi.xyz
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_setValue
// @grant           GM_getValue
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

Util.upStore();

(function () {
  const parent = document.querySelector(".tabs.no-bottom ul");
  const container = document.querySelector("#tabs-container");
  const magnets = container.querySelector("#magnets");
  const reviews = container.querySelector("#reviews");
  const lists = container.querySelector("#lists");
  const loading = container.querySelector("article[data-movie-tab-target=loading]");
  const mid = location.pathname.split("/").pop();

  const createDom = (domStr) => {
    return `<article class="message video-panel"><div class="message-body">${domStr}</div></article>`;
  };

  const createList = ({ id, name, movies_count }) => {
    return `<a class="item box" href="/lists/${id}" title="${name}" target="_blank"><strong>${name}</strong><span>(${movies_count})</span></a>`;
  };

  const onstart = () => {
    loading.style.display = "block";
  };

  const onload = ({ data }, isCache = false) => {
    let domStr = "暂无数据";

    if (data?.lists?.length) {
      if (!isCache) GM_setValue(mid, data.lists);
      domStr = data.lists.reduce((acc, cur) => `${acc}${createList(cur)}`, "");
      domStr = `<div class="plain-grid-list">${domStr}</div>`;
    }

    lists.innerHTML = createDom(domStr);
  };

  const onerror = () => {
    lists.innerHTML = createDom("读取失败");
  };

  const onfinally = () => {
    loading.style.display = "none";
  };

  function toggleLists() {
    magnets.style.display = "none";
    reviews.style.display = "none";
    lists.style.display = "block";
    if (lists.hasChildNodes()) return;

    const _lists = GM_getValue(mid);
    if (_lists) return onload({ data: { lists: _lists } }, true);

    onstart();
    ReqDB.related(mid).then(onload).catch(onerror).finally(onfinally);
  }

  parent.addEventListener(
    "click",
    (e) => {
      if (e.target.nodeName === "UL") return;

      const { dataset, classList } = e.target.closest("li");
      if (dataset.movieTabTarget !== "listTab") return;

      e.preventDefault();
      e.stopPropagation();
      if (classList.contains("is-active")) return;

      parent.querySelector("li.is-active").classList.remove("is-active");
      classList.add("is-active");
      toggleLists();
    },
    true,
  );
})();
