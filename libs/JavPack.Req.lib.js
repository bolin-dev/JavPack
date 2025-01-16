/**
 * @grant GM_xmlhttpRequest
 */
class Req {
  static defaultGetResponseType = "document";
  static defaultPostResponseType = "json";
  static defaultTimeout = 30000;
  static defaultMethod = "GET";

  static isPlainObj = (obj) => Object.prototype.toString.call(obj) === "[object Object]";

  static request(details) {
    if (typeof details === "string") details = { url: details };
    if (!details?.url) throw new Error("URL is required");

    details = { method: this.defaultMethod, timeout: this.defaultTimeout, ...details };
    const { params, method, data } = details;

    if (params) {
      const urlObj = new URL(details.url);
      const searchParams = new URLSearchParams(params);

      searchParams.forEach((val, key) => urlObj.searchParams.set(key, val));
      details.url = urlObj.toString();
      delete details.params;
    }

    if (method === "POST") {
      details.responseType ??= this.defaultPostResponseType;

      if (this.isPlainObj(data)) {
        const formData = new FormData();

        for (const [key, val] of Object.entries(data)) {
          if (!Array.isArray(val) && !this.isPlainObj(val)) {
            if (val !== undefined) formData.append(key, val);
            continue;
          }

          for (const k in val) {
            if (Object.hasOwnProperty.call(val, k)) formData.append(`${key}[${k}]`, val[k]);
          }
        }

        details.data = formData;
      }
    } else if (method === "GET") details.responseType ??= this.defaultGetResponseType;

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        ontimeout: () => reject(new Error(`Request timed out for ${details.url}`)),
        onerror: () => reject(new Error(`Request error for ${details.url}`)),
        onload: ({ status, finalUrl, response }) => {
          if (status >= 400) reject(new Error(`Request failed with status ${status} for ${details.url}`));
          if (method === "HEAD") resolve(finalUrl);
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
    }
    return res;
  }
}
