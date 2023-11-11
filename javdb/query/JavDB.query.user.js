// ==UserScript==
// @name            JavDB.query
// @namespace       JavDB.query@blc
// @version         0.0.1
// @author          blc
// @description     网盘查询
// @include         /^https:\/\/javdb\d*\.com\/v\/\w+/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/drive/JavPack.drive.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_openInTab
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const info = document.querySelector(".movie-panel-info");
  const code = info.querySelector(".first-block .value").textContent;
  if (!code) return;

  const insertHTML =
    '<div class="panel-block"><strong>资源:</strong>&nbsp;<span class="value" id="x-query">查询中...</span></div>';

  const offline = info.querySelector("#x-offline");
  if (offline) {
    offline.insertAdjacentHTML("beforebegin", insertHTML);
  } else {
    info.insertAdjacentHTML("beforeend", insertHTML);
  }

  const query = info.querySelector("#x-query");
  query.addEventListener("contextmenu", e => {
    const { cid } = e.target.dataset;
    if (!cid) return;

    e.preventDefault();
    e.stopPropagation();

    GM_openInTab(`https://115.com/?cid=${cid}`, { active: true, setParent: true });
  });

  const parseRes = res => {
    if (!res?.state) {
      query.textContent = "查询失败";
      return;
    }

    const { regex } = codeParse(code);
    res = res.data.filter(item => regex.test(item.n));
    if (!res.length) {
      query.textContent = "暂无资源";
      return;
    }

    query.innerHTML = res
      .map(
        ({ pc, cid, t, n }) =>
          `<a href="https://v.anxia.com/?pickcode=${pc}" data-cid="${cid}" title="[${t}] ${n}" target="_blank">${n}</a>`
      )
      .join("");
  };
  filesSearch(code).then(parseRes);

  GM_addStyle(
    "#x-query a{display:-webkit-box;overflow:hidden;white-space:unset;text-overflow:ellipsis;-webkit-line-clamp:1;-webkit-box-orient:vertical;word-break:break-all}"
  );
})();
