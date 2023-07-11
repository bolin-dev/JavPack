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
          '<button class="button is-info is-small preview">预览详情</button>'
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

  // document.body.insertAdjacentHTML(
  //   "beforeend",
  //   '<div id="javpack-preview" class="modal"><div class="modal-background"></div><div class="modal-card"><header class="modal-card-head"><p class="modal-card-title">JavPack Preview</p><button class="delete" aria-label="close"></button></header><section class="modal-card-body">loading...</section><footer class="modal-card-foot"><a class="button is-success" target="_blank">查看详情</a></footer></div></div>'
  // );
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="javpack-preview" class="modal">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="card">
          <div class="card-image">
            <figure class="image is-4by3">
              <img src="https://bulma.io/images/placeholders/640x480.png" alt="Placeholder image">
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">John Smith</p>
                <p class="subtitle is-6">@johnsmith</p>
              </div>
            </div>
            <div class="content">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Phasellus nec iaculis mauris. <a>@bulmaio</a>.
              <a href="#">#css</a> <a href="#">#responsive</a>
              <br>
              <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close"></button>
    </div>`
  );

  const modal = document.querySelector("#javpack-preview");
  const modalTitle = modal.querySelector(".modal-card-title");
  const modalBody = modal.querySelector(".modal-card-body");
  const modalBtn = modal.querySelector(".modal-card-foot .button");

  const createPreview = ({ cover, info, sample }) => {
    const coverHTML = cover ? `<img src="${cover}" alt="cover">` : "";
    // ...
    return coverHTML;
  };

  const modalOpen = async node => {
    const url = node.href;
    if (!url) return;

    let mid = url.split("/").at(-1);
    if (!mid) return;

    if (url === modalBtn.href && modalBody.innerHTML !== "获取失败") {
      return modal.classList.add("is-active");
    }

    modalBtn.href = url;
    modal.classList.add("is-active");
    modalTitle.textContent = node.querySelector(".video-title").textContent;

    mid = `preview_${mid}`;
    let preview = localStorage.getItem(mid);

    if (preview) {
      modalBody.innerHTML = createPreview(JSON.parse(preview));
      return;
    }

    modalBody.innerHTML = "loading...";

    preview = await taskQueue(url, [
      dom => {
        const cover = dom.querySelector(".column-video-cover img")?.src ?? "";

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

        return { cover, info };
      },
    ]);

    modalBody.innerHTML = preview ? createPreview(preview) : "获取失败";
    // if (preview) localStorage.setItem(mid, JSON.stringify(preview));
  };

  container.addEventListener("click", e => {
    const target = e.target.closest(".movie-list .item .cover .preview");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const item = target.closest("a");
    // if (item) modalOpen(item);
    modal.classList.add("is-active");
  });
})();
