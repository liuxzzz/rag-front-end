/**
 * 环境变量验证工具
 * 用于验证必需的环境变量是否存在且有效
 */

export interface EnvConfig {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_APP_ID: string;
  NODE_ENV: string;
}

/**
 * 验证环境变量
 * @returns 验证后的环境变量配置
 * @throws Error 如果必需的环境变量缺失或无效
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // 验证 DASHSCOPE_API_KEY
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    errors.push('DASHSCOPE_API_KEY 环境变量缺失');
  } else if (apiKey.length < 10) {
    errors.push('DASHSCOPE_API_KEY 格式无效（长度太短）');
  }
  
  // 验证 DASHSCOPE_APP_ID
  const appId = process.env.DASHSCOPE_APP_ID;
  if (!appId) {
    errors.push('DASHSCOPE_APP_ID 环境变量缺失');
  } else if (appId.length < 5) {
    errors.push('DASHSCOPE_APP_ID 格式无效（长度太短）');
  }
  
  // 验证 NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(nodeEnv)) {
    errors.push(`NODE_ENV 必须是以下之一: ${validEnvs.join(', ')}`);
  }
  
  if (errors.length > 0) {
    throw new Error(`环境变量验证失败:\n${errors.map(e => `- ${e}`).join('\n')}`);
  }
  
  return {
    DASHSCOPE_API_KEY: apiKey!,
    DASHSCOPE_APP_ID: appId!,
    NODE_ENV: nodeEnv
  };
}

/**
 * 安全地获取环境变量（用于日志记录）
 * 隐藏敏感信息
 */
export function getEnvForLogging() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const appId = process.env.DASHSCOPE_APP_ID;
  
  return {
    DASHSCOPE_API_KEY: apiKey ? `${apiKey.slice(0, 8)}...` : 'NOT_SET',
    DASHSCOPE_APP_ID: appId ? `${appId.slice(0, 6)}...` : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  };
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}
