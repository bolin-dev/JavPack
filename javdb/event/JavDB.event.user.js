// ==UserScript==
// @name            JavDB.event
// @namespace       JavDB.event@blc
// @version         0.0.1
// @author          blc
// @description     一些快捷动作
// @include         /^https:\/\/javdb\d*\.com\/.*$/
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-end
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  // 新标签页面（前台）
  const activeWindow = e => {
    const target = e.target.closest("a");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    GM_openInTab(target.href, { active: true, setParent: true });
  };

  // 新标签页面（后台）
  const inactiveWindow = e => {
    const target = e.target.closest("a");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    GM_openInTab(target.href, { setParent: true });
  };

  // 导航
  const jump = e => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.nodeName)) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        document.querySelector(".pagination .pagination-previous")?.click();
        break;
      case "ArrowRight":
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        document.querySelector(".pagination .pagination-next")?.click();
        break;
      case "/":
        document.querySelector("#video-search")?.focus();
        break;
    }
  };

  // 搜索
  const search = async e => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.nodeName)) return;

    if (e.ctrlKey && e.key === "/") {
      const text = await navigator.clipboard.readText();
      if (text)
        GM_openInTab(`${location.origin}/search?q=%s`.replaceAll("%s", text), {
          active: true,
          setParent: true,
        });
    }
  };

  autoListener([
    {
      path: "_global",
      events: {
        keyup: jump,
        keydown: search,
      },
    },
    {
      path: "_global",
      container: ":is(.movie-list, .actors, .section-container)",
      events: {
        click: activeWindow,
        contextmenu: inactiveWindow,
      },
    },
  ]);
})();
