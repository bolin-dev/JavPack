class Grant {
  static openTab = (url, active = true) => GM_openInTab(url, { active, setParent: true });

  static notify = ({ icon: image, ...details }) => {
    const { name: title, namespace: tag, icon } = GM_info.script;
    image = image ? GM_getResourceURL(image) : icon;

    GM_notification({
      tag,
      image,
      title,
      silent: true,
      timeout: 3000,
      highlight: false,
      ...details,
    });
  };
}
