// ==UserScript==
// @name            JavDB.offline115
// @namespace       JavDB.offline115@blc
// @version         0.0.2
// @author          blc
// @description     115 网盘离线
// @match           https://javdb.com/*
// @match           https://captchaapi.115.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Magnet.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Offline.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Verify115.lib.js
// @resource        pend https://github.com/bolin-dev/JavPack/raw/main/assets/pend.png
// @resource        warn https://github.com/bolin-dev/JavPack/raw/main/assets/warn.png
// @resource        error https://github.com/bolin-dev/JavPack/raw/main/assets/error.png
// @resource        success https://github.com/bolin-dev/JavPack/raw/main/assets/success.png
// @connect         jdbstatic.com
// @connect         aliyuncs.com
// @connect         javdb.com
// @connect         115.com
// @run-at          document-end
// @grant           GM_removeValueChangeListener
// @grant           GM_addValueChangeListener
// @grant           GM_getResourceURL
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_addElement
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           window.close
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_info
// @noframes
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

const defaultConfig = [
  {
    name: "云下载",
    color: "is-primary",
    inMagnets: true,
  },
  {
    name: "番号",
    dir: "番号/${prefix}",
    color: "is-link",
    inMagnets: true,
  },
  {
    name: "片商",
    dir: "片商/${maker}",
    inMagnets: true,
  },
  {
    name: "系列",
    dir: "系列/${series}",
    color: "is-success",
    inMagnets: true,
  },
  {
    name: "清单",
    dir: "清单/${list}",
    color: "is-danger is-light",
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
    exclude: ["♂"],
    color: "is-danger",
  },
];

const CONFIG = GM_getValue("config", defaultConfig);

const TARGET_CLASS = "x-offline";
const LOAD_CLASS = "is-loading";

const MATCH_API = "reMatch";
const MATCH_DELAY = 750;

const { HOST, STATUS_KEY, STATUS_VAL } = Verify115;
const { PENDING, VERIFIED, FAILED } = STATUS_VAL;

const transToByte = Magnet.useTransByte();

const getDetails = (dom = document) => {
  const infoNode = dom.querySelector(".movie-panel-info");
  if (!infoNode) return;

  const info = { cover: dom.querySelector(".video-cover")?.src ?? "" };
  const codeNode = infoNode.querySelector(".first-block .value");
  const prefix = codeNode.querySelector("a")?.textContent.trim();
  const code = codeNode.textContent.trim();
  info.codeFirstLetter = code[0].toUpperCase();
  if (prefix) info.prefix = prefix;

  const titleNode = dom.querySelector(".title.is-4");
  const label = titleNode.querySelector("strong").textContent;
  const origin = titleNode.querySelector(".origin-title");
  const current = titleNode.querySelector(".current-title");
  info.title = `${label}${(origin ?? current).textContent}`.replace(code, "").trim();

  infoNode.querySelectorAll(":scope > .panel-block").forEach((item) => {
    const label = item.querySelector("strong")?.textContent.trim();
    const value = item.querySelector(".value")?.textContent.trim();
    if (!label || !value || value.includes("N/A")) return;

    switch (label) {
      case "日期:":
        info.date = value;
        break;
      case "導演:":
        info.director = value;
        break;
      case "片商:":
        info.maker = value;
        break;
      case "發行:":
        info.publisher = value;
        break;
      case "系列:":
        info.series = value;
        break;
      case "類別:":
        info.genres = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        break;
      case "演員:":
        info.actors = value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
        break;
    }
  });

  if (info.date) {
    const [year, month, day] = info.date.split("-");
    info.year = year;
    info.month = month;
    info.day = day;
  }

  return { ...Util.codeParse(code), ...info };
};

const isUncensored = (dom = document) => {
  return dom.querySelector(".title.is-4").textContent.includes("無碼");
};

const renderAction = ({ color, index, idx, desc, name }) => {
  return `
  <button
    class="${TARGET_CLASS} button is-small x-un-hover ${color}"
    data-index="${index}"
    data-idx="${idx}"
    title="${desc}"
  >
    ${name}
  </button>
  `;
};

const findAction = ({ index, idx }, actions) => {
  return actions.find((act) => act.index === Number(index) && act.idx === Number(idx));
};

const parseMagnet = (node) => {
  const name = node.querySelector(".name")?.textContent.trim() ?? "";
  const meta = node.querySelector(".meta")?.textContent.trim() ?? "";
  return {
    url: node.querySelector(".magnet-name a")?.href?.split("&")[0].toLowerCase(),
    crack: !!node.querySelector(".tag.is-info") || Magnet.crackReg.test(name),
    zh: !!node.querySelector(".tag.is-warning") || Magnet.zhReg.test(name),
    size: transToByte(meta.split(",")[0]),
    meta,
    name,
  };
};

