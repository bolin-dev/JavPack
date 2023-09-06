// ==UserScript==
// @name            JavDB.style
// @namespace       JavDB.style@blc
// @version         0.0.1
// @author          blc
// @description     样式调整
// @include         /^https:\/\/javdb\d*\.com\/.*$/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

GM_addStyle(`
:root[data-theme=dark]{color-scheme:dark}
html{overflow-y:auto}
.compensate-for-scrollbar{margin-right:0!important}
img,video{filter:brightness(.9) contrast(.9)}
#magnets .top-meta,#navbar-menu-hero .navbar-start>a,.app-desktop-banner{display:none!important}
#search-bar-container{margin-bottom:.25rem!important}
#search-type,#video-search{border:none}
#video-search:focus{box-shadow:none;z-index:auto}
.search-bar-wrap .search-recent-keywords ul{margin-inline:-10px}
.main-tabs{margin-bottom:1rem!important}
.main-title{padding-top:0}
.box:not(:last-child),.columns:not(:last-child),.message-container,.message:not(:last-child),.tabs:not(:last-child),.title:not(:last-child){margin-bottom:1rem}
.section-columns{padding-top:0}
.actor-avatar,.section-addition,.section-title{padding-bottom:0}
.toolbar{font-size:0;padding:0 0 .5rem}
.toolbar .button-group{margin-bottom:.5rem;margin-right:.5rem}
#tags{margin-top:-1rem;margin-bottom:1rem}
#tags dt,#tags dt.collapse{display:flex}
#tags dt{padding:.5rem 0 0;line-height:normal}
#tags dt.collapse{height:41px}
#tags dt a.tag-expand{float:none;margin-top:0;order:3}
#tags dt strong{flex-shrink:0}
#tags dt>.tag{margin-left:.5rem}
#tags dt .tag{margin-right:.5rem;margin-bottom:.5rem}
#tags dt .tag_labels{flex:1;display:flex;flex-wrap:wrap}
.actor-filter-toolbar{padding-bottom:1rem}
.actor-filter hr{display:none}
.actor-tags{margin-top:-.5rem;padding:.5rem 0 0;border:none;margin-bottom:.5rem!important}
.actor-tags .content{display:flex;flex-wrap:wrap;padding-right:60px}
.actor-tags .collapse{height:40px}
.actor-tags .content .tag-expand{position:absolute!important;right:0}
.actor-tags .content .tag{margin:0 .5rem .5rem 0}
.movie-list{padding-bottom:0}
.actors,.movie-list,.movie-list.v,.section-container{grid-gap:.5rem}
.actor-box a strong,.movie-list .box .video-title,.movie-panel-info,.section-container .box{font-size:14px;line-height:unset}
:is(.tabs,#select-search-image-modal)+.section{padding:0}
.divider-title{padding-bottom:1rem}
:root[data-theme=dark] .divider-title{border-color:#4a4a4a}
.tabs+.section .awards:last-child{padding-bottom:0}
.tabs+.section #videos{margin-top:1rem!important;margin-bottom:0!important}
.actors+br{display:none}
.actors+br+.title{margin-top:1rem}
#lists.common-list{margin-top:-1rem}
#lists.common-list .list-item.columns{margin:0}
#lists.common-list .list-item.columns .column{padding:1rem 0}
#lists.common-list .list-item.columns .column .field.has-addons{justify-content:end}
#lists.common-list>ul>div.list-item{padding-top:1rem}
[data-theme=dark] a.box:active,[data-theme=dark] a.box:focus,[data-theme=dark] a.box:hover,a.box:active,a.box:focus,a.box:hover{box-shadow:none}
:root[data-theme=dark] .box:hover{background:unset}
.movie-list .box{padding:0 0 .4rem}
.movie-list .item .cover:hover img{transform:none}
.movie-list .box .video-title{padding-right:.4rem}
.movie-list .item .tags,.movie-list .item .tags .tag{margin-bottom:0}
.movie-list .box .meta-buttons{padding:.4rem .4rem 0}
.movie-list .box .meta-buttons .button{margin-top:0!important}
.actors .box{margin-bottom:0}
.actors .box .button{margin-top:0!important}
.section-container .box{margin-bottom:0;padding:1rem}
.section-container a.box,.section-container div.box>a:first-child{display:flex;justify-content:space-between;gap:.5rem}
.section-container .box strong{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
nav.pagination{padding-top:1rem;border-top:none;margin:0 -.25rem!important}
:root[data-theme=dark] nav.pagination{border-top:none!important}
.video-meta-panel{margin-bottom:1rem;padding:0}
.video-meta-panel>.columns{margin:0}
.video-meta-panel>.columns>.column{padding:0 .5rem}
.video-meta-panel>.columns>.column-video-cover{margin:.5rem;padding:0;aspect-ratio:400/269;background:#aa9084}
:root[data-theme=dark] .column-video-cover{background:#222}
@media only screen and (max-width:1024px){
.video-meta-panel .column-video-cover{width:auto;margin:0!important}
.video-panel .magnet-links .columns{padding-block:0!important}
}
.column-video-cover>a{position:relative;display:block;height:100%}
.column-video-cover .cover-container:after{height:100%}
.column-video-cover img{height:100%;max-height:none;width:100%;object-fit:contain}
.movie-panel-info .panel-block{margin-top:0;padding:.5rem 0!important}
.movie-panel-info .panel-block:last-child{border-bottom:none!important}
.movie-panel-info .copy-to-clipboard{height:1.5rem;width:1.5rem;padding:0}
.movie-panel-info .review-buttons>.panel-block:nth-child(2){display:none}
.video-meta-panel~.columns>.column{padding-bottom:0}
.message-body{padding:.5rem}
.video-panel .tile-images{grid-gap:.5rem;font-size:0}
.video-panel .preview-images a{aspect-ratio:4/3}
.video-panel .preview-images img{object-fit:cover;height:100%!important;width:100%!important}
.preview-video-container span{z-index:1}
.preview-video-container:hover span{z-index:auto}
.preview-video-container:after{height:100%}
#tabs-container{margin-top:-1rem}
#tabs-container .message{margin-bottom:0}
#tabs-container .message-body{padding:0}
#magnets-content>.columns,#magnets-content>.columns .buttons:last-child{margin:0}
@media only screen and (max-width:480px){
.video-panel .magnet-links .item .magnet-name{padding-top:.75rem}
}
.video-panel .magnet-links .columns .buttons .button{margin-bottom:.75rem}
#magnets-content :is(.item,.item.odd):hover{background:unset!important}
.review-items .review-item{padding:.75rem}
.video-panel .tile-small .tile-item{display:flex;flex-direction:column}
.video-panel .tile-small img{flex:1;object-fit:cover}
.payment-form{padding:1rem}
.form-panel .user-profile,.payment-form .payment-total{padding:0}
`);
