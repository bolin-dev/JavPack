// ==UserScript==
// @name            JavDB.trailer
// @namespace       JavDB.trailer@blc
// @version         0.0.1
// @author          blc
// @description     预告片
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.ReqTrailer.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @connect         pacopacomama.com
// @connect         caribbeancom.com
// @connect         tokyo-hot.com
// @connect         10musume.com
// @connect         muramura.tv
// @connect         1pondo.tv
// @connect         heyzo.com
// @connect         dmm.co.jp
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValues
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

Util.upStore();

const getDetails = (dom = document) => {
  const infoNode = dom.querySelector(".movie-panel-info");
  const code = infoNode.querySelector(".first-block .value").textContent.trim();
  const isFC2 = code.startsWith("FC2");
  const isWestern = /\.\d{2}\.\d{2}\.\d{2}$/.test(code);

  const titleNode = dom.querySelector(".title.is-4");
  const isVR = titleNode.textContent.includes("【VR】");
  const isUncensored = titleNode.textContent.includes("無碼");

  const origin = titleNode.querySelector(".origin-title");
  const current = titleNode.querySelector(".current-title");
  const title = (origin ?? current).textContent.replaceAll(code, "").trim();

  const cover = dom.querySelector(".video-cover")?.src ?? "";

  const studio =
    [...infoNode.querySelectorAll(".panel-block")]
      .find((node) => node.querySelector("strong")?.textContent.startsWith("片商"))
      ?.querySelector(".value")
      .textContent.trim() ?? "";

  const sources = [...dom.querySelectorAll("#preview-video source")]
    .map((node) => node.getAttribute("src"))
    .filter(Boolean);

  return { isVR, isFC2, isWestern, isUncensored, code, title, studio, cover, sources };
};

const useVideo = () => {
  const onKeydown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { code, target } = e;
    if (code === "KeyM") target.muted = !target.muted;
    if (["KeyW", "ArrowUp"].includes(code)) target.volume += 0.1;
    if (["KeyS", "ArrowDown"].includes(code)) target.volume -= 0.1;
    if (["KeyA", "ArrowLeft"].includes(code)) target.currentTime -= 2;
    if (["KeyD", "ArrowRight"].includes(code)) target.currentTime += 4;
  };

  const onVolumechange = ({ target }) => localStorage.setItem("volume", target.volume);

  return (sources, poster) => {
    const video = document.createElement("video");
    video.title = "";
    video.poster = poster;
    video.controls = true;
    video.preload = "metadata";
    video.volume = localStorage.getItem("volume") ?? 0.2;

    sources.forEach((src) => {
      const source = document.createElement("source");
      source.src = src;
      video.append(source);
    });

    video.addEventListener("keydown", onKeydown);
    video.addEventListener("volumechange", onVolumechange);
    return video;
  };
};

(function () {
  const container = document.querySelector(".column-video-cover");
  if (!container) return;

  const setTrailer = ({ sources, cover }) => {
    const createVideo = useVideo();
    const video = createVideo(sources, cover);
    container.querySelector("a").insertAdjacentElement("beforeend", video);

    container.addEventListener("click", (e) => {
      if (e.target.closest(".play-button")) return;

      e.preventDefault();
      e.stopPropagation();

      if (video.paused) {
        video.style.zIndex = 11;
        return video.play();
      }

      video.style.zIndex = "auto";
      video.pause();
    });
  };

  const mid = unsafeWindow.appData.split("/").filter(Boolean).pop();
  let details = GM_getValue(mid);

  if (!details) {
    details = getDetails();
    GM_setValue(mid, details);
  }

  if (details.sources.length) return setTrailer(details);

  const onsuccess = (sources) => {
    details.sources = sources;
    GM_setValue(mid, details);
    setTrailer(details);
  };

  ReqTrailer.getTrailer(details)
    .then(onsuccess)
    .catch((err) => console.error(err.message));
})();
