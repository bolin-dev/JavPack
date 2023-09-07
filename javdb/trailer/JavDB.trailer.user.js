// ==UserScript==
// @name            JavDB.trailer
// @namespace       JavDB.trailer@blc
// @version         0.0.1
// @author          blc
// @description     预告片
// @include         /^https:\/\/javdb\d*\.com\/v\/\w+/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/trailer/JavPack.trailer.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         caribbeancom.com
// @connect         pacopacomama.com
// @connect         tokyo-hot.com
// @connect         10musume.com
// @connect         muramura.tv
// @connect         javspyl.tk
// @connect         1pondo.tv
// @connect         heyzo.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(async function () {
  let mid = location.pathname.split("/").at(-1);
  if (!mid) return;

  mid = `trailer_${mid}`;
  let trailer = localStorage.getItem(mid) ?? document.querySelector("#preview-video source")?.getAttribute("src");

  if (!trailer) {
    const infoNode = document.querySelector(".movie-panel-info");
    const code = infoNode.querySelector(".first-block .value")?.textContent;
    if (!code) return;

    if (document.querySelector(".title.is-4 strong").textContent.includes("無碼")) {
      let studio = "";
      for (const node of infoNode.querySelectorAll(".panel-block")) {
        if (node.querySelector("strong")?.textContent !== "片商:") continue;

        studio = node.querySelector(".value").textContent;
        break;
      }

      if (studio) trailer = await fetchStudio(code, studio.trim());
    }

    if (!trailer) trailer = await fetchJavspyl(code);
  }
  if (!trailer || /\.m3u8?$/i.test(trailer)) return;

  if (!trailer.includes("//")) trailer = `https://${trailer}`;
  localStorage.setItem(mid, trailer);

  GM_addStyle(`
  .column-video-cover .cover-container .play-button{top:25%}
  .trailer-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3rem!important;height:3rem!important}
  .trailer-video{position:absolute;object-fit:contain;inset:0;width:100%;height:100%;z-index:-1;background:#000}
  .trailer-index{z-index:20}
  `);

  const cover = document.querySelector(".column-video-cover > a");
  cover.insertAdjacentHTML("beforeend", '<img class="trailer-btn" src="/packs/media/images/btn-play-b414746c.svg">');

  const video = document.createElement("video");
  video.classList.add("trailer-video");
  video.src = trailer;
  video.loop = false;
  video.muted = false;
  video.volume = 0.2;
  video.controls = true;
  video.currentTime = 3;
  video.preload = "metadata";
  video.poster = cover.querySelector("img").src;
  cover.appendChild(video);

  cover.addEventListener("click", e => {
    if (e.target.closest(".play-button")) return;

    e.preventDefault();
    e.stopPropagation();

    if (video.classList.contains("trailer-index")) {
      return video.paused ? video.play() : video.pause();
    }

    video.classList.add("trailer-index");
    video.focus();
    video.play();
  });

  video.addEventListener("ended", () => {
    video.blur();
    video.classList.remove("trailer-index");
  });

  video.addEventListener("keyup", e => {
    if (e.key === "m") video.muted = !video.muted;
  });
})();
