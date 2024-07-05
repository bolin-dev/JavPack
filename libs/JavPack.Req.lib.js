class Req {
  static isPlainObj = (obj) => Object.prototype.toString.call(obj) === "[object Object]";

  static request(details) {
    if (typeof details === "string") details = { url: details };
    if (!details.url) throw new Error("URL is required");
    details = { method: "GET", timeout: 10000, ...details };

    if (details.params) {
      const url = new URL(details.url);
      const searchParams = new URLSearchParams(details.params);

      searchParams.forEach((val, key) => url.searchParams.append(key, val));
      details.url = url.toString();
      delete details.params;
    }

    if (details.method === "POST") {
      details.responseType ??= "json";

      if (this.isPlainObj(details.data)) {
        const formData = new FormData();

        for (const [key, val] of Object.entries(details.data)) {
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
    }

    if (details.method === "GET") details.responseType ??= "document";

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        ontimeout: () => reject(new Error("Request timeout")),
        onerror: () => reject(new Error("Request error")),
        onload: ({ status, finalUrl, response }) => {
          if (status >= 400) {
            reject(new Error(`Request failed with status ${status} for ${finalUrl}`));
          }

          if (details.method === "HEAD") {
            finalUrl.includes("removed") ? reject(new Error("Removed content")) : resolve(finalUrl);
          }

          resolve(response);
        },
        ...details,
      });
    });
  }

  static async tasks(res, steps) {
    try {
      for (const step of steps) {
        if (!res) break;
        res = await this.request(res);
        res = step(res);
      }
      if (!res) throw new Error("No result found");
    } catch (err) {
      throw new Error(`Task failed: ${err.message}`);
    }

    return res;
  }
}
