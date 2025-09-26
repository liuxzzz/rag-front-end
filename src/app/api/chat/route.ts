import { NextRequest, NextResponse } from 'next/server';
import { validateEnv, getEnvForLogging, isProduction } from '@/lib/env-validation';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '无效的消息' }, { status: 400 });
    }

    // 验证环境变量
    let env;
    try {
      env = validateEnv();
    } catch (error) {
      console.error('环境变量验证失败:', error instanceof Error ? error.message : error);
      if (!isProduction()) {
        console.log('当前环境变量状态:', getEnvForLogging());
      }
      return NextResponse.json({ error: 'API 配置错误，请检查环境变量设置' }, { status: 500 });
    }

    const { DASHSCOPE_API_KEY: apiKey, DASHSCOPE_APP_ID: appId } = env;

    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

    const data = {
      input: {
        prompt: message // 使用用户输入的消息
      },
      parameters: {
        'incremental_output': true // 增量输出
      },
      debug: {}
    };

    // 创建 ReadableStream 用于 SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // 发送初始响应
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: '' })}\n\n`)
          );

          // 调用 DashScope API
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'X-DashScope-SSE': 'enable' // 启用流式输出
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('无法读取响应流');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data:')) {
                const dataStr = line.slice(5).trim();
                
                if (dataStr === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  return;
                }

                try {
                  const parsed = JSON.parse(dataStr);
                  
                  // 处理 DashScope 的响应格式
                  if (parsed.output && parsed.output.text) {
                    const content = parsed.output.text;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch (parseError) {
                  console.error('解析 SSE 数据失败:', parseError, 'Data:', dataStr);
                }
              }
            }
          }

          // 发送结束信号
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: '生成响应时出错: ' + (error as Error).message })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
