class Req {
  static defaultDetails = { method: "GET", timeout: 10000 };

  static isPlainObj = (obj) => Object.prototype.toString.call(obj) === "[object Object]";

  static request(details) {
    if (typeof details === "string") details = { url: details };
    if (!details.url) throw new Error("URL is required");

    details = { ...this.defaultDetails, ...details };
    const { params, method, data } = details;

    if (params) {
      const url = new URL(details.url);
      const searchParams = new URLSearchParams(params);

      searchParams.forEach((val, key) => url.searchParams.append(key, val));
      details.url = url.toString();

      delete details.params;
    }

    if (method === "POST") {
      details.responseType ??= "json";

      if (this.isPlainObj(data)) {
        const formData = new FormData();

        for (const [key, val] of Object.entries(data)) {
          if (!Array.isArray(val) && !this.isPlainObj(val)) {
            formData.append(key, val);
            continue;
          }

          for (const k in val) {
            if (Object.hasOwnProperty.call(val, k)) formData.append(`${key}[${k}]`, val[k]);
          }
        }

        details.data = formData;
      }
    } else if (method === "GET") details.responseType ??= "document";

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        ontimeout: () => reject(new Error("Request timeout")),
        onerror: () => reject(new Error("Request error")),
        onload: ({ status, finalUrl, response }) => {
          if (status >= 400) reject(new Error(`Request failed with status ${status} for ${finalUrl}`));

          if (method === "HEAD") {
            finalUrl.includes("removed") ? reject(new Error("Removed content")) : resolve(finalUrl);
          }

          resolve(response);
        },
        ...details,
      });
    });
  }

  static async tasks(res, steps) {
    for (let index = 0, { length } = steps; index < length; index++) {
      res = await this.request(res);
      res = steps[index](res);
      if (!res) throw new Error("No result found");
    }
    return res;
  }
}
