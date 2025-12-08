import { createClient } from '@supabase/supabase-js';

// 获取环境变量
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// 如果没有配置 Key，则返回 null，后续服务会降级处理
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;