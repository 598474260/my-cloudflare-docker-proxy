addEventListener("fetch", (event) => {
  event.passThroughOnException();
  event.respondWith(handleRequest(event.request));
});

// 环境变量配置，提供硬编码默认值
const CUSTOM_DOMAIN = "workers.dev";  // 使用默认Worker域名
const MODE = "production";            // 硬编码默认值
const TARGET_UPSTREAM = "";           // 硬编码默认值

// Worker信息（根据你的实际配置修改）
const WORKER_NAME = "my-cloudflare-docker-proxy";
const USERNAME = "598474260"; // 你的实际Cloudflare用户ID

const dockerHub = "https://registry-1.docker.io";

// Gemini API配置
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = typeof globalThis.GEMINI_API_KEY !== 'undefined' ? globalThis.GEMINI_API_KEY : 'YOUR_GEMINI_API_KEY';

// 根据文档配置：支持代理单个registry
const routes = {
  // 使用默认Worker域名，只代理Docker Hub
  [`${WORKER_NAME}.${USERNAME}.workers.dev`]: dockerHub,
  
  // 保留原有的多域名支持（如果需要的话）
  ["docker." + CUSTOM_DOMAIN]: dockerHub,
  ["quay." + CUSTOM_DOMAIN]: "https://quay.io",
  ["gcr." + CUSTOM_DOMAIN]: "https://gcr.io",
  ["k8s-gcr." + CUSTOM_DOMAIN]: "https://k8s.gcr.io",
  ["k8s." + CUSTOM_DOMAIN]: "https://registry.k8s.io",
  ["ghcr." + CUSTOM_DOMAIN]: "https://ghcr.io",
  ["cloudsmith." + CUSTOM_DOMAIN]: "https://docker.cloudsmith.io",
  ["ecr." + CUSTOM_DOMAIN]: "https://public.ecr.aws",

  // staging
  ["docker-staging." + CUSTOM_DOMAIN]: dockerHub,
};

