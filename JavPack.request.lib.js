// ==UserScript==
// @name            JavPack.request
// @namespace       JavPack.request@blc
// @version         0.0.1
// @author          blc
// @description     请求数据
// @grant           GM_xmlhttpRequest
// @license         GPL-3.0-only
// ==/UserScript==

const METHODS = ["GET", "POST", "HEAD"];

function request(details = {}) {
  const defaults = {
    method: "GET",
    url: "",
    data: {},
    timeout: 10000,
    responseType: "document",
  };
  Object.assign(defaults, details);

  if (!defaults.url) throw new Error("url is required");
  if (!METHODS.includes(defaults.method)) throw new Error("invalid method");

  if (defaults.method === "GET") {
    defaults.url = buildQueryString(defaults.url, defaults.data);
  }

  if (defaults.method === "POST") {
    defaults.responseType ??= "json";

    if (defaults.headers?.["Content-Type"] === "application/json") {
      defaults.data = JSON.stringify(defaults.data);
    } else {
      defaults.data = buildQueryStringParams(defaults.data);
    }
  }

  return new Promise(resolve => {
    GM_xmlhttpRequest({
      ...defaults,
      onerror: () => resolve(false),
      ontimeout: () => resolve(false),
      onload: handleResponse(resolve, defaults),
    });
  });
}

function handleResponse(resolve, defaults) {
  return ({ status, responseHeaders, response }) => {
    if (status >= 400) {
      resolve(false);
    } else if (defaults.method === "HEAD") {
      resolve(true);
    } else if (responseHeaders.includes("application/json") && defaults.responseType !== "json") {
      resolve(JSON.parse(response));
    } else if (responseHeaders.includes("text/html") && defaults.responseType !== "document") {
      const parser = new DOMParser();
      resolve(parser.parseFromString(response, "text/html"));
    } else {
      resolve(response);
    }
  };
}

function buildQueryString(url, data) {
  const urlObject = new URL(url);
  urlObject.search = buildQueryStringParams(data, urlObject.searchParams);
  return urlObject.toString();
}

function buildQueryStringParams(data, params = new URLSearchParams()) {
  for (const [key, value] of Object.entries(data)) {
    params.append(key, value);
  }
  return params.toString();
}
