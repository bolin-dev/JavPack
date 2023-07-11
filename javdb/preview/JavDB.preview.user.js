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
          '<button class="button is-info is-small preview">预览</button>'
        );
    }
  };
  addTarget(childList);

  const callback = (mutationsList, observer) => {
    for (let { type, addedNodes } of mutationsList) {
      if (type !== "childList") continue;
      if (!addedNodes?.length) continue;
      if (addedNodes.length < 40) observer.disconnect();
      addTarget(addedNodes);
    }
  };

  const mutationObserver = new MutationObserver(callback);
  mutationObserver.observe(container, { childList: true, attributes: false });

  GM_addStyle(`
  .movie-list .item .cover {
    position: relative;
    overflow: hidden;
  }
  .movie-list .item .cover .preview {
    position: absolute;
    inset: .5rem .5rem auto auto;
    z-index: 1;
  }
  #javpack-preview .modal-card-title {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  #javpack-preview .modal-card-foot {
    justify-content: flex-end;
  }
  `);

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="javpack-preview" class="modal"><div class="modal-background"></div><div class="modal-card"><header class="modal-card-head"><p class="modal-card-title">JavPack Preview</p><button class="delete" aria-label="close"></button></header><section class="modal-card-body">loading...</section><footer class="modal-card-foot"><button class="button is-success">查看详情</button></footer></div></div>`
  );

  const modal = document.querySelector("#javpack-preview");
  const modalTitle = modal.querySelector(".modal-card-title");
  const modalBody = modal.querySelector(".modal-card-body");
  const modalFooter = modal.querySelector(".modal-card-foot");

  const modalOpen = url => modal.classList.add("is-active");
  const modalClose = () => modal.classList.remove("is-active");

  container.addEventListener("click", e => {
    const target = e.target.closest(".movie-list .item .cover .preview");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const item = target.closest("a");
    const url = item.href;
    if (!url) return;

    modalTitle.textContent = item.querySelector(".video-title").textContent;
    modalOpen(url);
  });
})();
