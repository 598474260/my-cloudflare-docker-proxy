addEventListener("fetch", (event) => {
  event.passThroughOnException();
  event.respondWith(handleRequest(event.request));
});

// Gemini API配置
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // 需要替换为你的实际API密钥

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 检查是否是Gemini API请求
  if (url.pathname.startsWith('/gemini/')) {
    return await handleGeminiAPI(request, url);
  }
  
  // 返回API信息
  if (url.pathname === "/") {
    return new Response(
      JSON.stringify({
        message: "Gemini API Proxy is running",
        status: "active",
        endpoints: {
          "gemini": "/gemini/",
          "example": "/gemini/v1beta/models/gemini-2.0-flash:generateContent"
        },
        usage: "Send requests to /gemini/ followed by the Gemini API path"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
  
  return new Response(
    JSON.stringify({
      error: "Not found",
      message: "Use /gemini/ endpoint for Gemini API requests"
    }),
    {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
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