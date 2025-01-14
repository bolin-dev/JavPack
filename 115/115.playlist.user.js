// ==UserScript==
// @name            115.playlist
// @namespace       115.playlist@blc
// @version         0.0.2
// @author          blc
// @description     播放列表
// @match           https://115.com/*
// @match           https://v.anxia.com/*
// @icon            https://v.anxia.com/m_r/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @run-at          document-end
// @grant           GM_deleteValues
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

Util.upStore();

(function () {
  const FILTER = document.querySelector(".list-filter");
  if (!FILTER) return;

  const getPlaylist = (nodeList) => {
    const res = [];

    nodeList.forEach((node) => {
      const pc = node.getAttribute("pick_code");
      if (pc) res.push({ n: node.title, pc });
    });

    return res;
  };

  const onclick = (e) => {
    if (!FILTER.querySelector(".selected[val='4']")) return;

    const target = e.target.closest(".list-contents .file-name .name");
    if (!target) return;

    const pickcode = target.closest("li").getAttribute("pick_code");
    if (!pickcode) return;

    e.preventDefault();
    e.stopPropagation();

    const cid = new URL(window.parent.location).searchParams.get("cid");
    const nodeList = target.closest(".list-contents ul").querySelectorAll("li");
    GM_setValue(cid, getPlaylist(nodeList));

    const tab = Grant.openTab(`https://v.anxia.com/?pickcode=${pickcode}&cid=${cid}`);
    tab.onclose = () => GM_deleteValue(cid);
  };

  document.addEventListener("click", onclick, true);
})();

(function () {
  const CONTAINER = document.querySelector("#js-video_list");
  if (!CONTAINER) return;

  const STAR = document.querySelector(".play-slide-opt .btn-opt[btn='fav']");
  const FULL = document.querySelector(".bar-side .btn-opt[rel='fullscreen']");

  const onkeyup = ({ code }) => {
    if (code === "KeyL") return STAR?.click();
    if (code === "KeyF") return FULL?.click();

    const target = CONTAINER.querySelector("li.hover");
    if (code === "BracketRight") return target?.nextElementSibling?.querySelector("a").click();
    if (code === "BracketLeft") return target?.previousElementSibling?.querySelector("a").click();
  };

  document.addEventListener("keyup", onkeyup);
  const { searchParams } = new URL(location);

  const pickcode = searchParams.get("pickcode");
  const cid = searchParams.get("cid");
  if (!pickcode || !cid) return;

  const playlist = GM_getValue(cid, []);
  if (!playlist.find(({ pc }) => pc === pickcode)) return;

  const repList = (list, curr, cid) => {
    CONTAINER.innerHTML = list
      .map(({ pc, n }) => {
        return `
        <li pickcode="${pc}" style="padding:0px" class="${pc === curr ? "hover" : ""}">
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
      .join("");
  };

  const obsList = (callback) => {
    const observer = new MutationObserver((mutations, obs) => {
      if (mutations[0].type !== "childList") return;
      obs.disconnect();
      callback();
    });
    observer.observe(CONTAINER, { childList: true, attributes: false, characterData: false });
  };

  const setList = () => repList(playlist, pickcode, cid);

  CONTAINER.querySelector("li") ? setList() : obsList(setList);
})();
