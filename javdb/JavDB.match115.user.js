// ==UserScript==
// @name            JavDB.match115
// @namespace       JavDB.match115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘匹配
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Magnet.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @connect         115.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           GM_addStyle
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

Util.upStore();

const TARGET_CLASS = "x-match";
const VOID = "javascript:void(0);";
const CHANNEL = new BroadcastChannel("JavDB.match115");

const { pathname: PATHNAME } = location;
const IS_DETAIL = PATHNAME.startsWith("/v/");

const listenClick = (onclose) => {
  const actions = {
    click: {
      key: "pc",
      url: "https://v.anxia.com/?pickcode=%s",
    },
    contextmenu: {
      key: "cid",
      url: "https://115.com/?cid=%s&offset=0&tab=&mode=wangpan",
    },
  };

  const onclick = (e) => {
    const target = e.target.closest(`.${TARGET_CLASS}`);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actions[e.type];
    if (!action) return;

    const val = target.dataset[action.key];
    if (!val) return;

    const tab = Grant.openTab(action.url.replaceAll("%s", val));
    tab.onclose = () => Req115.sleep(0.5).then(() => onclose(target));
  };

  document.addEventListener("click", onclick);
  document.addEventListener("contextmenu", onclick);
};

(function () {
  if (!IS_DETAIL) return;
  const MID = PATHNAME.split("/").pop();

  const code = document.querySelector(".first-block .value").textContent;
  if (!code) return;

  const { codes, regex } = Util.codeParse(code);
  const ORIGIN_TXT = "115资源";
  const LOAD_TXT = "资源匹配";

  const insertMatch = () => {
    GM_addStyle(`
    .${TARGET_CLASS} {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: unset;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    `);

    const matchTxt = `
    <div class="panel-block">
      <strong><a href="${VOID}">${ORIGIN_TXT}</a>:</strong>&nbsp;
      <span class="value">匹配中...</span>
    </div>
    `;

    const positionNode = document.querySelector(".movie-panel-info > .review-buttons + .panel-block");
    positionNode.insertAdjacentHTML("afterend", matchTxt);
    const matchNode = positionNode.nextElementSibling;

    return {
      labelNode: matchNode.querySelector("a"),
      contentNode: matchNode.querySelector(".value"),
    };
  };

  const { labelNode, contentNode } = insertMatch();

  const create = ({ pc, cid, t, n }) => {
    return `<a href="${VOID}" class="${TARGET_CLASS}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`;
  };

  const onload = ({ state, data }) => {
    if (!state) {
      contentNode.innerHTML = "查询失败，检查登录状态";
      return;
    }

    data = data.filter((item) => regex.test(item.n)).map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
    GM_setValue(code, data);

    if (!data.length) {
      contentNode.innerHTML = "暂无资源";
      return;
    }

    contentNode.innerHTML = data.map(create).join("");
  };

  const onfinally = () => {
    labelNode.textContent = ORIGIN_TXT;
  };

  const matchCode = () => {
    if (labelNode.textContent === LOAD_TXT) return;
    labelNode.textContent = LOAD_TXT;

    Req115.videosSearch(codes.join(" ")).then(onload).finally(onfinally);
  };

  matchCode();
  listenClick(matchCode);
  unsafeWindow["reMatch"] = matchCode;
  labelNode.addEventListener("click", matchCode);
  window.addEventListener("beforeunload", () => CHANNEL.postMessage(MID));
})();
