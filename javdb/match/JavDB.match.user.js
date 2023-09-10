// ==UserScript==
// @name            JavDB.match
// @namespace       JavDB.match@blc
// @version         0.0.1
// @author          blc
// @description     列表匹配
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/)/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/drive/JavPack.drive.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const date = new Date().getDate();
  const cd = GM_getValue("CD");

  if (!cd) {
    GM_setValue("CD", date);
  } else if (cd !== date) {
    for (const key of GM_listValues()) GM_deleteValue(key);
    GM_setValue("CD", date);
  }

  const container = document.querySelector(".movie-list");
  if (!container) return;

  const childList = container.querySelectorAll(".item:not(.is-hidden)");
  if (!childList?.length) return;

  let loading = false;
  const listMatch = async () => {
    if (!parseList.__target.length || loading) return;
    loading = true;

    const target = parseList.__target;
    const _fetch = async () => {
      await match(target[0]);
      target.splice(0, 1);
      if (target.length) await _fetch();
    };
    await _fetch();

    loading = false;
  };

  const match = async ({ prefix, regex, node }) => {
    let res = GM_getValue(prefix);

    if (!res) {
      res = (await filesSearch(prefix))?.data;
      if (Array.isArray(res)) GM_setValue(prefix, res);
    }
    res = res?.find(item => regex.test(item.n));
    if (!res) return;

    const cover = node.querySelector(".cover");
    cover.classList.add("x-match");
    cover.dataset.pc = res.pc;
  };

  const parseList = new Proxy([], {
    get(target, prop, receiver) {
      return prop === "__target" ? target : Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      if (value.prefix) listMatch();
      return Reflect.set(target, prop, value, receiver);
    },
  });
  const parseItems = nodeList => {
    for (const node of nodeList) {
      const code = node.querySelector(".video-title strong")?.textContent;
      if (code) parseList.push({ ...codeParse(code), node });
    }
  };
  parseItems(childList);

  const callback = (mutationsList, observer) => {
    for (const { type, addedNodes } of mutationsList) {
      if (type !== "childList" || !addedNodes?.length) continue;
      if (addedNodes.length < 12) observer.disconnect();
      parseItems(addedNodes);
    }
  };
  const mutationObserver = new MutationObserver(callback);
  mutationObserver.observe(container, { childList: true, attributes: false });

  GM_addStyle(
    '.x-match:after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3rem;height:3rem;background:url(/packs/media/images/btn-play-b414746c.svg) no-repeat center/contain;z-index:1}'
  );

  container.addEventListener("click", e => {
    if (e.target.classList.contains("preview")) return;

    const target = e.target.closest(".cover.x-match");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    GM_openInTab(`https://v.anxia.com/?pickcode=${target.dataset.pc}`, { active: true, setParent: true });
  });
})();
