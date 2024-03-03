// ==UserScript==
// @name            115.delDir
// @namespace       115.delDir@blc
// @version         0.0.1
// @author          blc
// @description     播放页删除
// @match           https://v.anxia.com/*
// @icon            https://v.anxia.com/m_r/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         self
// @connect         115.com
// @run-at          document-start
// @grant           GM_xmlhttpRequest
// @grant           window.close
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const { searchParams } = new URL(location);
  const pc = searchParams.get("pickcode");
  if (!pc) return;

  const turnNearby = () => {
    const curr = document.querySelector("#js-video_list > li.hover");
    const nearby = curr.nextElementSibling ?? curr.previousElementSibling;
    location.href = nearby.querySelector("a").href;
  };

  const smartDel = ({ file_id, parent_id }) => {
    const videos = document.querySelectorAll("#js-video_list > li");
    if (videos.length === 1) return Req115.rbDelete([parent_id]).then(window.close);
    Req115.rbDelete([file_id]).then(turnNearby);
  };

  const delNodeId = "x-del";

  GM_addStyle(`
  #${delNodeId} {
    background: rgb(175, 23, 0);
  }
  #js_common_mini-dialog {
    display: none !important;
  }
  `);

  const delNode = document.createElement("a");
  delNode.id = delNodeId;
  delNode.textContent = "删除";
  delNode.className = "btn-opendir";
  delNode.href = "javascript:void(0);";

  delNode.addEventListener("click", ({ target }) => {
    target.textContent = "请求中...";
    target.style.pointerEvents = "none";
    Req115.filesVideo(pc).then(smartDel);
  });

  document.addEventListener("DOMContentLoaded", ({ target }) => {
    target.querySelector(".vt-headline").insertAdjacentElement("beforeend", delNode);
  });
})();
