// ==UserScript==
// @name            JavDB.trailer
// @namespace       JavDB.trailer@blc
// @version         0.0.2
// @author          blc
// @description     预告片
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.ReqTrailer.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @connect         caribbeancom.com
// @connect         pacopacomama.com
// @connect         tokyo-hot.com
// @connect         heydouga.com
// @connect         10musume.com
// @connect         muramura.tv
// @connect         dmm.co.jp
// @connect         heyzo.com
// @connect         1pondo.tv
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValues
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_info
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

Util.upStore();

const getDetails = (dom = document) => {
  const infoNode = dom?.querySelector(".movie-panel-info");
  if (!infoNode) return;

  const code = infoNode.querySelector(".first-block .value").textContent.trim();
  const isWestern = /\.\d{2}\.\d{2}\.\d{2}$/.test(code);
  const isFC2 = code.startsWith("FC2");

  const titleNode = dom.querySelector(".title.is-4");
  const isVR = titleNode.textContent.includes("【VR】");
  const isUncensored = titleNode.textContent.includes("無碼");

  const label = titleNode.querySelector("strong").textContent;
  const origin = titleNode.querySelector(".origin-title");
  const current = titleNode.querySelector(".current-title");
  const title = (origin ?? current).textContent.replace(label, "").trim();
  const cover = dom.querySelector(".video-cover")?.src ?? "";

  const studio =
    [...infoNode.querySelectorAll(":scope > .panel-block")]
      .find((node) => node.querySelector("strong")?.textContent.startsWith("片商"))
      ?.querySelector(".value a")
      ?.textContent.trim() ?? "";

  const sources = [...dom.querySelectorAll("#preview-video source")]
    .map((node) => node.getAttribute("src")?.trim())
    .filter(Boolean);

  return { code, isWestern, isFC2, isVR, isUncensored, title, cover, studio, sources };
};

const useVideo = () => {
  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { target } = e;
    target.muted = !target.muted;
  };

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { target } = e;
    target.paused ? target.play() : target.pause();
  };

  const changeVolume = (e, step) => {
    e.preventDefault();
    e.stopPropagation();

    const { target } = e;
    target.volume = target.volume + step;
  };

  const changeTime = (e, step) => {
    e.preventDefault();
    e.stopPropagation();

    const { target } = e;
    target.currentTime = target.currentTime + step;
  };

  const onKeyup = (e) => {
    const code = e.code;

    if (["KeyW"].includes(code)) return changeVolume(e, 0.2);
    if (["KeyD"].includes(code)) return changeTime(e, 4);
    if (["KeyS"].includes(code)) return changeVolume(e, -0.1);
    if (["KeyA"].includes(code)) return changeTime(e, -2);
  };

  const onKeydown = (e) => {
    const code = e.code;

    if (["KeyM"].includes(code)) return toggleMute(e);
    if (["Space"].includes(code)) return togglePlay(e);
    if (["ArrowUp"].includes(code)) return changeVolume(e, 0.2);
    if (["ArrowRight"].includes(code)) return changeTime(e, 4);
    if (["ArrowDown"].includes(code)) return changeVolume(e, -0.1);
    if (["ArrowLeft"].includes(code)) return changeTime(e, -2);
  };

  const onVolumechange = (e) => localStorage.setItem("volume", e.target.volume);

  return (sources, poster) => {
    const video = document.createElement("video");

    video.title = "";
    video.poster = poster;
    video.controls = true;
    video.preload = "metadata";
    video.volume = localStorage.getItem("volume") ?? 0.1;
    video.innerHTML = sources.map((src) => `<source src="${src}" />`).join("");

    video.addEventListener("volumechange", onVolumechange);
    video.addEventListener("keydown", onKeydown);
    video.addEventListener("keyup", onKeyup);
    return video;
  };
};

(async function () {
  const mid = unsafeWindow.appData?.split("/").at(-1);
  if (!mid || !location.pathname.startsWith("/v/")) return;

  const onstart = ({ target }) => target.style.setProperty("z-index", 11);

  const onstop = ({ target }) => target.style.setProperty("z-index", "auto");

  const onclick = (e, video) => {
    if (e.target.closest(".play-button")) return;
    e.preventDefault();
    e.stopPropagation();

    video.focus();
    video.paused ? video.play() : video.pause();
  };

  const setTrailer = ({ sources, cover }) => {
    const video = useVideo()(sources, cover);
    video.addEventListener("play", onstart);
    video.addEventListener("pause", onstop);
    video.addEventListener("ended", onstop);

    const container = document.querySelector(".column-video-cover a");
    container.insertAdjacentElement("beforeend", video);
    container.addEventListener("click", (e) => onclick(e, video));
    video.focus();
  };

  let details = GM_getValue(mid);

  if (!details) {
    details = getDetails();
    GM_setValue(mid, details);
  }

  if (details.sources.length) return setTrailer(details);

  try {
    const sources = await ReqTrailer.getTrailer(details);
    details.sources = sources;
    GM_setValue(mid, details);
    setTrailer(details);
  } catch (err) {
    Util.print(err?.message);
  }
})();

