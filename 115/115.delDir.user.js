// ==UserScript==
// @name            115.delDir
// @namespace       115.delDir@blc
// @version         0.0.1
// @description     播放页删除目录
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @grant           GM_addStyle
// @grant           GM_xmlhttpRequest
// @grant           window.close
// @author          blc
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req115.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util115.lib.js
// @match           https://v.anxia.com/*
// @run-at          document-start
// @connect         115.com
// @connect         self
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const { searchParams } = new URL(location);
  const pc = searchParams.get("pickcode");
  if (!pc) return;

  GM_addStyle("#js_common_mini-dialog{display:none !important;}#x-del{background:rgb(175, 23, 0)}");
  document.addEventListener("DOMContentLoaded", () => {
    const htmlStr = '<a href="javascript:void(0);" class="btn-opendir" id="x-del">删除目录</a>';
    document.querySelector(".vt-headline").insertAdjacentHTML("beforeend", htmlStr);
    document.querySelector("#x-del").addEventListener("click", ({ target }) => {
      target.style.pointerEvents = "none";
      target.textContent = "请求中...";
      Util115.delDirByPc(pc).then(window.close);
    });
  });
})();
