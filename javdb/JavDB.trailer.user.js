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
  Util.upLocal();

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
    video.title = "";
    video.poster = poster;
    video.controls = true;
    video.volume = localStorage.getItem("volume") ?? 0.2;

    video.addEventListener("keydown", (e) => {
      if (e.key === "m") video.muted = !video.muted;
    });

    video.addEventListener("volumechange", ({ target }) => {
      localStorage.setItem("volume", target.volume);
    });

    return video;
  }

  const { pathname } = location;
  if (pathname.startsWith("/v/")) {
    const mid = `trailer_${pathname.split("/").pop()}`;

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

    return container.addEventListener("click", (e) => {
      if (e.target.closest(".play-button")) return;

      e.preventDefault();
      e.stopPropagation();

      video.style.zIndex = 11;
      video.focus();
      video.play();
    });
  }

  const selector = ".movie-list .cover";
  if (!document.querySelector(selector)) return;

  GM_addStyle(`
  ${selector} video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:1;opacity:0;transition:opacity .2s ease-in-out;background:#000}
  ${selector} video.fade-in{opacity:1}
  `);

  const interval = 500;
  const sensitivity = 0;

  let currElem = null;
  let trackSpeedInterval = null;

  let prevX = null;
  let prevY = null;
  let prevTime = null;

  let lastX = null;
  let lastY = null;
  let lastTime = null;

  const handleMouseover = (e) => {
    if (currElem) return;

    const target = e.target.closest(selector);
    if (!target) return;

    prevX = e.pageX;
    prevY = e.pageY;
    prevTime = Date.now();

    currElem = target;
    currElem.addEventListener("mousemove", handleMousemove);
    trackSpeedInterval = setInterval(trackSpeed, interval);
  };

  const handleMousemove = (e) => {
    lastX = e.pageX;
    lastY = e.pageY;
    lastTime = Date.now();
  };

  const trackSpeed = () => {
    let speed;

    if (!lastTime || lastTime === prevTime) {
      speed = 0;
    } else {
      speed = Math.sqrt(Math.pow(prevX - lastX, 2) + Math.pow(prevY - lastY, 2)) / (lastTime - prevTime);
    }

    if (speed <= sensitivity) {
      onHover(currElem);
    } else {
      prevX = lastX;
      prevY = lastY;
      prevTime = Date.now();
    }
  };

  const handleMouseout = ({ relatedTarget }) => {
    if (!currElem) return;

    while (relatedTarget) {
      if (relatedTarget === currElem) return;
      relatedTarget = relatedTarget.parentNode;
    }

    onLeave(currElem);
    currElem = null;
  };

  document.addEventListener("mouseover", handleMouseover);
  document.addEventListener("mouseout", handleMouseout);

  const destroy = (elem) => {
    elem.removeEventListener("mousemove", handleMousemove);
    clearInterval(trackSpeedInterval);
  };

  const onHover = async (elem) => {
    destroy(elem);

    let { trailer, cover, mid, code } = elem.dataset;
    if (trailer) return setTrailer(elem, trailer, cover);

    if (!cover || !mid || !code) {
      const parentNode = elem.closest("a");

      cover = parentNode.querySelector("img").src;
      mid = parentNode.href.split("/").pop();
      code = parentNode.querySelector(".video-title strong").textContent;

      elem.dataset.cover = cover;
      elem.dataset.mid = mid;
      elem.dataset.code = code;
    }
    const trailerMid = `trailer_${mid}`;

    trailer = localStorage.getItem(trailerMid);
    if (trailer) {
      elem.dataset.trailer = trailer;
      return setTrailer(elem, trailer, cover);
    }

    const reqList = [
      () => UtilTrailer.javspyl(code),
      () => UtilTrailer.tasks(`${location.origin}/v/${mid}`, [getDetails]),
    ];
    const resList = await Promise.allSettled(reqList.map((fn) => fn()));

    for (const { status, value } of resList) {
      if (status !== "fulfilled" || !value) continue;
      trailer = value;
      break;
    }
    if (!trailer) return;

    if (trailer.trailer) trailer = trailer.trailer;

    if (typeof trailer === "string") {
      localStorage.setItem(trailerMid, trailer);
      elem.dataset.trailer = trailer;
      if (elem === currElem) setTrailer(elem, trailer, cover);
      return;
    }

    const { isUncensored, studio } = trailer;
    if (!isUncensored || !studio) return;

    const guessStudio = UtilTrailer.useStudio();
    trailer = await guessStudio(code, studio);
    if (!trailer) return;

    localStorage.setItem(trailerMid, trailer);
    elem.dataset.trailer = trailer;
    if (elem === currElem) setTrailer(elem, trailer, cover);
  };

  const getDetails = (dom) => {
    return {
      trailer: getTrailer(dom),
      isUncensored: isUncensored(dom),
      studio: getStudio(dom),
    };
  };

  const setTrailer = (elem, trailer, cover) => {
    const video = createVideo(trailer, cover);
    elem.append(video);

    video.muted = true;
    video.currentTime = 4;
    video.focus();
    video.play();

    const ctx = new AudioContext();
    const canAutoPlay = ctx.state === "running";
    ctx.close();

    if (canAutoPlay) video.muted = false;
    setTimeout(() => video.classList.add("fade-in"), 50);
  };

  const onLeave = (elem) => {
    destroy(elem);

    const video = elem.querySelector("video");
    if (!video) return;

    video.classList.remove("fade-in");
    setTimeout(() => video.remove(), 200);
  };
})();
