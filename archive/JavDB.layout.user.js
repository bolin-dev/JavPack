// ==UserScript==
// @name            JavDB.layout
// @namespace       JavDB.layout@blc
// @version         0.0.1
// @author          blc
// @description     布局调整
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @resource        layout https://github.com/bolin-dev/JavPack/raw/main/static/JavDB.layout.user.css
// @run-at          document-start
// @grant           GM_getResourceText
// @grant           GM_addStyle
// ==/UserScript==

GM_addStyle(GM_getResourceText("layout"));
