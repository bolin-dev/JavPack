// ==UserScript==
// @name            JavDB.magnet
// @namespace       JavDB.magnet@blc
// @version         0.0.1
// @author          blc
// @description     磁链扩展
// @match           https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.UtilMagnet.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         btdig.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           unsafeWindow
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(async function () {
  Util.upLocal();

  const btdigHost = "https://btdig.com";
  const transToByte = Util.useTransByte();
  const hdSize = parseFloat(transToByte("2GB"));

  const code = document.querySelector(".first-block .value").textContent;
  const magnetNode = document.querySelector("#magnets-content");

  magnetNode.insertAdjacentHTML(
    "beforebegin",
    `<div class="buttons are-small mb-1">
      <a
        id="x-btdig"
        class="button is-success"
        href="${btdigHost}/search?q=${code}"
        target="_blank"
      >
        <span class="icon is-small"><i class="icon-check-circle"></i></span>
        <span>BTDigg</span>
      </a>
    </div>`,
  );

  const btdigNode = document.querySelector("#x-btdig");
  const mid = `btdig_${location.pathname.split("/").pop()}`;
  let btdigMagnets = localStorage.getItem(mid);

  if (!btdigMagnets) {
    btdigNode.classList.add("is-loading");
    btdigMagnets = await UtilMagnet.btdig(code);
    btdigNode.classList.remove("is-loading");

    if (btdigMagnets) localStorage.setItem(mid, JSON.stringify(btdigMagnets));
  } else {
    btdigMagnets = JSON.parse(btdigMagnets);
  }

  btdigNode.insertAdjacentHTML(
    "afterend",
    `<button class="button is-success">
      <span class="icon is-small"><i class="icon-check-circle"></i></span>
      <span>自动去重</span>
    </button>
    <button class="button is-success">
      <span class="icon is-small"><i class="icon-check-circle"></i></span>
      <span>自动排序</span>
    </button>`,
  );

  magnetNode.innerHTML = [...magnetNode.querySelectorAll(".item.columns")]
    .map((item) => {
      const meta = item.querySelector(".meta")?.textContent.trim() ?? "";
      return {
        url: item.querySelector(".magnet-name a").href,
        name: item.querySelector(".name")?.textContent ?? "",
        meta: meta.replace("個", "个"),
        size: meta.split(",")[0],
        hd: !!item.querySelector(".tags .is-primary"),
        zh: !!item.querySelector(".tags .is-warning"),
        date: item.querySelector(".time")?.textContent ?? "",
      };
    })
    .concat(btdigMagnets ?? [])
    .map(({ url, name, meta, files, size, zh, hd, ...item }) => {
      url = url.split("&")[0].toLowerCase();

      if (!meta) {
        meta = [];
        if (size) meta.push(size);
        if (files) meta.push(`${files}个文件`);
        meta = meta.join(", ");
      }

      size = transToByte(size);

      if (!zh) zh = Util.zhReg.test(name);

      const crack = Util.crackReg.test(name);

      if (!hd) hd = parseFloat(size) >= hdSize;

      return { ...item, url, name, meta, size, zh, crack, hd };
    })
    .reduce((acc, cur) => {
      if (!acc.find((item) => item.url === cur.url)) acc.push(cur);
      return acc;
    }, [])
    .toSorted(Util.magnetSort)
    .map(({ url, name, meta, zh, crack, hd, date }, idx) => {
      const odd = !(idx % 2) ? " odd" : "";
      const hash = url.split(":").pop();
      zh = zh ? '<span class="tag is-warning is-small is-light">字幕</span>' : "";
      crack = crack ? '<span class="tag is-info is-small is-light">破解</span>' : "";
      hd = hd ? '<span class="tag is-primary is-small is-light">高清</span>' : "";

      return `
      <div class="item columns is-desktop${odd}">
        <div class="magnet-name column is-four-fifths">
          <a href="${url}" data-hash="${hash}" title="右键点击跳转以查看链接详情">
            <span class="name">${name}</span><br>
            <span class="meta">${meta}</span><br>
            <div class="tags">${zh}${crack}${hd}</div>
          </a>
        </div>
        <div class="date column"><span class="time">${date}</span></div>
        <div class="buttons column">
          <button class="button is-info is-small copy-to-clipboard" data-clipboard-text="${url}" type="button">
            复制
          </button>
        </div>
      </div>`;
    })
    .join("");

  magnetNode.addEventListener("contextmenu", (e) => {
    const target = e.target.closest("a");
    if (!target) return;

    const { hash } = target.dataset;
    if (!hash) return;

    e.preventDefault();
    e.stopPropagation();
    Util.openTab(`${btdigHost}/${hash}`);
  });

  unsafeWindow.updateMagnets?.();
})();
