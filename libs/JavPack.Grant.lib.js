class Grant {
  static openTab = (url, active = true) => GM_openInTab(url, { active, setParent: true });
}
