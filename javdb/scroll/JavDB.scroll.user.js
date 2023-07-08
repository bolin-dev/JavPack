// ==UserScript==
// @name            JavDB.scroll
// @namespace       JavDB.scroll@blc
// @version         0.0.1
// @author          blc
// @description     滚动加载
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/).*$/
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         file:///Users/bolinc/Projects/JavPack/libs/request/JavPack.request.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-body
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  GM_addStyle(`
  .actors {
    --xs-item-height: 580px;
    --sm-item-height: 299px;
    --md-item-height: 266px;
    --lg-item-height: 265px;
    --xl-item-height: 252px;
    --xxl-item-height: 244px;
  }
  .movie-list {
    --xs-item-height: 470px;
    --sm-item-height: 468px;
    --md-item-height: 589px;
    --lg-item-height: 423px;
    --xl-item-height: 483px;
    --xxl-item-height: 394px;
  }
  .movie-list.v {
    --xs-item-height: 868px;
    --sm-item-height: 864px;
    --md-item-height: 606px;
    --lg-item-height: 548px;
    --xl-item-height: 630px;
    --xxl-item-height: 560px;
  }
  .section-container {
    --xs-item-height: 55px;
    --sm-item-height: 55px;
    --md-item-height: 55px;
    --lg-item-height: 55px;
    --xl-item-height: 55px;
    --xxl-item-height: 55px;
  }
  :is(.movie-list, .actors, .section-container) > :is(div, a) {
    content-visibility: auto;
    contain-intrinsic-size: auto var(--xs-item-height);
  }
  @media (min-width: 576px) {
    :is(.movie-list, .actors, .section-container) > :is(div, a) {
      contain-intrinsic-size: auto var(--sm-item-height);
    }
  }
  @media (min-width: 768px) {
    :is(.movie-list, .actors, .section-container) > :is(div, a) {
      contain-intrinsic-size: auto var(--md-item-height);
    }
  }
  @media (min-width: 992px) {
    :is(.movie-list, .actors, .section-container) > :is(div, a) {
      contain-intrinsic-size: auto var(--lg-item-height);
    }
  }
  @media (min-width: 1200px) {
    :is(.movie-list, .actors, .section-container) > :is(div, a) {
      contain-intrinsic-size: auto var(--xl-item-height);
    }
  }
  @media (min-width: 1400px) {
    :is(.movie-list, .actors, .section-container) > :is(div, a) {
      contain-intrinsic-size: auto var(--xxl-item-height);
    }
  }
  nav.pagination {
    display: none;
  }
  .pagination-loading {
    font-size: 14px;
    padding-top: 1rem;
    text-align: center;
  }
  `);

  const selectors = {
    container: ":is(.movie-list, .actors, .section-container)",
    child: ":is(div, a)",
    pagination: "nav.pagination .pagination-next",
  };

  const container = document.querySelector(selectors.container);
  if (!container) return;

  let nextUrl = document.querySelector(selectors.pagination)?.href;
  if (!nextUrl) return;

  const loading = document.createElement("div");
  loading.classList.add("pagination-loading");
  loading.textContent = "加载中...";
  container.insertAdjacentElement("afterend", loading);

  const queryNext = dom => {
    const list = dom.querySelectorAll(`${selectors.container} > ${selectors.child}`);
    const url = dom.querySelector(selectors.pagination)?.href;
    return { url, list };
  };

  let isLoading = false;
  const callback = async (entries, observer) => {
    if (!entries[0].isIntersecting || isLoading) return;

    isLoading = true;
    const { url, list } = await taskQueue(nextUrl, [queryNext]);
    isLoading = false;

    if (list?.length) container.append(...list);

    if (!url) {
      loading.textContent = "暂无更多";
      return observer.disconnect();
    }

    nextUrl = url;
  };

  const intersectionObserver = new IntersectionObserver(callback);
  intersectionObserver.observe(loading);
})();