const getMagnets = (dom = document) => {
  return [...dom.querySelectorAll("#magnets-content > .item")].map(parseMagnet).toSorted(Magnet.magnetSort);
};

const checkCrack = (magnets, uncensored) => {
  return uncensored ? magnets.map((item) => ({ ...item, crack: false })) : magnets;
};

const offline = async ({ options, magnets, onstart, onprogress, onfinally }, currIdx = 0) => {
  onstart?.();
  const res = await Req115.handleOffline(options, magnets.slice(currIdx));
  if (res.status !== "warn") return onfinally?.(res);
  onprogress?.(res);

  if (GM_getValue(STATUS_KEY) !== PENDING) {
    Verify115.start();
    Grant.notify(res);
  }

  const listener = GM_addValueChangeListener(STATUS_KEY, (_name, _old_value, new_value) => {
    if (![VERIFIED, FAILED].includes(new_value)) return;
    GM_removeValueChangeListener(listener);
    if (new_value === FAILED) return onfinally?.();
    offline({ options, magnets, onstart, onprogress, onfinally }, res.currIdx);
  });
};

(function () {
  if (location.host === HOST) return Verify115.verify();

  const onChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.type !== "application/json") throw new Error("不支持文件类型");
      if (file.size > 3145728) throw new Error("文件大小限制 3 MB");

      const result = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
      });

      const config = JSON.parse(result);
      if (!Array.isArray(config)) throw new Error("书写格式错误");
      if (!config.length) throw new Error("配置为空");

      GM_setValue("config", config);
      Grant.notify({ icon: "success", msg: "导入成功，页面刷新后生效" });
    } catch (err) {
      Grant.notify({ icon: "warn", msg: err?.message });
    }
  };

  const attributes = { type: "file", accept: ".json", class: "is-hidden" };
  const inputFile = GM_addElement(document.body, "input", attributes);

  inputFile.addEventListener("change", onChange);
  document.addEventListener("keydown", (e) => e.altKey && e.code === "KeyU" && inputFile.click());
})();

(function () {
  const details = getDetails();
  if (!details) return;

  const actions = Offline.getActions(CONFIG, details);
  if (!actions.length) return;

  const UNC = isUncensored();

  const insertActions = (actions) => {
    document.querySelector(".movie-panel-info").insertAdjacentHTML(
      "beforeend",
      `<div class="panel-block"><div class="columns"><div class="column"><div class="buttons">
        ${actions.map(renderAction).join("")}
      </div></div></div></div>`,
    );

    const inMagnets = actions.filter((item) => Boolean(item.inMagnets));
    if (!inMagnets.length) return;

    const inMagnetsStr = inMagnets.map(renderAction).join("");
    const magnetsNode = document.querySelector("#magnets-content");

    const insert = (node) => node.querySelector(".buttons.column").insertAdjacentHTML("beforeend", inMagnetsStr);
    const insertMagnets = () => magnetsNode.querySelectorAll(".item.columns").forEach(insert);

    window.addEventListener("JavDB.magnet", insertMagnets);
    insertMagnets();
  };

  const onstart = (target) => {
    Util.setFavicon("pend");
    target.classList.add(LOAD_CLASS);
    document.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => item.setAttribute("disabled", ""));
  };

  const onfinally = (target, res) => {
    document.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => item.removeAttribute("disabled"));
    target.classList.remove(LOAD_CLASS);
    if (!res) return;

    Grant.notify(res);
    Util.setFavicon(res);
    setTimeout(() => unsafeWindow[MATCH_API]?.(), MATCH_DELAY);
  };

  const onclick = (e) => {
    const { target } = e;
    if (!target.classList.contains(TARGET_CLASS)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = findAction(target.dataset, actions);
    if (!action) return;

    const inMagnets = target.closest("#magnets-content > .item");
    const { magnetOptions, ...options } = Offline.getOptions(action, details);

    const magnets = inMagnets ? [parseMagnet(inMagnets)] : Offline.getMagnets(getMagnets(), magnetOptions);
    if (!magnets.length) return;

    offline({
      options,
      magnets: checkCrack(magnets, UNC),
      onstart: () => onstart(target),
      onprogress: Util.setFavicon,
      onfinally: (res) => onfinally(target, res),
    });
  };

  insertActions(actions);
  document.addEventListener("click", onclick);
})();

