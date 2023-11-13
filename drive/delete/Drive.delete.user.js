// ==UserScript==
// @name            Drive.delete
// @namespace       Drive.delete@blc
// @version         0.0.1
// @author          blc
// @description     播放页删除
// @match           https://v.anxia.com/*
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/drive/JavPack.drive.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @connect         self
// @run-at          document-start
// @grant           GM_addStyle
// @grant           GM_xmlhttpRequest
// @grant           window.close
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const { searchParams } = new URL(location);
  const pc = searchParams.get("pickcode");
  if (!pc) return;

  GM_addStyle("#js_common_mini-dialog{display:none !important;}");

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("a[rel='web_fullscreen']")?.click();
    const htmlStr = '<a href="javascript:void(0);" class="btn-opendir" id="x-delete">删除目录</a>';
    document.querySelector(".vt-headline").insertAdjacentHTML("beforeend", htmlStr);
    document.querySelector("#x-delete").addEventListener("click", handleDel);
  });

  let loading = false;
  async function handleDel() {
    if (loading) return;
    loading = true;

    let res = await filesVideo(pc);
    if (!res) return (loading = false);

    res = await files(res.parent_id);
    res = res?.path;
    if (!res?.length) return (loading = false);

    rbDelete([res.at(-1).cid], res.at(-2).cid)
      .then(window.close)
      .finally(() => (loading = false));
  }
})();
