// ==UserScript==
// @name            JavDB.style
// @namespace       JavDB.style@blc
// @version         0.0.1
// @author          blc
// @description     样式调整
// @include         /^https:\/\/javdb\d*\.com\/.*$/
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  GM_addStyle(`
  :root[data-theme=dark] {
    color-scheme: dark;
  }
  img,
  video {
    filter:brightness(.9) contrast(.9);
  }
  .app-desktop-banner,
  #magnets .top-meta {
    display: none !important;
  }
  #search-type,
  #video-search {
    border: none;
  }
  .toolbar {
    padding: 0 0 1rem;
  }
  .toolbar .button-group {
    margin-bottom: 0;
  }
  .movie-list {
    padding-bottom: 0;
  }
  a.box:focus,
  a.box:hover,
  a.box:active,
  [data-theme=dark] a.box:focus,
  [data-theme=dark] a.box:hover,
  [data-theme=dark] a.box:active {
    box-shadow: none;
  }
  :root[data-theme=dark] .box:hover {
    background: unset;
  }
  .movie-list .item .cover:hover img {
    transform: none;
  }
  nav.pagination {
    margin-top: 0;
    padding-top: 1rem;
    border-top: none;
    margin-left: -.25rem;
    margin-right: -.25rem;
  }
  :root[data-theme=dark] nav.pagination {
    border-top: none !important;
  }
  `);
})();
