// ==UserScript==
// @name            JavLib.match115
// @namespace       JavLib.match115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘匹配
// @match           https://www.javlibrary.com/*
// @icon            https://www.javlibrary.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util115.lib.js
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

  const SELECTOR = "x-match-item";
  const VOID = "javascript:void(0);";

  const handleClick = () => {
    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains(SELECTOR)) return;

      e.preventDefault();
      e.stopPropagation();

      const { pc } = e.target.dataset;
      if (pc) Util.openTab(`https://v.anxia.com/?pickcode=${pc}`);
    });

    document.addEventListener("contextmenu", (e) => {
      if (!e.target.classList.contains(SELECTOR)) return;

      e.preventDefault();
      e.stopPropagation();

      const { cid } = e.target.dataset;
      if (cid) Util.openTab(`https://115.com/?cid=${cid}&offset=0&tab=&mode=wangpan`);
    });
  };

  handleClick();

  GM_addStyle(
    "#x-query a{display:-webkit-box;overflow:hidden;white-space:unset;text-overflow:ellipsis;-webkit-line-clamp:1;-webkit-box-orient:vertical;word-break:break-all}",
  );

  const infoNode = document.querySelector("#video_info");

  infoNode.insertAdjacentHTML(
    "beforeend",
    `<div id="video_res" class="item">
      <table>
        <tbody>
          <tr>
            <td class="header">资源:</td>
            <td id="x-query" class="text">查询中...</td>
            <td class="icon"></td>
          </tr>
        </tbody>
      </table>
    </div>`,
  );

  const queryNode = infoNode.querySelector("#x-query");
  const code = infoNode.querySelector("#video_id .text").textContent;
  const { codes, regex } = Util.codeParse(code);

  Util115.videosSearch(codes.join(" ")).then(({ state, data }) => {
    if (!state) {
      queryNode.textContent = "查询失败";
      return;
    }

    data = data.filter((item) => regex.test(item.n));

    if (!data.length) {
      queryNode.textContent = "暂无资源";
      return;
    }

    queryNode.innerHTML = data
      .map(
        ({ pc, cid, t, n }) =>
          `<a href="${VOID}" class="${SELECTOR}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`,
      )
      .join("");
  });
})();
