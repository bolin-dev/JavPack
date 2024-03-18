// ==UserScript==
// @name            115.playlist
// @namespace       115.playlist@blc
// @version         0.0.1
// @author          blc
// @description     播放列表
// @match           https://115.com/*
// @match           https://v.anxia.com/*
// @icon            https://115.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const filterBox = document.querySelector("#js_filter_box");
  if (!filterBox) return;

  document.addEventListener(
    "click",
    (e) => {
      if (!filterBox.querySelector(".selected[val='4']")) return;

      const target = e.target.closest(".list-contents .file-name .name");
      if (!target) return;

      const pickcode = target.closest("li").getAttribute("pick_code");
      if (!pickcode) return;

      e.preventDefault();
      e.stopPropagation();

      const { searchParams } = new URL(window.parent.location);
      const cid = searchParams.get("cid");
      Grant.openTab(`https://v.anxia.com/?pickcode=${pickcode}&cid=${cid}`);
    },
    true,
  );
})();

(function () {
  const videoList = document.querySelector("#js-video_list");
  if (!videoList) return;

  const fullscreen = document.querySelector(".player-h5 .bar-side .btn-opt[rel='fullscreen']");

  document.addEventListener("keyup", ({ code }) => {
    if (code === "KeyF") return fullscreen?.click();

    const curr = videoList.querySelector("li.hover");
    if (code === "BracketRight") return curr.nextElementSibling?.querySelector("a").click();
    if (code === "BracketLeft") return curr.previousElementSibling?.querySelector("a").click();
  });

  const { searchParams } = new URL(location);
  const pickcode = searchParams.get("pickcode");
  const cid = searchParams.get("cid");
  if (!cid || !pickcode) return;

  let videos = [];
  let loaded = false;

  Req115.videos(cid).then(({ data }) => {
    videos = data;
    handleReplaceVideos();
  });

  const obs = new MutationObserver((mutationList, observer) => {
    for (const { type } of mutationList) {
      if (type !== "childList") return;
      loaded = true;
      handleReplaceVideos();
      observer.disconnect();
    }
  });
  obs.observe(videoList, { childList: true, attributes: false, characterData: false });

  function handleReplaceVideos() {
    if (!loaded || !videos.length) return;

    videoList.innerHTML = `
    ${videos
      .map(({ pc, n }) => {
        return `
        <li pickcode="${pc}" style="padding:0px" class="${pc === pickcode ? "hover" : ""}">
          <a
            href="/?pickcode=${pc}&cid=${cid}"
            style="height:auto;text-decoration:none;padding:5px 0 5px 5px;"
            title="${n}"
          >
            <span style="word-break:break-all">${n}</span>
          </a>
        </li>
        `;
      })
      .join("")}
    `;
  }
})();
