// ==UserScript==
// @name            115.delDir
// @namespace       115.delDir@blc
// @version         0.0.2
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
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

(function () {
  const CONTAINER = document.querySelector(".vt-headline");
  if (!CONTAINER) return;

  const smartDel = async ({ target }) => {
    const pickcode = new URL(location).searchParams.get("pickcode");
    if (!pickcode || target.style.pointerEvents === "none") return;

    target.style.pointerEvents = "none";
    target.textContent = "请求中...";

    const { parent_id, file_id } = await Req115.filesVideo(pickcode);
    const { data } = await Req115.filesAllVideos(parent_id);
    await Req115.rbDelete([data.length === 1 ? parent_id : file_id]);

    const listNode = document.querySelector("#js-video_list");
    if (listNode.querySelectorAll("li").length === 1) return window.close();

    target.textContent = "删除";
    target.style.pointerEvents = "auto";

    const curr = listNode.querySelector("li.hover");
    const near = curr.nextElementSibling ?? curr.previousElementSibling;

    curr.remove();
    near.querySelector("a").click();
  };

  const obsCont = (node) => {
    const observer = new MutationObserver((mutations, obs) => {
      if (mutations[0].type !== "childList") return;
      CONTAINER.querySelector(":scope > div")?.remove();
      CONTAINER.appendChild(node);
      obs.disconnect();
    });
    observer.observe(CONTAINER, { childList: true, attributes: false, characterData: false });
  };

  const delNode = document.createElement("a");
  delNode.href = "javascript:void(0);";
  delNode.className = "btn-opendir";
  delNode.textContent = "删除";
  obsCont(delNode);

  delNode.addEventListener("click", smartDel);
  document.addEventListener("keyup", ({ code }) => code === "Delete" && delNode.click());
})();
