function request(details = {}) {
  const defaults = {
    url: "",
    data: {},
    headers: {},
    method: "GET",
    timeout: 10000,
  };
  Object.assign(defaults, details);

  if (!defaults.url) throw new Error("Invalid URL");
  if (!["HEAD", "GET", "POST"].includes(defaults.method)) throw new Error("Invalid Method");

  if (defaults.method === "GET") {
    defaults.responseType ??= "document";
    defaults.url = buildQueryString(defaults.url, defaults.data);
  }

  if (defaults.method === "POST") {
    defaults.responseType ??= "json";
    defaults.headers["Content-Type"] ??= "application/x-www-form-urlencoded";

    if (defaults.headers["Content-Type"].includes("application/json")) {
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
    const responseType = responseHeaders.split("\r\n").find(item => item.startsWith("content-type:"));

    if (status >= 400) {
      resolve(false);
    } else if (defaults.method === "HEAD") {
      resolve(status);
    } else if (responseType.includes("text/html") && defaults.responseType !== "document") {
      const parser = new DOMParser();
      resolve(parser.parseFromString(response, "text/html"));
    } else if (responseType.includes("application/json") && defaults.responseType !== "json") {
      resolve(JSON.parse(response));
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

async function taskQueue(details, steps = []) {
  let currentDetails = parseDetails(details);
  let currentRes;

  for (const step of steps) {
    currentRes = await request(currentDetails);
    if (currentRes && step) currentRes = step?.(currentRes);
    if (!currentRes) break;

    currentDetails = parseDetails(currentRes);
  }

  return currentRes;
}

function parseDetails(data) {
  return typeof data === "string" ? { url: data } : data;
}
