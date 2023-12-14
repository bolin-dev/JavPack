// ==UserScript==
// @name            JavDB.trailer
// @namespace       JavDB.trailer@blc
// @version         0.0.1
// @author          blc
// @description     预告片
// @match           https://javdb.com/*
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.UtilTrailer.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         caribbeancom.com
// @connect         pacopacomama.com
// @connect         tokyo-hot.com
// @connect         10musume.com
// @connect         muramura.tv
// @connect         javspyl.tk
// @connect         1pondo.tv
// @connect         heyzo.com
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(async function () {
  function getTrailer(dom = document) {
    return dom.querySelector("#preview-video source")?.getAttribute("src");
  }

  function isUncensored(dom = document) {
    return dom.querySelector(".title.is-4 strong").textContent.includes("無碼");
  }

  function getStudio(dom = document) {
    return [...dom.querySelectorAll(".movie-panel-info > .panel-block")]
      .find((item) => {
        return item.querySelector("strong")?.textContent === "片商:";
      })
      ?.querySelector(".value").textContent;
  }

  function createVideo(src, poster) {
    const video = document.createElement("video");
    video.src = src;
    video.loop = false;
    video.poster = poster;
    video.controls = true;
    video.volume = localStorage.getItem("volume") ?? 0.2;
    return video;
  }

  if (location.pathname.startsWith("/v/")) {
    const mid = `trailer_${location.pathname.split("/").pop()}`;

    let trailer = localStorage.getItem(mid);
    if (!trailer) trailer = getTrailer();
    if (!trailer) {
      const code = document.querySelector(".first-block .value").textContent;
      const reqList = [() => UtilTrailer.javspyl(code)];

      if (isUncensored()) {
        const studio = getStudio();
        if (studio) {
          const guessStudio = UtilTrailer.useStudio();
          reqList.push(() => guessStudio(code, studio));
        }
      }

      const resList = await Promise.allSettled(reqList.map((fn) => fn()));
      for (const { status, value } of resList) {
        if (status !== "fulfilled" || !value) continue;
        trailer = value;
        break;
      }
    }
    if (!trailer) return;

    localStorage.setItem(mid, trailer);
    const container = document.querySelector(".column-video-cover > a");
    const cover = container.querySelector("img");
    const video = createVideo(trailer, cover.src);
    cover.replaceWith(video);

    video.addEventListener("volumechange", ({ target }) => localStorage.setItem("volume", target.volume));
    container.addEventListener("click", (e) => {
      if (e.target.closest(".play-button")) return;

      e.preventDefault();
      e.stopPropagation();
      if (!video.paused) return video.pause();

      video.focus();
      video.play();
    });

    const btn = container.querySelector(".play-button");
    if (!btn) return;

    video.addEventListener("play", () => btn.classList.add("is-hidden"));
    video.addEventListener("pause", () => btn.classList.remove("is-hidden"));
    return;
  }
})();
