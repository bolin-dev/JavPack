class Req {
  static isPlainObj = (obj) => {
    return Object.prototype.toString.call(obj) === "[object Object]";
  };

  static request(details) {
    if (typeof details === "string") details = { url: details };
    details = { method: "GET", timeout: 10000, ...details };

    if (details.params) {
      const url = new URL(details.url);
      const searchParams = new URLSearchParams(details.params);

      url.search = searchParams.toString();
      details.url = url.toString();

      delete details.params;
    }

    if (details.method === "POST") {
      details.responseType ??= "json";

      if (this.isPlainObj(details.data)) {
        const formData = new FormData();

        for (const [key, val] of Object.entries(details.data)) {
          if (Array.isArray(val)) {
            val.forEach((v, i) => formData.append(`${key}[${i}]`, v));
            continue;
          }

          if (this.isPlainObj(val)) {
            for (const [k, v] of Object.entries(val)) {
              formData.append(`${key}[${k}]`, v);
            }
            continue;
          }

          formData.append(key, val);
        }

        details.data = formData;
      }
    }

    if (details.method === "GET") details.responseType ??= "document";

    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        onload: ({ status, finalUrl, response }) => {
          if (status >= 400) resolve(false);
          if (details.method === "HEAD") resolve(finalUrl);
          resolve(response);
        },
        ...details,
      });
    });
  }

  static async tasks(res, steps) {
    for (const step of steps) {
      res = await this.request(res);
      if (!res) break;

      if (step) {
        res = step(res);
        if (!res) break;
      }
    }
    return res;
  }
}
