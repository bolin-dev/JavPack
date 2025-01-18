const magnetOptions = {
  filter: ({ size }) => {
    const magnetSize = parseFloat(size);
    return magnetSize > 314572800 || magnetSize < 1;
  },
  sort: (a, b) => {
    if (a.zh !== b.zh) return a.zh ? -1 : 1;
    if (a.crack !== b.crack) return a.crack ? -1 : 1;

    const aSize = parseFloat(a.size);
    const bSize = parseFloat(b.size);

    const aDiff = Math.abs(aSize - 3221225472);
    const bDiff = Math.abs(bSize - 3221225472);

    return aDiff !== bDiff ? aDiff - bDiff : bSize - aSize;
  },
  max: 10,
};

export default (config) => {
  return config.map((item) => {
    return { ...item, magnetOptions };
  });
};