(function () {
  const COVER_SELECTOR = ".cover";
  const movieList = document.querySelectorAll(".movie-list .item");
  if (!movieList.length) return;

  const getParams = () => {
    const sectionName = document.querySelector(".section-name")?.textContent.trim() ?? "";
    const actorSectionName = document.querySelector(".actor-section-name")?.textContent.trim() ?? "";

    const getLastName = (txt) => txt.split(", ").at(-1).trim();

    const getOnTags = () => {
      const nodeList = document.querySelectorAll("#tags .tag_labels .tag.is-info");
      const genres = [...nodeList].map((item) => item.textContent.trim());
      return { genres };
    };

    const getOnActors = () => {
      const nodeList = document.querySelectorAll(".actor-tags.tags .tag.is-medium.is-link:not(.is-outlined)");
      const genres = [...nodeList].map((item) => item.textContent.trim());
      return { actors: [getLastName(actorSectionName)], genres };
    };

    const getOnSeries = () => {
      return { series: sectionName };
    };

    const getOnMakers = () => {
      return { maker: getLastName(sectionName) };
    };

    const getOnDirectors = () => {
      return { director: getLastName(sectionName) };
    };

    const getOnVideoCodes = () => {
      return { prefix: sectionName, codeFirstLetter: sectionName[0].toUpperCase() };
    };

    const getOnLists = () => {
      return { list: actorSectionName };
    };

    const getOnPublishers = () => {
      return { publisher: getLastName(sectionName) };
    };

    const getOnUsersList = () => {
      const list = document.querySelector(".title.is-4 .is-active a")?.textContent.trim() ?? "";
      return { list };
    };

    const { pathname: PATHNAME } = location;
    if (PATHNAME.startsWith("/tags")) return getOnTags();
    if (PATHNAME.startsWith("/actors")) return getOnActors();
    if (PATHNAME.startsWith("/series")) return getOnSeries();
    if (PATHNAME.startsWith("/makers")) return getOnMakers();
    if (PATHNAME.startsWith("/directors")) return getOnDirectors();
    if (PATHNAME.startsWith("/video_codes")) return getOnVideoCodes();
    if (PATHNAME.startsWith("/lists")) return getOnLists();
    if (PATHNAME.startsWith("/publishers")) return getOnPublishers();
    if (PATHNAME.startsWith("/users/list_detail")) return getOnUsersList();
    return {};
  };

  const params = getParams();
  const actions = Offline.getActions(CONFIG, params);
  if (!actions.length) return;

  const insertActions = (actions) => {
    const actionsStr = `<div class="px-2 pt-2 buttons">${actions.map(renderAction).join("")}</div>`;

    const insert = (node) => node.querySelector(COVER_SELECTOR)?.insertAdjacentHTML("beforeend", actionsStr);
    const insertList = (nodeList) => nodeList.forEach(insert);

    insertList(movieList);
    window.addEventListener("JavDB.scroll", ({ detail }) => insertList(detail));
  };

  const videoFocus = (target) => target.closest(COVER_SELECTOR)?.querySelector("video")?.focus();

  const onstart = (target) => {
    target.classList.add(LOAD_CLASS);
    target.parentElement.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => item.setAttribute("disabled", ""));
  };

  const onfinally = (target, res) => {
    target.parentElement.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => item.removeAttribute("disabled"));
    target.classList.remove(LOAD_CLASS);
    if (res) setTimeout(() => unsafeWindow[MATCH_API]?.(target), MATCH_DELAY);
  };

  const onclick = async (e) => {
    const { target } = e;
    if (!target.classList.contains(TARGET_CLASS)) return;

    e.preventDefault();
    e.stopPropagation();
    requestAnimationFrame(() => videoFocus(target));

    const action = findAction(target.dataset, actions);
    if (!action) return;
    onstart(target);

    try {
      const dom = await Req.request(target.closest("a").href);
      const details = getDetails(dom);
      if (!details) throw new Error("Not found details");

      const UNC = isUncensored(dom);
      const { magnetOptions, ...options } = Offline.getOptions(action, details);

      const magnets = Offline.getMagnets(getMagnets(dom), magnetOptions);
      if (!magnets.length) throw new Error("Not found magnets");

      offline({
        options,
        magnets: checkCrack(magnets, UNC),
        onfinally: (res) => onfinally(target, res),
      });
    } catch (err) {
      onfinally(target);
      Util.print(err?.message);
    }
  };

  insertActions(actions);
  document.addEventListener("click", onclick, true);
})();
