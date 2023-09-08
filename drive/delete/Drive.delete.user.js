// ==UserScript==
// @name            Drive.delete
// @namespace       Drive.delete@blc
// @version         0.0.1
// @author          blc
// @description     播放页删除
// @include         /^https:\/\/v\.anxia\.com\/\?pickcode=\w+/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/drive/JavPack.drive.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @connect         self
// @run-at          document-body
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

  let loading = false;
  const handleDel = async () => {
    if (loading) return;
    loading = true;

    let res = await filesVideo(pc);
    if (!res) {
      loading = false;
      return;
    }

    res = await files(res.parent_id);
    res = res.path;
    if (!res?.length) {
      loading = false;
      return;
    }

    rbDelete([res.at(-1).cid], res.at(-2).cid)
      .then(window.close)
      .finally(() => {
        loading = false;
      });
  };

  document
    .querySelector(".vt-headline")
    .insertAdjacentHTML("beforeend", `<a href="javascript:void(0);" class="btn-opendir" id="x-delete">删除目录</a>`);
  document.querySelector("#x-delete").addEventListener("click", handleDel);
})();