function routeByHosts(host) {
  if (host in routes) {
    return routes[host];
  }
  if (MODE == "debug") {
    return TARGET_UPSTREAM;
  }
  return "";
}

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 处理OPTIONS请求（CORS预检）
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-goog-api-key',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  // 检查是否是Gemini API请求 - 优先处理
  if (url.pathname.startsWith('/gemini/')) {
    return await handleGeminiAPI(request, url);
  }
  
  // 检查是否是根路径
  if (url.pathname == "/") {
    return new Response(
      JSON.stringify({
        routes: routes,
        message: "Docker Registry Proxy is running",
        status: "active",
        features: ["docker-registry", "gemini-api"],
        endpoints: {
          "gemini": "/gemini/",
          "docker": "/v2/",
          "example": "/gemini/v1beta/models/gemini-2.0-flash:generateContent"
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
  
  // 处理 /v2/ 路径 - 直接代理到Docker Registry，不重定向
  if (url.pathname == "/v2/") {
    const upstream = routeByHosts(url.hostname);
    if (upstream) {
      return await handleDockerRegistry(request, url, upstream);
    }
  }
  
  // 原有的Docker Registry代理逻辑
  const upstream = routeByHosts(url.hostname);
  if (upstream === "") {
    return new Response(
      JSON.stringify({
        error: "Route not found",
        message: "This path is not configured for proxy",
        available_routes: Object.keys(routes),
        gemini_endpoint: "/gemini/"
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
  
  // 继续原有的Docker Registry代理逻辑
  return await handleDockerRegistry(request, url, upstream);
}

// 处理Gemini API请求
async function handleGeminiAPI(request, url) {
  try {
    // 移除 /gemini/ 前缀，获取实际的API路径
    const apiPath = url.pathname.replace('/gemini/', '');
    const geminiUrl = `${GEMINI_API_ENDPOINT}${apiPath ? '/' + apiPath : ''}`;
    
    // 创建新的请求
    const newRequest = new Request(geminiUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: request.method !== 'GET' ? await request.text() : undefined
    });
    
    // 转发请求到Gemini API
    const response = await fetch(newRequest);
    
    // 返回响应，添加CORS头
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-goog-api-key'
      }
    });
    
    return newResponse;
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to proxy Gemini API request",
        message: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// 处理Docker Registry请求（原有的逻辑）
async function handleDockerRegistry(request, url, upstream) {
  const isDockerHub = upstream == dockerHub;
  const authorization = request.headers.get("Authorization");
  
  if (url.pathname == "/v2/") {
    const newUrl = new URL(upstream + "/v2/");
    const headers = new Headers();
    if (authorization) {
      headers.set("Authorization", authorization);
    }
    // check if need to authenticate
    const resp = await fetch(newUrl.toString(), {
      method: "GET",
      headers: headers,
      redirect: "follow",
    });
    if (resp.status === 401) {
      return responseUnauthorized(url);
    }
    return resp;
  }
  
  // get token
  if (url.pathname == "/v2/auth") {
    const newUrl = new URL(upstream + "/v2/");
    const resp = await fetch(newUrl.toString(), {
      method: "GET",
      redirect: "follow",
    });
    if (resp.status !== 401) {
      return resp;
    }
    const authenticateStr = resp.headers.get("WWW-Authenticate");
    if (authenticateStr === null) {
      return resp;
    }
    const wwwAuthenticate = parseAuthenticate(authenticateStr);
    let scope = url.searchParams.get("scope");
    // autocomplete repo part into scope for DockerHub library images
    // Example: repository:busybox:pull => repository:library/busybox:pull
    if (scope && isDockerHub) {
      let scopeParts = scope.split(":");
      if (scopeParts.length == 3 && !scopeParts[1].includes("/")) {
        scopeParts[1] = "library/" + scopeParts[1];
        scope = scopeParts.join(":");
      }
    }
    return await fetchToken(wwwAuthenticate, scope, authorization);
  }
  
  // redirect for DockerHub library images
  // Example: /v2/busybox/manifests/latest => /v2/library/busybox/manifests/latest
  if (isDockerHub) {
    const pathParts = url.pathname.split("/");
    if (pathParts.length == 5) {
      pathParts.splice(2, 0, "library");
      const redirectUrl = new URL(url);
      redirectUrl.pathname = pathParts.join("/");
      return Response.redirect(redirectUrl, 301);
    }
  }
  
  // foward requests
  const newUrl = new URL(upstream + url.pathname);
  const newReq = new Request(newUrl, {
    method: request.method,
    headers: request.headers,
    // don't follow redirect to dockerhub blob upstream
    redirect: isDockerHub ? "manual" : "follow",
  });
  const resp = await fetch(newReq);
  if (resp.status == 401) {
    return responseUnauthorized(url);
  }
  // handle dockerhub blob redirect manually
  if (isDockerHub && resp.status == 307) {
    const location = new URL(resp.headers.get("Location"));
    const redirectResp = await fetch(location.toString(), {
      method: "GET",
      redirect: "follow",
    });
    return redirectResp;
  }
  return resp;
}

function parseAuthenticate(authenticateStr) {
  // sample: Bearer realm="https://auth.ipv6.docker.com/token",service="registry.docker.io"
  // match strings after =" and before "
  const re = /(?<=\=")(?:\\.|[^"\\])*(?=")/g;
  const matches = authenticateStr.match(re);
  if (matches == null || matches.length < 2) {
    throw new Error(`invalid Www-Authenticate Header: ${authenticateStr}`);
  }
  return {
    realm: matches[0],
    service: matches[1],
  };
}

async function fetchToken(wwwAuthenticate, scope, authorization) {
  const url = new URL(wwwAuthenticate.realm);
  if (wwwAuthenticate.service.length) {
    url.searchParams.set("service", wwwAuthenticate.service);
  }
  if (scope) {
    url.searchParams.set("scope", scope);
  }
  const headers = new Headers();
  if (authorization) {
    headers.set("Authorization", authorization);
  }
  return await fetch(url, { method: "GET", headers: headers });
}

function responseUnauthorized(url) {
  const headers = new Headers();
  headers.set(
    "Www-Authenticate",
    `Bearer realm="https://${url.hostname}/v2/auth",service="cloudflare-docker-proxy"`
  );
  return new Response(JSON.stringify({ message: "UNAUTHORIZED" }), {
    status: 401,
    headers: headers,
  });
}
