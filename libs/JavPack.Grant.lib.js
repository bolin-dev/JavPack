class Grant {
  static openTab = (url, active = true) => GM_openInTab(url, { active, setParent: true });

  static notify = (options) => {
    if (typeof options === "string") options = { text: options };
    options.text = options.text ?? options.msg;
    if (!options.text) return;

    if (!options.image) {
      const icon = options.icon ?? options.status;
      options.image = icon ? GM_getResourceURL(icon) : GM_info.script.icon;
    }

    GM_notification({
      tag: GM_info.script.namespace,
      title: GM_info.script.name,
      silent: true,
      timeout: 3000,
      highlight: false,
      ...options,
    });
  };
}
