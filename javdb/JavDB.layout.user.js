// ==UserScript==
// @name            JavDB.layout
// @namespace       JavDB.layout@blc
// @version         0.0.1
// @author          blc
// @description     布局调整
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @resource        layout https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.layout.user.css
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_getResourceText
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

GM_addStyle(GM_getResourceText("layout"));
