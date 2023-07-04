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
    filter: brightness(.95) contrast(.95);
  }
  .app-desktop-banner,
  #magnets .top-meta,
  #navbar-menu-hero .navbar-start > a {
    display: none !important;
  }
  #search-bar-container {
    margin-bottom: .25rem !important;
  }
  #search-type,
  #video-search {
    border: none;
  }
  #video-search:focus {
    box-shadow: none;
    z-index: auto;
  }
  .toolbar {
    font-size: 0;
    padding: 0 0 .5rem;
  }
  .toolbar .button-group {
    margin-bottom: .5rem;
    margin-right: .5rem;
  }
  .movie-list {
    padding-bottom: 0;
  }
  .movie-list,
  .movie-list.v {
    grid-gap: .5rem;
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
  .movie-list .box {
    padding: 0;
  }
  .movie-list .item .cover:hover img {
    transform: none;
  }
  .movie-list .box .video-title {
    font-size: 14px;
    padding-right: .4rem;
  }
  .movie-list .item .tags {
    padding-bottom: .4rem;
  }
  .movie-list .item .tags,
  .movie-list .item .tags .tag {
    margin-bottom: 0;
  }
  nav.pagination {
    margin-top: 0;
    padding-top: 1rem;
    border-top: none;
    margin-inline: -.25rem;
  }
  :root[data-theme=dark] nav.pagination {
    border-top: none !important;
  }
  `);
})();
