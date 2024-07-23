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
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Offline.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @resource        pend https://github.com/bolin-dev/JavPack/raw/main/assets/icon.png
// @resource        warn https://github.com/bolin-dev/JavPack/raw/main/assets/warn.png
// @resource        error https://github.com/bolin-dev/JavPack/raw/main/assets/error.png
// @resource        success https://github.com/bolin-dev/JavPack/raw/main/assets/success.png
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
// @grant           GM_info
// ==/UserScript==

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

const TARGET_CLASS = "x-offline";
const { host: HOST, pathname: PATHNAME } = location;
const IS_DETAIL = PATHNAME.startsWith("/v/");

const VERIFY_HOST = "captchaapi.115.com";
const VERIFY_URL = `https://${VERIFY_HOST}/?ac=security_code&type=web&cb=Close911`;
const VERIFY_KEY = "VERIFY_STATUS";
const VERIFY_PENDING = "PENDING";
const VERIFY_VERIFIED = "VERIFIED";
const VERIFY_FAILED = "FAILED";

const getDetails = (dom = document) => {
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
        info.genres = value.split(",").map((item) => item.trim());
        break;
      case "演員:":
        info.actors = value
          .split("\n")
          .map((item) => item.replace(/♀|♂/, "").trim())
          .filter(Boolean);
        break;
    }
  });

  if (prefix) info.prefix = prefix;
  if (cover) info.cover = cover;

  const { codes, regex } = Util.codeParse(code);
  return { codes, regex, code, title, ...info };
};

