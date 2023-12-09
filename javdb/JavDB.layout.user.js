// ==UserScript==
// @name            JavDB.layout
// @namespace       JavDB.layout@blc
// @version         0.0.1
// @author          blc
// @description     布局调整
// @match           https://javdb.com/*
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @resource        layout file:///Users/bolinc/Projects/JavPack/javdb/JavDB.layout.user.css
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

GM_addStyle(GM_getResourceText("layout"));
