class Grant {
  static openTab = (url, active = true) => GM_openInTab(url, { active, setParent: true });

  static notify = ({ tag, icon: image, ...details }) => {
    const { name: title, namespace, icon } = GM_info.script;
    tag = tag ? `${namespace}:${tag}` : namespace;
    image = image ? GM_getResourceURL(image) : icon;

    GM_notification({
      title,
      silent: true,
      timeout: 3000,
      highlight: false,
      ...details,
      image,
      tag,
    });
  };
}
