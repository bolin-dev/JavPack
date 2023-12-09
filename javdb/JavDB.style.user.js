// ==UserScript==
// @name            JavDB.style
// @namespace       JavDB.style@blc
// @version         0.0.1
// @description     样式调整
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @author          blc
// @resource        style file:///Users/bolinc/Projects/JavPack/javdb/JavDB.style.user.css
// @match           https://javdb.com/*
// @run-at          document-start
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

GM_addStyle(GM_getResourceText("style"));
