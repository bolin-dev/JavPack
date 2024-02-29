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
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  Util.upLocal();

  const btdigHost = "https://btdig.com";
  const transToByte = Util.useTransByte();
  const isUncensored = document.querySelector(".title.is-4 strong").textContent.includes("無碼");
  const hdSize = parseFloat(transToByte(Util.hdMagnetSize));
  const minSize = parseFloat(transToByte(Util.minMagnetSize));

  const code = document.querySelector(".first-block .value").textContent;
  const magnetNode = document.querySelector("#magnets-content");

  magnetNode.insertAdjacentHTML(
    "beforebegin",
    `<div class="buttons are-small mb-1">
      <a class="button is-success" id="x-btdig" href="${btdigHost}/search?q=${code}" target="_blank">
        <span class="icon is-small"><i class="icon-check-circle"></i></span><span>BTDigg</span>
      </a>
      <button class="button is-success">
        <span class="icon is-small"><i class="icon-check-circle"></i></span><span>自动去重</span>
      </button>
      <button class="button is-success">
        <span class="icon is-small"><i class="icon-check-circle"></i></span><span>自动排序</span>
      </button>
    </div>`,
  );

  const mid = `btdig_${location.pathname.split("/").pop()}`;
  const btdigMagnets = localStorage.getItem(mid);

  if (btdigMagnets) {
    refactorMagnets(JSON.parse(btdigMagnets));
  } else {
    refactorMagnets();
    const btdigNode = document.querySelector("#x-btdig");
    btdigNode.classList.add("is-loading");

    UtilMagnet.btdig(code)
      .then((res) => {
        const icon = btdigNode.querySelector("i");
        if (res) {
          localStorage.setItem(mid, JSON.stringify(res));
          res.length ? refactorMagnets(res) : icon.setAttribute("class", "icon-check-circle-o");
        } else {
          btdigNode.classList.replace("is-success", "is-warning");
          icon.setAttribute("class", "icon-close");
        }
      })
      .finally(() => btdigNode.classList.remove("is-loading"));
  }

  function refactorMagnets(insert = []) {
    magnetNode.innerHTML =
      [...magnetNode.querySelectorAll(".item.columns")]
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
        .concat(insert)
        .map(({ url, name, meta, files, size, zh, hd, ...item }) => {
          url = url.split("&")[0].toLowerCase();

          // eslint-disable-next-line no-eq-null, eqeqeq
          if (meta == null) {
            meta = [];
            if (size) meta.push(size);
            if (files) meta.push(`${files}个文件`);
            meta = meta.join(", ");
          }

          size = transToByte(size);

          if (!zh) zh = Util.zhReg.test(name);

          const crack = !isUncensored && Util.crackReg.test(name);

          if (!hd) hd = parseFloat(size) >= hdSize;

          return { ...item, url, name, meta, size, zh, crack, hd };
        })
        .filter(({ size }) => parseFloat(size) > minSize)
        .reduce((acc, cur) => {
          const index = acc.findIndex((item) => item.url === cur.url);

          if (index === -1) {
            acc.push(cur);
          } else if (!acc[index].meta.includes(",") && cur.meta.includes(",")) {
            acc[index].meta = cur.meta;
          }

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
        .join("") || "暂无数据";
  }

  magnetNode.addEventListener("contextmenu", (e) => {
    const target = e.target.closest("a");
    if (!target) return;

    const { hash } = target.dataset;
    if (!hash) return;

    e.preventDefault();
    e.stopPropagation();
    Util.openTab(`${btdigHost}/${hash}`);
  });
})();
