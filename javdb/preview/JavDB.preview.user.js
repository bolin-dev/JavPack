// ==UserScript==
// @name            JavDB.preview
// @namespace       JavDB.preview@blc
// @version         0.0.1
// @author          blc
// @description     悬停预览
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/)/
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
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const SELECTORS = ".movie-list .cover";
  if (!document.querySelector(SELECTORS)) return;
  GM_addStyle(`
  ${SELECTORS} video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 1;
    opacity: 0;
    transition: opacity .2s ease-in-out;
    background: #000;
  }
  ${SELECTORS} video.fade-in {
    opacity: 1;
  }
  `);

  let currentElem = null;

  let prevX = null;
  let prevY = null;
  let prevTime = null;

  let lastX = null;
  let lastY = null;
  let lastTime = null;

  const interval = 600; // 检测间隔（ms）
  const sensitivity = 0; // 鼠标移动速度（px/ms）
  let checkSpeedInterval = null;

  document.addEventListener("mouseover", e => {
    if (currentElem) return;

    const target = e.target.closest(SELECTORS);
    if (!target) return;

    prevX = e.pageX;
    prevY = e.pageY;
    prevTime = Date.now();

    currentElem = target;
    currentElem.addEventListener("mousemove", onMouseMove);
    checkSpeedInterval = setInterval(trackSpeed, interval);
  });

  function onMouseMove(e) {
    lastX = e.pageX;
    lastY = e.pageY;
    lastTime = Date.now();
  }

  function trackSpeed() {
    let speed;

    if (!lastTime || lastTime === prevTime) {
      speed = 0;
    } else {
      speed = Math.sqrt(Math.pow(prevX - lastX, 2) + Math.pow(prevY - lastY, 2)) / (lastTime - prevTime);
    }

    if (speed <= sensitivity) {
      onHover(currentElem);
    } else {
      prevX = lastX;
      prevY = lastY;
      prevTime = Date.now();
    }
  }

  async function onHover(elem) {
    destroy(elem);

    let { trailer } = elem.dataset;
    if (trailer) return setPreview(elem, trailer);

    const parentNode = elem.closest("a");
    const { href } = parentNode;
    const mid = `trailer_${href.split("/").at(-1)}`;

    trailer = localStorage.getItem(mid); // 从缓存获取
    if (!trailer) {
      const code = parentNode.querySelector(".video-title strong").textContent;
      let [res, dom] = await Promise.allSettled([fetchJavspyl(code), request(href)]);

      if (res.status === "fulfilled") trailer = res.value ?? ""; // 从 javspyl 获取

      if (!trailer) {
        if (dom.status !== "fulfilled") return;
        dom = dom.value;

        trailer = dom.querySelector("#preview-video source")?.getAttribute("src"); // 从详情页获取

        if (!trailer && dom.querySelector(".title.is-4 strong").textContent.includes("無碼")) {
          trailer = await fetchByStudio(code, dom); // 从片商获取
        }
      }
    }

    if (!trailer) return;
    elem.dataset.trailer = trailer;
    localStorage.setItem(mid, trailer);

    if (elem === currentElem) setPreview(elem, trailer);
  }

  function fetchByStudio(code, dom) {
    let studio = "";
    for (const node of dom.querySelectorAll(".movie-panel-info > .panel-block")) {
      if (node.querySelector("strong")?.textContent !== "片商:") continue;
      studio = node.querySelector(".value").textContent;
      break;
    }
    if (studio) return fetchStudio(code, studio.trim());
  }

  function setPreview(elem, trailer) {
    trailer = trailer.replace("mhb.mp4", "dm.mp4").replace("mmb.mp4", "dm.mp4").replace("sm.mp4", "dm.mp4");

    const video = document.createElement("video");
    video.setAttribute("src", trailer);
    video.setAttribute("x-webkit-airplay", "deny");
    video.setAttribute("controlslist", "nodownload nofullscreen noremoteplayback noplaybackrate");
    video.setAttribute("title", "");
    video.poster = elem.querySelector("img").src;
    video.autoplay = true;
    video.autoPictureInPicture = false;
    video.controls = true;
    video.currentTime = 3;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.volume = localStorage.getItem("volume") ?? 0;

    elem.append(video);
    video.focus();
    setTimeout(() => video.classList.add("fade-in"), 50);

    video.addEventListener("keydown", e => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      video.currentTime += e.key === "ArrowLeft" ? -3 : 5;
    });

    video.addEventListener("volumechange", ({ target }) => localStorage.setItem("volume", target.volume));
  }

  document.addEventListener("mouseout", e => {
    if (!currentElem) return;

    let relatedTarget = e.relatedTarget;
    while (relatedTarget) {
      if (relatedTarget === currentElem) return;
      relatedTarget = relatedTarget.parentNode;
    }

    onLeave(currentElem);
    currentElem = null;
  });

  function onLeave(elem) {
    destroy(elem);

    const video = elem.querySelector("video");
    if (!video) return;

    video.classList.remove("fade-in");
    setTimeout(() => video.remove(), 200);
  }

  function destroy(elem) {
    elem.removeEventListener("mousemove", onMouseMove);
    clearInterval(checkSpeedInterval);
  }

  document.addEventListener("mouseleave", e => {
    if (!currentElem) return;

    const from = e.relatedTarget || e.toElement;
    if (from && from.nodeName !== "HTML") return;

    onLeave(currentElem);
    currentElem = null;
  });

  document.addEventListener("visibilitychange", () => {
    if (!currentElem || !document.hidden) return;

    onLeave(currentElem);
    currentElem = null;
  });
})();
