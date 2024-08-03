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
// @run-at          document-end
// @grant           GM_deleteValue
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

(function () {
  const filterNode = document.querySelector("#js_filter_box");
  if (!filterNode) return;

  const parseList = (list) => {
    const res = [];

    list.forEach((item) => {
      const pc = item.getAttribute("pick_code");
      if (pc) res.push({ n: item.title, pc });
    });

    return res;
  };

  const onclick = (e) => {
    if (!filterNode.querySelector(".selected[val='4']")) return;

    const target = e.target.closest(".list-contents .file-name .name");
    if (!target) return;

    const pickcode = target.closest("li").getAttribute("pick_code");
    if (!pickcode) return;

    e.preventDefault();
    e.stopPropagation();

    const { searchParams } = new URL(window.parent.location);
    const cid = searchParams.get("cid");

    const nodeList = target.closest(".list-contents ul").querySelectorAll("li");
    GM_setValue(cid, parseList(nodeList));

    const tab = Grant.openTab(`https://v.anxia.com/?pickcode=${pickcode}&cid=${cid}`);
    tab.onclose = () => GM_deleteValue(cid);
  };

  document.addEventListener("click", onclick, true);
})();

(function () {
  const playlistNode = document.querySelector("#js-video_list");
  if (!playlistNode) return;

  const favNode = document.querySelector("#js-play_slide_opt a[btn='fav']");
  const fullscreenNode = document.querySelector(".bar-side .btn-opt[rel='fullscreen']");

  const onkeyup = ({ code }) => {
    if (code === "KeyL") return favNode?.click();
    if (code === "KeyF") return fullscreenNode?.click();

    const currNode = playlistNode.querySelector("li.hover");
    if (code === "BracketRight") return currNode?.nextElementSibling?.querySelector("a").click();
    if (code === "BracketLeft") return currNode?.previousElementSibling?.querySelector("a").click();
  };

  document.addEventListener("keyup", onkeyup);

  const { searchParams } = new URL(location);
  const cid = searchParams.get("cid");
  if (!cid) return;

  const pickcode = searchParams.get("pickcode");
  const playlist = GM_getValue(cid);
  if (!pickcode || !playlist?.length || !playlist.some((it) => it.pc === pickcode)) return;

  const repList = (list, curr) => {
    playlistNode.innerHTML = list
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

  const obList = () => {
    const obs = new MutationObserver((mutations, observer) => {
      mutations.forEach(({ type }) => {
        if (type !== "childList") return;
        observer.disconnect();
        repList(playlist, pickcode);
      });
    });
    obs.observe(playlistNode, { childList: true, attributes: false, characterData: false });
  };

  playlistNode.querySelector("li") ? repList(playlist, pickcode) : obList();
})();
