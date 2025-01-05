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
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

Util.upStore();

const getDetails = (dom = document) => {
  const infoNode = dom.querySelector(".movie-panel-info");
  if (!infoNode) throw new Error("Not found info");

  const code = infoNode.querySelector(".first-block .value").textContent.trim();
  const isFC2 = code.startsWith("FC2");
  const isWestern = /\.\d{2}\.\d{2}\.\d{2}$/.test(code);

  const titleNode = dom.querySelector(".title.is-4");
  const isVR = titleNode.textContent.includes("【VR】");
  const isUncensored = titleNode.textContent.includes("無碼");

  const label = titleNode.querySelector("strong").textContent;
  const origin = titleNode.querySelector(".origin-title");
  const current = titleNode.querySelector(".current-title");
  const title = (origin ?? current).textContent.replace(label, "").trim();
  const cover = dom.querySelector(".video-cover")?.src ?? "";

  const studio =
    [...infoNode.querySelectorAll(".panel-block")]
      .find((node) => node.querySelector("strong")?.textContent.startsWith("片商"))
      ?.querySelector(".value")
      .textContent.trim() ?? "";

  const sources = [...dom.querySelectorAll("#preview-video source")]
    .map((node) => node.getAttribute("src")?.trim())
    .filter(Boolean);

  return { isVR, isFC2, isWestern, isUncensored, code, title, studio, cover, sources };
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

  const onKeydown = (e) => {
    const code = e.code;

    if (["KeyM"].includes(code)) return toggleMute(e);
    if (["Space"].includes(code)) return togglePlay(e);
    if (["KeyW", "ArrowUp"].includes(code)) return changeVolume(e, 0.1);
    if (["KeyS", "ArrowDown"].includes(code)) return changeVolume(e, -0.1);
    if (["KeyA", "ArrowLeft"].includes(code)) return changeTime(e, -2);
    if (["KeyD", "ArrowRight"].includes(code)) return changeTime(e, 4);
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
      source.type = "video/mp4";
      video.append(source);
    });

    video.addEventListener("keydown", onKeydown);
    video.addEventListener("volumechange", onVolumechange);
    return video;
  };
};

(function () {
  const container = document.querySelector(".column-video-cover");
  const mid = unsafeWindow.appData?.split("/").at(-1);
  if (!container || !mid) return;

  const onstart = ({ target }) => {
    target.style.zIndex = 11;
  };

  const onstop = ({ target }) => {
    target.style.zIndex = "auto";
  };

  const setTrailer = ({ sources, cover }) => {
    const video = useVideo()(sources, cover);

    video.addEventListener("play", onstart);
    video.addEventListener("pause", onstop);
    video.addEventListener("ended", onstop);

    container.querySelector("a").insertAdjacentElement("beforeend", video);

    container.addEventListener("click", (e) => {
      if (e.target.closest(".play-button")) return;

      e.preventDefault();
      e.stopPropagation();

      video.focus();
      video.paused ? video.play() : video.pause();
    });

    video.focus();
  };

  let details = GM_getValue(mid);

  if (!details) {
    details = getDetails();
    GM_setValue(mid, details);
  }

  if (details.sources.length) return setTrailer(details);

  ReqTrailer.getTrailer(details)
    .then((sources) => {
      details.sources = sources;
      GM_setValue(mid, details);
      setTrailer(details);
    })
    .catch((err) => console.warn(err?.message));
})();

(function () {
  const SELECTOR = ".movie-list .cover";
  if (!document.querySelector(SELECTOR)) return;

  const TAG = "x-hovered";
  const SHOW = "x-show";
  const HIDE = "x-hide";

  const audioContext = new AudioContext();
  const isRunning = audioContext.state === "running";
  audioContext.close();

  const createVideo = useVideo();

  const handleHover = (selector, onEnter, onLeave) => {
    let currElem = null;

    let prevX = null;
    let prevY = null;
    let prevTime = null;

    let lastX = null;
    let lastY = null;
    let lastTime = null;

    let trackSpeedInterval = null;
    const interval = 200;
    const sensitivity = 0.02;

    let isScrolling = false;
    let scrollTimer = null;
    const scrollEndDelay = 500;

    const onMousemove = (e) => {
      lastX = e.pageX;
      lastY = e.pageY;
      lastTime = Date.now();
    };

    const isInViewport = (elem) => {
      const rect = elem.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    };

    const clearTrack = (elem) => {
      elem.removeEventListener("mousemove", onMousemove);
      if (!trackSpeedInterval) return;

      clearInterval(trackSpeedInterval);
      trackSpeedInterval = null;
    };

    const trackSpeed = () => {
      let speed = 0;

      if (lastTime && lastTime !== prevTime) {
        speed = Math.sqrt(Math.pow(prevX - lastX, 2) + Math.pow(prevY - lastY, 2)) / (lastTime - prevTime);
      }

      if (speed <= sensitivity && isInViewport(currElem) && !isScrolling) {
        clearTrack(currElem);
        onEnter?.(currElem);
      } else {
        prevX = lastX;
        prevY = lastY;
        prevTime = Date.now();
      }
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
      trackSpeedInterval = setInterval(trackSpeed, interval);
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
      isScrolling = true;
      clearTimeout(scrollTimer);

      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, scrollEndDelay);
    };

    document.addEventListener("mouseover", onMouseover);
    document.addEventListener("mouseout", onMouseout);
    document.addEventListener("visibilitychange", onVisibilitychange);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("blur", onBlur);
  };

  const setTrailer = (elem, { sources, cover }) => {
    if (!elem.classList.contains(TAG)) return;
    const video = createVideo(sources.toReversed(), cover);

    video.loop = true;
    video.muted = !isRunning;
    video.autoplay = true;
    video.currentTime = 4;
    video.disablePictureInPicture = true;
    video.setAttribute("controlslist", "nofullscreen nodownload noremoteplayback noplaybackrate");

    elem.append(video);
    requestAnimationFrame(() => video.classList.add(SHOW));
    video.focus();
  };

  const onEnter = async (elem) => {
    elem.classList.add(TAG);

    const url = elem.closest("a").href;
    const mid = url.split("/").at(-1);
    let details = GM_getValue(mid);

    if (!details) {
      try {
        details = await Req.tasks(url, [getDetails]);
        GM_setValue(mid, details);
      } catch (err) {
        return console.warn(err?.message);
      }
    }

    if (details.sources.length) return setTrailer(elem, details);

    ReqTrailer.getTrailer(details)
      .then((sources) => {
        details.sources = sources;
        GM_setValue(mid, details);
        setTrailer(elem, details);
      })
      .catch((err) => console.warn(err?.message));
  };

  const onLeave = (elem) => {
    elem.classList.remove(TAG);
    const video = elem.querySelector("video");
    if (!video) return;

    video.addEventListener("transitionend", () => video.remove());
    video.classList.replace(SHOW, HIDE);
  };

  handleHover(SELECTOR, onEnter, onLeave);
})();
