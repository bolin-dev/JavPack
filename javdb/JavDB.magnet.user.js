// ==UserScript==
// @name            JavDB.magnet
// @namespace       JavDB.magnet@blc
// @version         0.0.1
// @author          blc
// @description     磁链扩展
// @match           https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Magnet.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.ReqMagnet.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @connect         btdig.com
// @connect         nyaa.si
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValues
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_getValue
// @grant           GM_setValue
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

Util.upStore();

(function () {
  const mid = unsafeWindow.appData?.split("/").at(-1);
  if (!mid) return;

  const transByte = Magnet.useTransByte();
  const hdSize = parseFloat(transByte("2GB"));
  const minSize = parseFloat(transByte("250MB"));

  const code = document.querySelector(".first-block .value").textContent;
  const magnetsNode = document.querySelector("#magnets-content");
  const codeDetails = Util.codeParse(code);
  magnetsNode.classList.add("x-magnet");

  magnetsNode.insertAdjacentHTML(
    "beforebegin",
    `<div class="tags mb-1">
      <a class="tag is-success" href="https://btdig.com/search?order=0&q=${code}" target="_blank">
        <span class="icon is-small"><i class="icon-check-circle"></i></span><span>BTDigg</span>
      </a>
      <a class="tag is-success" href="https://sukebei.nyaa.si/?f=0&c=2_2&q=${code}" target="_blank">
        <span class="icon is-small"><i class="icon-check-circle"></i></span><span>Sukebei</span>
      </a>
      <span class="tag is-success">
        <span class="icon is-small"><i class="icon-check-circle"></i></span><span>自动去重</span>
      </span>
      <span class="tag is-success">
        <span class="icon is-small"><i class="icon-check-circle"></i></span><span>综合排序</span>
      </span>
    </div>`,
  );

  const getMagnets = () => {
    return [...magnetsNode.querySelectorAll(".item.columns")]
      .map((node) => {
        const meta = (node.querySelector(".meta")?.textContent.trim() ?? "").split(",");
        return {
          url: node.querySelector(".magnet-name a")?.href,
          name: node.querySelector(".name")?.textContent.trim() ?? "",
          size: meta[0].replace(/\s/g, ""),
          files: meta?.[1]?.replace("個文件", "").trim() ?? "",
          zh: !!node.querySelector(".tags .is-warning"),
          date: node.querySelector(".time")?.textContent.trim() ?? "",
        };
      })
      .filter(({ url }) => url);
  };

  const renderMagnet = ({ url, name, meta, zh, crack, hd, date }, idx) => {
    return `
    <div class="item columns is-desktop${(idx + 1) % 2 !== 0 ? " odd" : ""}">
      <div class="magnet-name column is-four-fifths">
        <a href="${url}">
          <span class="name" title="${name}">${name}</span><br />
          <span class="meta">${meta}</span><br />
          <div class="tags">
            ${zh ? "<span class='tag is-warning is-small is-light'>字幕</span>" : ""}
            ${crack ? "<span class='tag is-info is-small is-light'>破解</span>" : ""}
            ${hd ? "<span class='tag is-primary is-small is-light'>高清</span>" : ""}
          </div>
        </a>
      </div>
      <div class="buttons column">
        <button class="button is-info is-small copy-to-clipboard" data-clipboard-text="${url}" type="button">
          复制
        </button>
        <a class="button is-info is-small" href="https://keepshare.org/aa36p03v/${url}" target="_blank">下载</a>
      </div>
      <div class="date column"><span class="time">${date}</span></div>
    </div>
    `;
  };

  const filterMagnet = ({ size }) => parseFloat(size) > minSize;

  const parseSize = ({ size, files, ...item }) => {
    let meta = [];
    if (size) meta.push(size);
    if (files) meta.push(`${files}个文件`);
    meta = meta.join(", ");

    size = transByte(size);
    const hd = parseFloat(size) >= hdSize;
    return { ...item, meta, size, hd };
  };

  const reduceMagnet = (acc, cur) => {
    const index = acc.findIndex((item) => item.url === cur.url);
    if (index === -1) return acc.concat(cur);

    const existed = acc[index];

    ["name", "size", "files", "zh", "crack", "date"].forEach((key) => {
      if (!existed[key] && cur[key]) acc[index][key] = cur[key];
    });

    return acc;
  };

  const parseName = ({ url, name, zh, ...item }) => {
    url = url.split("&")[0].toLowerCase();
    if (!zh) zh = Magnet.zhReg.test(name);
    const crack = Magnet.crackReg.test(name);
    return { ...item, url, name, zh, crack };
  };

  const setMagnets = (details) => {
    magnetsNode.innerHTML =
      Object.values(details)
        .flat()
        .map(parseName)
        .reduce(reduceMagnet, [])
        .map(parseSize)
        .filter(filterMagnet)
        .toSorted(Magnet.magnetSort)
        .map(renderMagnet)
        .join("") || "暂无数据";
  };

  let details = GM_getValue(mid);
  details ? setMagnets(details) : (details = {});

  const setDetails = (sources, key) => {
    details[key] = sources;
    GM_setValue(mid, details);
    setMagnets(details);
  };

  if (!details.origin) setDetails(getMagnets(), "origin");
  if (!details.btdig) ReqMagnet.btdig(codeDetails).then((sources) => setDetails(sources, "btdig"));
  if (!details.nyaa) ReqMagnet.nyaa(codeDetails).then((sources) => setDetails(sources, "nyaa"));
})();