const createAction = ({ color, index, idx, desc, name }) => {
  return `
  <button
    class="${TARGET_CLASS} button is-small ${color}"
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

const transToByte = Magnet.useTransByte();

const parseMagnet = (node) => {
  const name = node.querySelector(".name")?.textContent.trim() ?? "";
  const meta = node.querySelector(".meta")?.textContent.trim() ?? "";
  return {
    url: node.querySelector(".magnet-name a").href.split("&")[0].toLowerCase(),
    zh: !!node.querySelector(".tag.is-warning") || Magnet.zhReg.test(name),
    size: transToByte(meta.split(",")[0]),
    crack: Magnet.crackReg.test(name),
    meta,
    name,
  };
};

const getMagnets = (dom = document) => {
  return [...dom.querySelectorAll("#magnets-content > .item")].map(parseMagnet).toSorted(Magnet.magnetSort);
};

const closeVerify = () => {
  if (GM_getValue(VERIFY_KEY) !== VERIFY_VERIFIED) GM_setValue(VERIFY_KEY, VERIFY_FAILED);
};

const openVerify = () => {
  GM_setValue(VERIFY_KEY, VERIFY_PENDING);
  const verifyTab = Grant.openTab(`${VERIFY_URL}_${new Date().getTime()}`);
  verifyTab.onclose = closeVerify;
};

const offline = async ({ options, magnets, onstart, onprogress, onfinally }, currIdx = 0) => {
  onstart?.();
  const res = await Req115.handleSmartOffline(options, magnets.slice(currIdx));

  if (res.status !== "warn") return onfinally?.(res);
  onprogress?.(res);

  if (GM_getValue(VERIFY_KEY) !== VERIFY_PENDING) {
    Grant.notify(res);
    openVerify();
  }

  const listener = GM_addValueChangeListener(VERIFY_KEY, (_name, _old_value, new_value) => {
    if (![VERIFY_FAILED, VERIFY_VERIFIED].includes(new_value)) return;
    GM_removeValueChangeListener(listener);
    if (new_value === VERIFY_FAILED) return onfinally?.();
    offline({ options, magnets, onstart, onprogress, onfinally }, res.currIdx);
  });
};

(function () {
  if (HOST === VERIFY_HOST) Offline.verifyAccount(VERIFY_KEY, VERIFY_VERIFIED);
})();

(function () {
  if (!IS_DETAIL) return;

  const details = getDetails();
  if (!details) return;

  const actions = Offline.getActions(config, details);
  if (!actions.length) return;

  const insertActions = (actions) => {
    document.querySelector(".movie-panel-info").insertAdjacentHTML(
      "beforeend",
      `<div class="panel-block">
        <div class="columns">
          <div class="column">
            <div class="buttons">
              ${actions.map(createAction).join("")}
            </div>
          </div>
        </div>
      </div>`,
    );

    const inMagnets = actions.find(({ inMagnets }) => Boolean(inMagnets));
    if (!inMagnets) return;

    const inMagnetsTxt = createAction(inMagnets);
    const magnetsNode = document.querySelector("#magnets-content");

    const insert = (node) => node.querySelector(".buttons.column").insertAdjacentHTML("beforeend", inMagnetsTxt);
    const insertMagnets = () => magnetsNode.querySelectorAll(".item.columns").forEach(insert);
    insertMagnets();

    const callback = (mutations) => mutations.forEach(({ type }) => type === "childList" && insertMagnets());
    const observer = new MutationObserver(callback);
    observer.observe(magnetsNode, { childList: true, attributes: false, characterData: false });
  };

  const findMagnets = (target, options) => {
    if (!target.closest("#magnets-content")) return Offline.getMagnets(getMagnets(), options);
    return [parseMagnet(target.closest(".item.columns"))];
  };

  const onstart = (target) => {
    Util.setFavicon("pend");
    target.classList.add("is-loading");

    document.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => {
      item.disabled = true;
    });
  };

  const onprogress = (res) => Util.setFavicon(res.status);

  const onfinally = (res) => {
    document.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => {
      item.disabled = false;
      item.classList.remove("is-loading");
    });

    if (!res) return;
    Grant.notify(res);
    Util.setFavicon(res.status);
    Req115.sleep(0.5).then(() => unsafeWindow["reMatch"]?.());
  };

  const onclick = (e) => {
    const target = e.target.closest(`.${TARGET_CLASS}`);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const action = findAction(target.dataset, actions);
    if (!action) return;

    const { magnetOptions, ...options } = Offline.getOptions(action, details);
    const magnets = findMagnets(target, magnetOptions);
    if (!magnets.length) return;

    offline({
      options,
      magnets,
      onstart: () => onstart(target),
      onprogress,
      onfinally,
    });
  };

  insertActions(actions);
  document.addEventListener("click", onclick);
})();

(function () {
  if (IS_DETAIL) return;

  const MOVIE_SELECTOR = ".movie-list .item";
  const movieNodeList = document.querySelectorAll(MOVIE_SELECTOR);
  if (!movieNodeList.length) return;

  const getParams = () => {
    if (PATHNAME.startsWith("/tags")) {
      const categoryNodeList = document.querySelectorAll("#tags .tag-category");
      const genreNodeList = [...categoryNodeList].filter((item) => Number(item.dataset.cid) !== 10);
      const genres = [...genreNodeList].map((item) => {
        return [...item.querySelectorAll(".tag_labels .tag.is-info")].map((it) => it.textContent.trim());
      });
      return { genres: genres.flat() };
    }

    const getLastName = (txt) => txt.split(", ").at(-1).trim();
    const actorSectionName = document.querySelector(".actor-section-name")?.textContent ?? "";
    const sectionName = document.querySelector(".section-name")?.textContent ?? "";

    if (PATHNAME.startsWith("/actors")) return { actors: [getLastName(actorSectionName)] };
    if (PATHNAME.startsWith("/series")) return { series: sectionName };
    if (PATHNAME.startsWith("/makers")) return { maker: getLastName(sectionName) };
    if (PATHNAME.startsWith("/directors")) return { director: getLastName(sectionName) };
    if (PATHNAME.startsWith("/video_codes")) return { prefix: sectionName };
    if (PATHNAME.startsWith("/lists")) return { list: actorSectionName };
    if (PATHNAME.startsWith("/publishers")) return { publisher: getLastName(sectionName) };
    return {};
  };

  const params = getParams();
  const actions = Offline.getActions(config, params);
  if (!actions.length) return;

  const insertActions = (actions) => {
    const actionsTxt = `
    <div class="px-2 pt-2 buttons" style="position:absolute;z-index:2">
      ${actions.map(createAction).join("")}
    </div>
    `;

    const insert = (node) => node.querySelector(".cover").insertAdjacentHTML("beforeend", actionsTxt);
    const insertList = (nodeList) => nodeList.forEach(insert);

    insertList(movieNodeList);
    window.addEventListener("JavDB.scroll", ({ detail }) => insertList(detail));
  };

  const onstart = (target) => {
    target.classList.add("is-loading");

    target
      .closest(MOVIE_SELECTOR)
      .querySelectorAll(`.${TARGET_CLASS}`)
      .forEach((item) => {
        item.disabled = true;
      });
  };

  const onfinally = (target, res) => {
    target
      .closest(MOVIE_SELECTOR)
      .querySelectorAll(`.${TARGET_CLASS}`)
      .forEach((item) => {
        item.disabled = false;
        item.classList.remove("is-loading");
      });

    if (res) Req115.sleep(0.5).then(() => unsafeWindow["reMatch"]?.(target));
  };

  const onclick = async (e) => {
    const target = e.target.closest(`.${TARGET_CLASS}`);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const action = findAction(target.dataset, actions);
    if (!action) return;
    onstart(target);

    try {
      const dom = await Req.request(target.closest("a").href);
      const details = getDetails(dom);
      if (!details) return onfinally(target);

      const { magnetOptions, ...options } = Offline.getOptions(action, details);
      const magnets = Offline.getMagnets(getMagnets(dom), magnetOptions);
      if (!magnets.length) return onfinally(target);

      offline({
        options,
        magnets,
        onfinally: (res) => onfinally(target, res),
      });
    } catch (_) {
      return onfinally(target);
    }
  };

  insertActions(actions);
  document.addEventListener("click", onclick);
})();
