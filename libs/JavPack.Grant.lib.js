class Grant {
  static openTab = (url, active = true) => GM_openInTab(url, { active, setParent: true });

  static notify = ({ text, icon, tag }) => {
    const { name: defaultTitle, namespace: defaultTag, icon: defaultIcon } = GM_info.script;
    icon = icon ? GM_getResourceURL(icon) : defaultIcon;
    tag = tag ? `${defaultTag}:${tag}` : defaultTag;

    GM_notification({
      silent: true,
      timeout: 3000,
      highlight: false,
      title: defaultTitle,
      image: icon,
      text,
      tag,
    });
  };
}
