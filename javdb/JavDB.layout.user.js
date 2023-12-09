// ==UserScript==
// @name            JavDB.layout
// @namespace       JavDB.layout@blc
// @version         0.0.1
// @description     布局调整
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @author          blc
// @resource        layout file:///Users/bolinc/Projects/JavPack/javdb/JavDB.layout.user.css
// @match           https://javdb.com/*
// @run-at          document-start
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

GM_addStyle(GM_getResourceText("layout"));
