function request(url, options = {}) {
  if (!url) throw new Error("Invalid URL");

  options = { method: "GET", timeout: 10000, ...options };
  if (!["HEAD", "GET", "POST"].includes(options.method)) throw new Error("Invalid Method");

  if (options.method === "GET") {
    options.responseType ??= "document";

    if (options.params) {
      const params = options.params;
      if (Object.keys(params).length) {
        url = new URL(url);
        for (const [key, value] of Object.entries(params)) url.searchParams.append(key, value);
        url = url.toString();
      }
      delete options.params;
    }
  }

  if (options.method === "POST") {
    options.responseType ??= "json";

    if (options.headers["Content-Type"].includes("application/json")) {
      options.data = JSON.stringify(options.data);
    } else if (Object.prototype.toString.call(options.data) === "[object Object]") {
      const formData = new FormData();
      for (const [key, value] of Object.entries(options.data)) formData.append(key, value);
      options.data = formData;
    }
  }

  return new Promise(resolve => {
    GM_xmlhttpRequest({
      url,
      ...options,
      onerror: () => resolve(false),
      ontimeout: () => resolve(false),
      onload: ({ status, responseHeaders, response }) => {
        const responseType = responseHeaders.split("\r\n").find(item => item.startsWith("content-type:"));

        if (status >= 400) {
          resolve(false);
        } else if (options.method === "HEAD") {
          resolve(status);
        } else if (responseType.includes("text/html") && options.responseType !== "document") {
          const parser = new DOMParser();
          resolve(parser.parseFromString(response, "text/html"));
        } else if (responseType.includes("application/json") && options.responseType !== "json") {
          resolve(JSON.parse(response));
        } else {
          resolve(response);
        }
      },
    });
  });
}

async function taskQueue(res, steps) {
  for (const step of steps) {
    res = await request(res);
    if (!res) break;
    if (res && step) res = await step?.(res);
  }
  return res;
}
