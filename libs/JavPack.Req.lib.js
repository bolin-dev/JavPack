/**
 * @grant GM_xmlhttpRequest
 */
class Req {
  static DEFAULT_GET_RESPONSE_TYPE = "document";
  static DEFAULT_POST_RESPONSE_TYPE = "json";
  static DEFAULT_TIMEOUT = 30000;
  static DEFAULT_METHOD = "GET";

  static _isRawBody = v => v instanceof FormData || v instanceof Blob || v instanceof ArrayBuffer || v instanceof URLSearchParams;

  static _isPlainObject = v => Object.prototype.toString.call(v) === "[object Object]";

  static _serializeToFormData(formData, data, parentKey = "") {
    Object.entries(data).forEach(([key, val]) => {
      const fullKey = parentKey ? `${parentKey}[${key}]` : key;
      if (val === undefined) return;

      if (val !== null && typeof val === "object" && !(val instanceof Blob || val instanceof Date)) {
        this._serializeToFormData(formData, val, fullKey);
      }
      else {
        formData.append(fullKey, val instanceof Date ? val.toISOString() : val);
      }
    });
  }

  static request(config) {
    let options;

    if (typeof config === "string") {
      options = { url: config };
    }
    else if (config !== null && typeof config === "object") {
      options = { ...config };
    }
    else {
      return Promise.reject(new TypeError("Request config must be a string or an object"));
    }

    if (!options.url) return Promise.reject(new Error("Request URL is required"));

    options.method = (options.method || this.DEFAULT_METHOD).toUpperCase();
    options.timeout ||= this.DEFAULT_TIMEOUT;
    const { params, method, data, signal } = options;

    try {
      const urlInstance = new URL(options.url, location.origin);

      if (params) {
        const cleanParams = this._isPlainObject(params) ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null)) : params;
        new URLSearchParams(cleanParams).forEach((v, k) => urlInstance.searchParams.set(k, v));
      }

      options.url = urlInstance.toString();
    }
    catch {
      return Promise.reject(new Error(`Invalid Request URL: ${options.url}`));
    }

    if (method === "POST") {
      options.responseType ??= this.DEFAULT_POST_RESPONSE_TYPE;

      if (this._isPlainObject(data) && !this._isRawBody(data)) {
        const formData = new FormData();
        this._serializeToFormData(formData, data);
        options.data = formData;
      }
    }
    else if (method === "GET") {
      options.responseType ??= options.url.split(/[?#]/)[0].endsWith(".json") ? "json" : this.DEFAULT_GET_RESPONSE_TYPE;
    }

    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));

      const { url: targetUrl } = options;
      let xhrHandler;

      const handleAbort = () => xhrHandler?.abort();

      const finalize = (settleFn, ...args) => {
        signal?.removeEventListener("abort", handleAbort);
        settleFn(...args);
      };

      xhrHandler = GM_xmlhttpRequest({
        onabort: () => reject(new DOMException("Aborted", "AbortError")),
        ontimeout: () => finalize(reject, new Error(`Timeout: ${targetUrl}`)),
        onerror: () => finalize(reject, new Error(`Network Error: ${targetUrl}`)),
        onload: ({ status, finalUrl, response }) => (status >= 400 ? finalize(reject, new Error(`HTTP ${status}: ${targetUrl}`)) : finalize(resolve, method === "HEAD" ? finalUrl : response)),
        ...options,
        params: undefined,
      });

      signal?.addEventListener("abort", handleAbort, { once: true });
    });
  }

  static async tasks(initial, steps, signal) {
    let ctx = initial;

    for (const step of steps) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      if (typeof ctx === "string" || ctx?.url) ctx = await this.request(typeof ctx === "string" ? { url: ctx, signal } : { ...ctx, signal });
      ctx = await step(ctx);
    }

    return ctx;
  }
}
