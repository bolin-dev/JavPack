// ==UserScript==
// @name            JavDB.match115
// @namespace       JavDB.match115@blc
// @version         0.0.2
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
// @grant           GM_deleteValues
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_info
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

Util.upStore();

const TARGET_TXT = "匹配中";
const TARGET_CLASS = "x-match";

const VOID = "javascript:void(0);";
const CHANNEL = new BroadcastChannel(GM_info.script.name);
const MATCH_API = "reMatch";

const listenClick = (onclose, defaultAction) => {
  const actions = {
    click: {
      val: "pc",
      url: "https://115vod.com/?pickcode=%s",
    },
    contextmenu: {
      val: "cid",
      url: "https://115.com/?cid=%s&mode=wangpan",
    },
  };

  const timer = {};
  const getHref = (node) => node.closest(`a:not(.${TARGET_CLASS})`)?.href;
  const getTimerKey = location.pathname.startsWith("/v/") ? () => location.href : getHref;

  const debounce = (target) => {
    const key = getTimerKey(target);
    if (!key) return;

    if (timer[key]) clearTimeout(timer[key]);

    timer[key] = setTimeout(() => {
      onclose?.(target);
      delete timer[key];
    }, 750);
  };

  const onclick = (e) => {
    const { target, type } = e;
    if (!target.classList.contains(TARGET_CLASS)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actions[type];
    if (!action) return;

    const val = target.dataset[action.val];
    if (!val) return defaultAction?.(e);

    const tab = Grant.openTab(action.url.replaceAll("%s", val));
    tab.onclose = () => debounce(target);
  };

  document.addEventListener("click", onclick);
  document.addEventListener("contextmenu", onclick);
};

const formatBytes = (bytes, k = 1024) => {
  if (bytes < k) return "0KB";
  const units = ["KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)) - 1, units.length - 1);
  const size = (bytes / Math.pow(k, i + 1)).toFixed(2);
  return `${size}${units[i]}`;
};

const extractData = (data, keys = ["pc", "cid", "n", "s", "t"], format = "s") => {
  return data.map((item) => ({ ...JSON.parse(JSON.stringify(item, keys)), [format]: formatBytes(item[format]) }));
};

const formatTip = ({ n, s, t }) => `${n} - ${s} / ${t}`;

(function () {
  const CONT = document.querySelector(".movie-panel-info");
  if (!CONT) return;

  const render = ({ pc, cid, ...data }) => {
    return `
    <a
      href="${VOID}"
      class="${TARGET_CLASS}"
      title="${formatTip(data)}"
      data-pc="${pc}"
      data-cid="${cid}"
    >
      ${data.n}
    </a>
    `;
  };

  const matchCode = async ({ code, codes, regex }, { load, cont }) => {
    const UUID = crypto.randomUUID();
    load.dataset.uid = UUID;

    try {
      const { data = [] } = await Req115.filesSearchAllVideos(codes.join(" "));
      if (load.dataset.uid !== UUID) return;

      const sources = extractData(data.filter((it) => regex.test(it.n)));
      cont.innerHTML = sources.map(render).join("") || "暂无匹配";
      GM_setValue(code, sources);
    } catch (err) {
      if (load.dataset.uid !== UUID) return;
      cont.innerHTML = "匹配失败";
      Util.print(err?.message);
    }

    load.textContent = "115";
  };

  const addBlock = () => {
    const load = `${TARGET_CLASS}-load`;
    const cont = `${TARGET_CLASS}-cont`;

    CONT.querySelector(".review-buttons + .panel-block").insertAdjacentHTML(
      "afterend",
      `<div class="panel-block">
        <strong><a href="${VOID}" class="${load}">${TARGET_TXT}</a>:</strong>
        &nbsp;<span class="value ${cont}">...</span>
      </div>`,
    );

    return {
      load: CONT.querySelector(`.${load}`),
      cont: CONT.querySelector(`.${cont}`),
    };
  };

  const code = CONT.querySelector(".first-block .value").textContent.trim();
  const codeDetails = Util.codeParse(code);
  const block = addBlock();
  const matcher = () => matchCode(codeDetails, block);

  matcher();
  listenClick(matcher);
  unsafeWindow[MATCH_API] = matcher;

  const refresh = ({ target }) => {
    if (target.textContent === TARGET_TXT) return;
    target.textContent = TARGET_TXT;
    matcher();
  };

  block.load.addEventListener("click", refresh);
  window.addEventListener("beforeunload", () => CHANNEL.postMessage(code));
})();

(function () {
  const MOVIE_SELECTOR = ".movie-list .item";
  const CODE_SELECTORS = [".video-title", "strong"];
  const CODE_SELECTOR = CODE_SELECTORS.join(" ");
  const TARGET_HTML = `<a href="${VOID}" class="tag is-normal ${TARGET_CLASS}">${TARGET_TXT}</a>`;

  const movieList = document.querySelectorAll(MOVIE_SELECTOR);
  if (!movieList.length) return;

  const parseCodeCls = (code) => ["x", ...code.split(/\s|\.|-|_/)].filter(Boolean).join("-");

  const matchAfter = ({ code, regex, target }, data) => {
    target.closest(MOVIE_SELECTOR).classList.add(parseCodeCls(code));
    const sources = data.filter((it) => regex.test(it.n));
    const len = sources.length;

    let pc = "";
    let cid = "";
    let title = "鼠标左键缓存刷新，右键接口刷新";
    let className = "is-normal";
    let textContent = "未匹配";

    if (len) {
      const zhs = sources.filter((it) => Magnet.zhReg.test(it.n));
      const crack = sources.find((it) => Magnet.crackReg.test(it.n));

      const zh = zhs[0];
      const both = zhs.find((it) => Magnet.crackReg.test(it.n));
      const active = both ?? zh ?? crack ?? sources[0];

      pc = active.pc;
      cid = active.cid;
      title = sources.map(formatTip).join("\n\n");
      className = both ? "is-danger" : zh ? "is-warning" : crack ? "is-info" : "is-success";
      textContent = "已匹配";
      if (len > 1) textContent += ` ${len}`;
    }

    const node = target.querySelector(`.${TARGET_CLASS}`);
    node.title = title;
    node.className = `tag ${className} ${TARGET_CLASS}`;
    node.dataset.pc = pc;
    node.dataset.cid = cid;
    node.textContent = textContent;
  };

  const matchBefore = (node) => {
    if (node.classList.contains("is-hidden")) return;

    const target = node.querySelector(CODE_SELECTORS[0]);
    if (!target) return;

    const code = target.querySelector(CODE_SELECTORS[1])?.textContent.trim();
    if (!code) return;

    if (!target.querySelector(`.${TARGET_CLASS}`)) target.insertAdjacentHTML("afterbegin", TARGET_HTML);
    return { ...Util.codeParse(code), target };
  };

  const useMatchQueue = (before, after) => {
    const wait = {};
    const queue = [];
    let loading = false;

    const over = (pre, data = []) => {
      wait[pre].forEach((it) => after?.(it, data));
      delete wait[pre];
    };

    const match = async () => {
      if (loading || !queue.length) return;
      const prefix = queue[0];
      loading = true;

      try {
        const { data = [] } = await Req115.filesSearchAllVideos(prefix);
        const sources = extractData(data);
        GM_setValue(prefix, sources);
        over(prefix, sources);
      } catch (err) {
        over(prefix);
        Util.print(err?.message);
      }

      loading = false;
      queue.shift();
      match();
    };

    const dispatch = (node) => {
      const details = before?.(node);
      if (!details) return;

      const { code, prefix } = details;
      const cache = GM_getValue(code) ?? GM_getValue(prefix);
      if (cache) return after?.(details, cache);

      if (!wait[prefix]) wait[prefix] = [];
      wait[prefix].push(details);

      if (queue.includes(prefix)) return;
      queue.push(prefix);
      match();
    };

    const callback = (entries, obs) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) obs.unobserve(target) || requestAnimationFrame(() => dispatch(target));
      });
    };

    const obs = new IntersectionObserver(callback, { threshold: 0.25 });
    return (nodeList) => nodeList.forEach((node) => obs.observe(node));
  };

  const matchQueue = useMatchQueue(matchBefore, matchAfter);
  matchQueue(movieList);

  window.addEventListener("JavDB.scroll", ({ detail }) => matchQueue(detail));
  CHANNEL.onmessage = ({ data }) => matchQueue(document.querySelectorAll(`.${parseCodeCls(data)}`));

  const publish = (code) => {
    matchQueue(document.querySelectorAll(`.${parseCodeCls(code)}`));
    CHANNEL.postMessage(code);
  };

  const matchCode = async (node) => {
    const movie = node.closest(MOVIE_SELECTOR);
    if (!movie) return;

    const code = movie.querySelector(CODE_SELECTOR)?.textContent.trim();
    const target = movie.querySelector(`.${TARGET_CLASS}`);
    if (!code || !target) return;

    const { codes, regex } = Util.codeParse(code);
    const UUID = crypto.randomUUID();
    target.dataset.uid = UUID;

    try {
      const { data = [] } = await Req115.filesSearchAllVideos(codes.join(" "));
      if (target.dataset.uid !== UUID) return;

      const sources = extractData(data.filter((it) => regex.test(it.n)));
      GM_setValue(code, sources);
    } catch (err) {
      if (target.dataset.uid !== UUID) return;
      Util.print(err?.message);
    }

    publish(code);
  };

  const refresh = ({ type, target }) => {
    if (target.textContent === TARGET_TXT) return;
    target.textContent = TARGET_TXT;
    target.title = "";

    if (type === "contextmenu") return matchCode(target);
    if (type !== "click") return;
    const code = target.closest(MOVIE_SELECTOR)?.querySelector(CODE_SELECTOR)?.textContent.trim();
    if (code) setTimeout(() => publish(code), 750);
  };

  unsafeWindow[MATCH_API] = matchCode;
  listenClick(matchCode, refresh);
})();
