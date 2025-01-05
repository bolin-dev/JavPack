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
// @connect         115.com
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           window.close
// @grant           GM_addStyle
// ==/UserScript==

(function () {
  const smartDel = async ({ target }) => {
    const { searchParams } = new URL(location);
    const pc = searchParams.get("pickcode");
    if (!pc) return;

    target.textContent = "请求中...";
    target.style.pointerEvents = "none";

    const { parent_id, file_id } = await Req115.filesVideo(pc);
    const { data } = await Req115.videos(parent_id);
    await Req115.rbDelete([data.length === 1 ? parent_id : file_id]);

    const playlistNode = document.querySelector("#js-video_list");
    if (playlistNode.querySelectorAll("li").length === 1) return window.close();

    target.textContent = "删除";
    target.style.pointerEvents = "auto";

    const curr = playlistNode.querySelector(".hover");
    const nearby = curr.nextElementSibling ?? curr.previousElementSibling;
    curr.remove();
    nearby.querySelector("a").click();
  };

  GM_addStyle(".vt-headline .btn-opendir + div {display:none}");
  const delNode = document.createElement("a");
  delNode.textContent = "删除";
  delNode.className = "btn-opendir";
  delNode.href = "javascript:void(0);";
  delNode.addEventListener("click", smartDel);

  document.querySelector(".vt-headline")?.insertAdjacentElement("beforeend", delNode);
  document.addEventListener("keyup", ({ code }) => code === "Delete" && delNode.click());
})();
