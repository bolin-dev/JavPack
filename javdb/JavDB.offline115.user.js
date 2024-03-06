// ==UserScript==
// @name            JavDB.offline115
// @namespace       JavDB.offline115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘离线
// @match           https://javdb.com/*
// @match           https://captchaapi.115.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Magnet.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Offline.lib.js
// @resource        pending https://github.com/bolin-dev/JavPack/raw/main/assets/icon.png
// @resource        success https://github.com/bolin-dev/JavPack/raw/main/assets/success.png
// @resource        error https://github.com/bolin-dev/JavPack/raw/main/assets/error.png
// @resource        warn https://github.com/bolin-dev/JavPack/raw/main/assets/warn.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         jdbstatic.com
// @connect         aliyuncs.com
// @connect         115.com
// @connect         self
// @run-at          document-end
// @grant           GM_removeValueChangeListener
// @grant           GM_addValueChangeListener
// @grant           GM_getResourceURL
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           window.close
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_addStyle
// @grant           GM_info
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

const ACTIONS_CLASS = "x-offline";
const { pathname: PATHNAME } = location;
const IS_DETAIL = PATHNAME.startsWith("/v/");

const config = [
  {
    name: "云下载",
    color: "is-primary",
  },
  {
    name: "番号",
    dir: "番号/${prefix}",
    color: "is-link",
  },
  {
    name: "片商",
    dir: "片商/${maker}",
  },
  {
    name: "系列",
    dir: "系列/${series}",
    color: "is-success",
  },
  {
    type: "genres",
    name: "${genre}",
    dir: "类别/${genre}",
    match: ["屁股", "連褲襪", "巨乳", "亂倫"],
    color: "is-warning",
  },
  {
    type: "actors",
    name: "${actor}",
    dir: "演员/${actor}",
    color: "is-danger",
  },
];

const transToByte = Magnet.useTransByte();

function createActions(actions) {
  return `
  <div class="${ACTIONS_CLASS} buttons are-small">
  ${actions
    .map(({ color, index, idx, desc, name }) => {
      return `
      <button class="button ${color}" data-index="${index}" data-idx="${idx}" title="${desc}">
        ${name}
      </button>
      `;
    })
    .join("")}
  </div>
  `;
}

function checkAction(e, actions) {
  const { target } = e;
  if (target.tagName !== "BUTTON") return;

  const container = target.closest(`.${ACTIONS_CLASS}`);
  if (!container) return;

  e.preventDefault();
  e.stopPropagation();

  const { index, idx } = target.dataset;
  const action = actions.find((item) => item.index === Number(index) && item.idx === Number(idx));
  if (!action) return;

  return { action, target, container };
}

function actionStart({ target, container }) {
  target.classList.add("is-loading");
  container.querySelectorAll("button").forEach((item) => {
    item.disabled = true;
  });
}

function actionOver({ target, container }) {
  target.classList.remove("is-loading");
  container.querySelectorAll("button").forEach((item) => {
    item.disabled = false;
  });
}

function getDetails(dom = document) {
  const infoNode = dom.querySelector(".movie-panel-info");
  if (!infoNode) return;

  const codeNode = infoNode.querySelector(".first-block .value");
  const prefix = codeNode.querySelector("a")?.textContent;
  const code = codeNode.textContent;

  const titleNode = dom.querySelector(".title.is-4");
  let title = titleNode.querySelector("strong").textContent;
  title += (titleNode.querySelector(".origin-title") ?? titleNode.querySelector(".current-title")).textContent;
  title = title.replace(code, "").trim();

  let cover = dom.querySelector(".video-cover")?.src;
  if (!cover) cover = dom.querySelector(".column-video-cover video")?.poster;

  const info = {};
  infoNode.querySelectorAll(".movie-panel-info > .panel-block").forEach((item) => {
    const label = item.querySelector("strong")?.textContent;
    const value = item.querySelector(".value")?.textContent;
    if (!label || !value || value.includes("N/A")) return;

    if (label === "日期:") {
      info.date = value;
      return;
    }
    if (label === "導演:") {
      info.director = value;
      return;
    }
    if (label === "片商:") {
      info.maker = value;
      return;
    }
    if (label === "發行:") {
      info.publisher = value;
      return;
    }
    if (label === "系列:") {
      info.series = value;
      return;
    }
    if (label === "類別:") {
      info.genres = value.split(",").map((item) => item.trim());
      return;
    }
    if (label !== "演員:") return;
    info.actors = value
      .split("\n")
      .map((item) => item.replace(/♀|♂/, "").trim())
      .filter(Boolean);
  });

  if (prefix) info.prefix = prefix;
  if (cover) info.cover = cover;

  const { regex } = Util.codeParse(code);
  return { code, title, regex, ...info };
}

