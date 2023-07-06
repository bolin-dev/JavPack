function autoListener(options) {
  const filtered = options.filter(({ path }) => {
    return (
      path === "_global" ||
      path === location.pathname ||
      path?.test?.(location.pathname) ||
      path?.(location)
    );
  });

  for (let index = 0, { length } = filtered; index < length; index++) {
    let { container, events } = filtered[index];

    if (!container) container = document;
    if (typeof container === "string") container = document.querySelector(container);
    if (!container) continue;

    for (const [type, listener] of Object.entries(events)) {
      container.addEventListener(type, listener);
    }
  }
}
