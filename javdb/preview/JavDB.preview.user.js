// ==UserScript==
// @name            JavDB.preview
// @namespace       JavDB.preview@blc
// @version         0.0.1
// @author          blc
// @description     详情预览
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/).*$/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const container = document.querySelector(".movie-list");
  if (!container) return;

  const childList = container.querySelectorAll(".item");
  if (!childList?.length) return;

  const addTarget = nodeList => {
    for (const node of nodeList) {
      node
        .querySelector(".cover")
        ?.insertAdjacentHTML(
          "beforeend",
          "<button class='button is-info is-small preview'>预览详情</button>"
        );
    }
  };
  addTarget(childList);

  const callback = (mutationsList, observer) => {
    for (const { type, addedNodes } of mutationsList) {
      if (type !== "childList") continue;
      if (!addedNodes?.length) continue;
      if (addedNodes.length < 40) observer.disconnect();
      addTarget(addedNodes);
    }
  };

  const mutationObserver = new MutationObserver(callback);
  mutationObserver.observe(container, { childList: true, attributes: false });

  GM_addStyle(`
  .movie-list .item .cover{position:relative;overflow:hidden}
  .movie-list .item .cover .preview{z-index:1;display:none;position:absolute;inset:.5rem .5rem auto auto}
  .movie-list .item .cover:hover .preview{display:flex}
  #javpack-preview .modal-card-head{gap:15px}
  #javpack-preview .modal-card-title{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
  #javpack-preview .modal-card-body{padding:15px}
  #javpack-preview .carousel{aspect-ratio:400/269;background:#aa9084}
  :root[data-theme=dark] #javpack-preview .carousel{background:#222}
  #javpack-preview .carousel :is(img,video){display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;vertical-align:middle}
  #javpack-preview .carousel :is(img,video).carousel-active{display:block}
  #javpack-preview .carousel .btn{position:absolute;z-index:1;display:block;width:50px;height:50px;line-height:50px;text-align:center;font-size:30px;background:#fff;opacity:.4;cursor:pointer;top:50%;transform:translateY(-50%);border-radius:50%;overflow:hidden}
  #javpack-preview .carousel .btn:hover{opacity:.8}
  #javpack-preview .carousel .btn.carousel-prev{left:15px}
  #javpack-preview .carousel .btn.carousel-next{right:15px}
  #javpack-preview .info-block{padding-block:7.5px}
  #javpack-preview .info-block:not(:last-child){border-bottom:1px solid #ededed}
  :root[data-theme=dark] #javpack-preview .info-block{border-color:#4a4a4a}
  #javpack-preview .modal-card-foot{justify-content:flex-end}
  `);

  document.body.insertAdjacentHTML(
    "beforeend",
    '<div id="javpack-preview" class="modal"><div class="modal-background"></div><div class="modal-card"><header class="modal-card-head"><p class="modal-card-title">JavPack Preview</p><button class="delete" aria-label="close"></button></header><section class="modal-card-body">loading...</section><footer class="modal-card-foot"><a class="button is-success is-small" target="_blank">查看详情</a></footer></div></div>'
  );
  const modal = document.querySelector("#javpack-preview");
  const modalTitle = modal.querySelector(".modal-card-title");
  const modalBody = modal.querySelector(".modal-card-body");
  const modalBtn = modal.querySelector(".modal-card-foot .button");

  const createPreview = ({ cover, trailer, thumbnail, info }, _trailer = "") => {
    console.log(cover, trailer, thumbnail, info, _trailer);
    let innerHTML = "";

    if (cover.length || trailer.length || thumbnail.length || _trailer.length) {
      innerHTML += '<div class="is-relative is-clipped carousel">';

      if (cover.length) innerHTML += `<img src="${cover}" alt="cover" class="carousel-active">`;
      if (trailer.length || _trailer.length) {
        innerHTML += `<video src="${trailer || _trailer}" controls></video>`;
      }
      if (thumbnail.length) {
        for (const item of thumbnail) innerHTML += `<img src="${item}" alt="thumbnail">`;
      }

      innerHTML +=
        '<div class="is-unselectable btn carousel-prev">🔙</div><div class="is-unselectable btn carousel-next">🔜</div></div>';
    }

    for (const { title, value } of info) {
      innerHTML += `<div class="info-block"><strong>${title}</strong>&nbsp;<span class="value">${value}</span></div>`;
    }

    return innerHTML;
  };

  const getDetail = dom => {
    const cover = dom.querySelector(".column-video-cover img")?.src ?? "";
    const trailer = dom.querySelector("#preview-video source")?.getAttribute("src") ?? "";

    const info = [];
    for (const item of dom.querySelectorAll(".movie-panel-info > .panel-block")) {
      const title = item.querySelector("strong")?.textContent?.trim() ?? "";
      let value = item.querySelector("span.value")?.textContent?.trim() ?? "";
      value = value
        .split("\n")
        .map(v => v.trim())
        .join(", ");
      if (title && value) info.push({ title, value });
    }

    const thumbnail = [];
    for (const item of dom.querySelectorAll(".tile-images.preview-images .tile-item")) {
      const url = item?.href;
      if (url) thumbnail.push(url);
    }

    if (!cover && !trailer && !thumbnail.length && !info.length) return;
    return { cover, trailer, thumbnail, info };
  };

  const modalOpen = () => modal.classList.add("is-active");
  const handleOpen = async node => {
    const url = node.href;
    if (!url) return;

    let mid = url.split("/").at(-1);
    if (!mid) return;

    if (url === modalBtn.href && modalBody.innerHTML !== "获取失败") return modalOpen();

    modalBtn.href = url;
    modalTitle.textContent = node.querySelector(".video-title").textContent;
    modalOpen();

    const trailer = localStorage.getItem(`trailer_${mid}`) ?? "";
    mid = `preview_${mid}`;
    let preview = localStorage.getItem(mid);

    if (preview) {
      modalBody.innerHTML = createPreview(JSON.parse(preview), trailer);
      return;
    }

    modalBody.innerHTML = "loading...";
    preview = await taskQueue(url, [getDetail]);
    modalBody.innerHTML = preview ? createPreview(preview, trailer) : "获取失败";

    if (preview) localStorage.setItem(mid, JSON.stringify(preview));
  };

  container.addEventListener("click", e => {
    const target = e.target.closest(".movie-list .item .cover .preview");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const node = target.closest("a");
    if (node) handleOpen(node);
  });

  modalBody.addEventListener("click", e => {
    const target = e.target.closest(".carousel .btn");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const list = modalBody.querySelectorAll(".carousel :is(img, video)");
    const current = modalBody.querySelector(".carousel-active");
    if (current.matches("video")) current.pause();

    let will;
    if (target.matches(".carousel-prev")) {
      will = current.previousElementSibling;
      if (!will?.matches("img, video")) will = list[list.length - 1];
    } else {
      will = current.nextElementSibling;
      if (!will?.matches("img, video")) will = list[0];
    }
    if (!will) return;

    current.classList.remove("carousel-active");
    will.classList.add("carousel-active");
    if (will.matches("video")) {
      will.play();
      will.focus();
    }
  });

  const modalObserver = new MutationObserver(mutationsList => {
    for (const { type, attributeName, target } of mutationsList) {
      if (type !== "attributes" || attributeName !== "class") continue;

      if (!target.classList.contains("is-active")) {
        target.querySelector("video")?.pause();
        continue;
      }

      const current = target.querySelector(".carousel-active");
      if (current?.matches("video")) {
        current.play();
        current.focus();
      }
    }
  });
  modalObserver.observe(modal, { attributeFilter: ["class"] });
})();
