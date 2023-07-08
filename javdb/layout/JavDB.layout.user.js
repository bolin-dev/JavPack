// ==UserScript==
// @name            JavDB.layout
// @namespace       JavDB.layout@blc
// @version         0.0.1
// @author          blc
// @description     布局调整
// @include         /^https:\/\/javdb\d*\.com\/.*$/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

const variable = `
.container {
  --sm-max-width: 540px;
  --md-max-width: 720px;
  --lg-max-width: 960px;
  --xl-max-width: 1140px;
  --xxl-max-width: 1320px;
}
.actors {
  --sm-grid-cols: 2;
  --md-grid-cols: 3;
  --lg-grid-cols: 4;
  --xl-grid-cols: 5;
  --xxl-grid-cols: 6;
}
.movie-list {
  --sm-grid-cols: 1;
  --md-grid-cols: 1;
  --lg-grid-cols: 2;
  --xl-grid-cols: 2;
  --xxl-grid-cols: 3;
}
.movie-list.v {
  --sm-grid-cols: 1;
  --md-grid-cols: 2;
  --lg-grid-cols: 3;
  --xl-grid-cols: 3;
  --xxl-grid-cols: 4;
}
.section-container {
  --sm-grid-cols: 2;
  --md-grid-cols: 2;
  --lg-grid-cols: 3;
  --xl-grid-cols: 3;
  --xxl-grid-cols: 4;
}
`;
const common = `
.actors,
.movie-list,
.movie-list.v,
.section-container {
  grid-gap: 1rem !important;
  grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
}
`;

GM_addStyle(`
${variable}
${common}
@media (min-width: 576px) {
  .container {
    max-width: var(--sm-max-width) !important;
  }
  .actors,
  .movie-list,
  .movie-list.v,
  .section-container {
    grid-template-columns: repeat(var(--sm-grid-cols), minmax(0, 1fr)) !important;
  }
}
@media (min-width: 768px) {
  .container {
    max-width: var(--md-max-width) !important;
  }
  .actors,
  .movie-list,
  .movie-list.v,
  .section-container {
    grid-template-columns: repeat(var(--md-grid-cols), minmax(0, 1fr)) !important;
  }
}
@media (min-width: 992px) {
  .container {
    max-width: var(--lg-max-width) !important;
  }
  .actors,
  .movie-list,
  .movie-list.v,
  .section-container {
    grid-template-columns: repeat(var(--lg-grid-cols), minmax(0, 1fr)) !important;
  }
}
@media (min-width: 1200px) {
  .container {
    max-width: var(--xl-max-width) !important;
  }
  .actors,
  .movie-list,
  .movie-list.v,
  .section-container {
    grid-template-columns: repeat(var(--xl-grid-cols), minmax(0, 1fr)) !important;
  }
}
@media (min-width: 1400px) {
  .container {
    max-width: var(--xxl-max-width) !important;
  }
  .actors,
  .movie-list,
  .movie-list.v,
  .section-container {
    grid-template-columns: repeat(var(--xxl-grid-cols), minmax(0, 1fr)) !important;
  }
}
`);
