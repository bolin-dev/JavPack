// ==UserScript==
// @name            JavDB.layout
// @namespace       JavDB.layout@blc
// @version         0.0.1
// @author          blc
// @description     布局调整
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
  .movie-list {
    grid-gap: 1rem !important;
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .movie-list.v {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  @media (min-width: 576px) {
    .container {
        max-width:540px;
    }
  }
  @media (min-width: 768px) {
    .container {
        max-width:720px;
    }
    .movie-list.v {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 992px) {
    .container {
        max-width:960px;
    }
    .movie-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .movie-list.v {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (min-width: 1200px) {
    .container {
        max-width:1140px !important;
    }
  }
  @media (min-width: 1400px) {
    .container {
        max-width:1320px !important;
    }
    .movie-list {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .movie-list.v {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  `);
})();