(function () {
  const selector = ".movie-list .cover";
  if (!document.querySelector(selector)) return;

  const HOVER = "x-hovered";
  const UN_HOVER = "x-un-hover";
  const SHOW = "x-show";
  const HIDE = "x-hide";

  const audioContext = new AudioContext();
  const RUNNING = audioContext.state === "running";
  audioContext.close();

  const createVideo = useVideo();

  const onVolumechange = (e) => localStorage.setItem("muted", e.target.muted);

  const handleHover = (selector, onEnter, onLeave) => {
    let currElem = null;
    let nextElem = null;

    let prevX = null;
    let prevY = null;
    let prevTime = null;

    let lastX = null;
    let lastY = null;
    let lastTime = null;

    let trackSpeedInterval = null;
    let isScrolling = false;
    let scrollTimer = null;

    const onMousemove = (e) => {
      lastX = e.pageX;
      lastY = e.pageY;
      lastTime = Date.now();
      nextElem = e.target;
    };

    const inViewport = (elem) => {
      const { top, left, bottom, right } = elem.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      return top >= 0 && left >= 0 && bottom <= viewportHeight && right <= viewportWidth;
    };

    const clearTrack = (elem) => {
      elem.removeEventListener("mousemove", onMousemove);
      if (!trackSpeedInterval) return;

      clearInterval(trackSpeedInterval);
      trackSpeedInterval = null;
    };

    const calcSpeed = () => Math.sqrt((prevX - lastX) ** 2 + (prevY - lastY) ** 2) / (lastTime - prevTime);

    const trackSpeed = () => {
      if (!nextElem.classList.contains(UN_HOVER)) {
        const speed = lastTime && lastTime !== prevTime ? calcSpeed() : 0;

        if (speed <= 0.02 && inViewport(currElem) && !isScrolling) {
          clearTrack(currElem);
          return onEnter?.(currElem);
        }
      }

      prevX = lastX;
      prevY = lastY;
      prevTime = Date.now();
    };

    const onMouseover = (e) => {
      if (currElem) return;

      const target = e.target.closest(selector);
      if (!target) return;

      prevX = e.pageX;
      prevY = e.pageY;
      prevTime = Date.now();
      currElem = target;

      currElem.addEventListener("mousemove", onMousemove);
      trackSpeedInterval = setInterval(trackSpeed, 200);
    };

    const destroy = () => {
      clearTrack(currElem);
      onLeave?.(currElem);
      currElem = null;
    };

    const onMouseout = ({ relatedTarget }) => {
      if (!currElem) return;

      let node = relatedTarget;
      while (node) {
        if (node === currElem) return;
        node = node.parentNode;
      }

      destroy();
    };

    const onVisibilitychange = () => {
      if (document.hidden) currElem ? destroy() : document.querySelector(`${selector} .${HIDE}`)?.remove();
    };

    const onBlur = () => {
      if (currElem) destroy();
    };

    const onScroll = () => {
      clearTimeout(scrollTimer);
      isScrolling = true;

      scrollTimer = setTimeout(() => {
        isScrolling = false;
        scrollTimer = null;
      }, 500);
    };

    document.addEventListener("visibilitychange", onVisibilitychange);
    document.addEventListener("mouseover", onMouseover);
    document.addEventListener("mouseout", onMouseout);

    const optimizedOnScroll = () => requestAnimationFrame(onScroll);
    window.addEventListener("scroll", optimizedOnScroll);
    window.addEventListener("blur", onBlur);
  };

  const setTrailer = (elem, { sources, cover }) => {
    if (!elem.classList.contains(HOVER)) return;
    const video = createVideo(sources.toReversed(), cover);

    video.loop = true;
    video.muted = !RUNNING || localStorage.getItem("muted") === "true";
    video.autoplay = true;
    video.currentTime = 2;
    video.disablePictureInPicture = true;
    video.setAttribute("controlslist", "nofullscreen nodownload noremoteplayback noplaybackrate");

    video.addEventListener("volumechange", onVolumechange);
    elem.append(video);

    requestAnimationFrame(() => video.classList.add(SHOW));
    video.focus();
  };

  const getTrailer = async (elem) => {
    elem.classList.add(HOVER);
    const url = elem.closest("a").href;
    const mid = url.split("/").at(-1);
    let details = GM_getValue(mid);

    try {
      if (!details) {
        details = await Req.tasks(url, [getDetails]);
        if (!details) throw new Error("Not found details");
        GM_setValue(mid, details);
      }

      if (details.sources.length) return setTrailer(elem, details);
      if (!elem.classList.contains(HOVER)) return;

      const sources = await ReqTrailer.getTrailer(details);
      details.sources = sources;
      GM_setValue(mid, details);
      setTrailer(elem, details);
    } catch (err) {
      elem.classList.remove(HOVER);
      Util.print(err?.message);
    }
  };

  const delTrailer = (elem) => {
    elem.classList.remove(HOVER);
    const video = elem.querySelector("video");
    if (!video) return;

    video.addEventListener("transitionend", () => video.remove());
    video.classList.replace(SHOW, HIDE);
  };

  handleHover(selector, getTrailer, delTrailer);
})();
