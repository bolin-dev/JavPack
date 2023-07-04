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
  };
  Object.assign(defaults, details);

  if (!defaults.url) throw new Error("Invalid URL");
  if (!METHODS.includes(defaults.method)) throw new Error("Invalid Method");

  if (defaults.method === "GET") {
    defaults.responseType ??= "document";
    defaults.url = buildQueryString(defaults.url, defaults.data);
  }

  if (defaults.method === "POST") {
    defaults.responseType ??= "json";

    if (defaults.headers?.["Content-Type"].includes("application/json")) {
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
  const urlObj = new URL(url);
  urlObj.search = buildQueryStringParams(data, urlObj.searchParams);
  return urlObj.toString();
}

function buildQueryStringParams(data, params = new URLSearchParams()) {
  for (const [key, value] of Object.entries(data)) {
    params.append(key, value);
  }
  return params.toString();
}

async function taskQueue({ url, steps = [] }) {
  if (!url || typeof url !== "string") throw new Error("Invalid URL");
  if (!Array.isArray(steps)) throw new Error("Steps should be an array");

  let currentRes = url;

  for (const step of steps) {
    currentRes = await webScraper({ url: currentRes, ...step });
    if (!currentRes) break;
  }

  return currentRes;
}

async function webScraper({ url, getRes }) {
  let res = await request({ url });
  if (res && getRes) res = getRes(res);
  return res;
}