function getMagnets(dom = document) {
  const isUncensored = dom.querySelector(".title.is-4").textContent.includes("無碼");

  return [...dom.querySelectorAll("#magnets-content > .item")]
    .map((item) => {
      const name = item.querySelector(".name")?.textContent.trim() ?? "";
      const meta = item.querySelector(".meta")?.textContent.trim() ?? "";
      return {
        url: item.querySelector(".magnet-name a").href.split("&")[0].toLowerCase(),
        zh: !!item.querySelector(".tag.is-warning") || Magnet.zhReg.test(name),
        size: transToByte(meta.split(",")[0]),
        crack: !isUncensored && Magnet.crackReg.test(name),
        meta,
        name,
      };
    })
    .toSorted(Magnet.magnetSort);
}

async function handleClick(e, actions, currIdx = 0) {
  const checkRes = checkAction(e, actions);
  if (!checkRes) return;

  actionStart(checkRes);
  const { target } = checkRes;

  let dom = document;
  if (!IS_DETAIL) {
    dom = await Req.request(target.closest("a").href);
    if (!dom) return actionOver(checkRes);
  }

  const details = getDetails(dom);
  if (!details) return actionOver(checkRes);

  const { magnetOptions, ...options } = Offline.parseAction(checkRes.action, details);
  const magnets = Offline.parseMagnets(getMagnets(dom), magnetOptions, currIdx);
  if (!magnets.length) return actionOver(checkRes);

  if (IS_DETAIL) Util.setTabBar({ icon: "pending" });
  const { state: icon, msg: text, currIdx: nextIdx } = await Req115.handleSmartOffline(options, magnets);

  if (icon === "warn") {
    if (GM_getValue("VERIFY_STATUS") !== "PENDING") {
      GM_setValue("VERIFY_STATUS", "PENDING");

      Grant.notify({ text, icon });
      if (IS_DETAIL) Util.setTabBar({ icon });
      Grant.openTab(`https://captchaapi.115.com/?ac=security_code&type=web&cb=Close911_${new Date().getTime()}`);
    }

    // eslint-disable-next-line max-params
    const listener = GM_addValueChangeListener("VERIFY_STATUS", (name, old_value, new_value, remote) => {
      if (!remote || new_value !== "VERIFIED") return;
      GM_removeValueChangeListener(listener);
      handleClick(e, actions, nextIdx);
    });

    return;
  }

  if (IS_DETAIL) {
    Util.setTabBar({ icon });
    Grant.notify({ text, icon });
    unsafeWindow["match115.matchCode"]?.();
  } else {
    unsafeWindow["match115.refreshPrefix"]?.(target);
  }

  actionOver(checkRes);
}

(function () {
  const TARGET_SELECTOR = ".movie-list .item";
  const childList = document.querySelectorAll(TARGET_SELECTOR);
  if (!childList.length) return;

  function getParams() {
    if (PATHNAME.startsWith("/tags")) {
      const tagNodeList = document.querySelectorAll("#tags .tag-category:not(.collapse)");
      const genreNodeList = [...tagNodeList].filter((item) => item.id.split("-").at(-1) < 8);
      if (!genreNodeList.length) return { genres: [] };

      const genres = [...genreNodeList].map((item) => {
        return [...item.querySelectorAll(".tag_labels .tag.is-info")].map((item) => item.textContent.trim());
      });
      return { genres: genres.flat() };
    }

    const getLastName = (txt) => txt.split(", ").at(-1).trim();
    const actorSectionName = document.querySelector(".actor-section-name")?.textContent ?? "";
    const sectionName = document.querySelector(".section-name")?.textContent ?? "";

    if (PATHNAME.startsWith("/actors")) return { actors: [getLastName(actorSectionName)] };
    if (PATHNAME.startsWith("/series")) return { series: getLastName(sectionName) };
    if (PATHNAME.startsWith("/makers")) return { maker: getLastName(sectionName) };
    if (PATHNAME.startsWith("/directors")) return { director: getLastName(sectionName) };
    if (PATHNAME.startsWith("/video_codes")) return { prefix: getLastName(sectionName) };
    if (PATHNAME.startsWith("/lists")) return { list: getLastName(actorSectionName) };
    if (PATHNAME.startsWith("/publishers")) return { publisher: getLastName(sectionName) };
    return {};
  }

  function useActions(actions) {
    GM_addStyle(`
    #{TARGET_SELECTOR} .cover .${ACTIONS_CLASS} {
      position: absolute;
      right: 0;
      left: 0;
      z-index: 2;
      padding: 0.5rem 0.5rem 0;

      & .button[disabled] {
        opacity: .8;
      }
    }
    `);

    const insertHTML = createActions(actions);

    return (nodeList) => {
      nodeList.forEach((item) => {
        if (!item.querySelector(".tags.has-addons")) return;
        item.querySelector(".cover").insertAdjacentHTML("beforeend", insertHTML);
      });
    };
  }

  const params = getParams();
  const actions = Offline.getActions(config, params);
  if (!actions.length) return;

  const insertActions = useActions(actions);
  insertActions(childList);
  window.addEventListener("scroll.loadmore", ({ detail }) => insertActions(detail));
  document.addEventListener("click", (e) => handleClick(e, actions), true);
})();
