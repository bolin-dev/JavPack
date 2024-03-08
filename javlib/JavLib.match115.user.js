// ==UserScript==
// @name            JavLib.match115
// @namespace       JavLib.match115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘匹配
// @match           https://www.javlibrary.com/*
// @icon            https://www.javlibrary.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_openInTab
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const { searchParams } = new URL(location);
  if (!searchParams.get("v")) return;

  const infoNode = document.querySelector("#video_info");
  if (!infoNode) return;

  const TARGET_ID = "video_res";
  const TARGET_CLASS = "x-match-item";
  const VOID = "javascript:void(0);";

  const ACTION_MAP = {
    click: {
      key: "pc",
      url: "https://v.anxia.com/?pickcode=%s",
    },
    contextmenu: {
      key: "cid",
      url: "https://115.com/?cid=%s&offset=0&tab=&mode=wangpan",
    },
  };

  const handleClick = (e) => {
    const { target } = e;
    if (!target.classList.contains(TARGET_CLASS)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = ACTION_MAP[e.type];
    if (!action) return;

    const val = target.dataset[action.key];
    if (val) Grant.openTab(action.url.replaceAll("%s", val));
  };

  GM_addStyle(`
  #${TARGET_ID} a {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: unset;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  `);

  infoNode.insertAdjacentHTML(
    "beforeend",
    `<div id="${TARGET_ID}" class="item">
      <table>
        <tbody>
          <tr>
            <td class="header">资源:</td>
            <td class="text">查询中...</td>
            <td class="icon"></td>
          </tr>
        </tbody>
      </table>
    </div>`,
  );

  const queryNode = infoNode.querySelector(`#${TARGET_ID} .text`);
  const code = infoNode.querySelector("#video_id .text").textContent;
  const { codes, regex } = Util.codeParse(code);

  document.addEventListener("click", handleClick);
  document.addEventListener("contextmenu", handleClick);

  Req115.videosSearch(codes.join(" ")).then(({ state, data }) => {
    if (!state) {
      queryNode.innerHTML = "查询失败，检查登录状态";
      return;
    }

    data = data.filter((item) => regex.test(item.n));

    if (!data.length) {
      queryNode.innerHTML = "暂无资源";
      return;
    }

    queryNode.innerHTML = data
      .map(
        ({ pc, cid, t, n }) =>
          `<a href="${VOID}" class="${TARGET_CLASS}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`,
      )
      .join("");
  });
})();
