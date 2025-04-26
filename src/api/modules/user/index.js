// src/api/modules/user/index.js

import config from '@/api/config'; // 导入 Axios 配置
const { axios } = config;

/**
 * 调用后端接口获取当前登录用户的头像 URL
 * @returns {Promise<string | null>} 返回头像 URL 字符串，如果失败或未设置则返回 null
 */
export const getCurrentUserAvatarUrl = async () => {
    console.log('[API] Attempting to fetch current user avatar URL...');
    try {

        const response = await axios.get('/user/currentUser/avatar');

        // *** 正确的检查逻辑 ***
        // 1. 检查业务响应码是否成功 (code === 200)
        // 2. 检查 data 字段是否存在
        if (response && response.code === 200 && response.data != null) { // 检查 data 不为 null 或 undefined
            // 3. 检查 data (即头像URL) 是否为非空字符串
            if (typeof response.data === 'string' && response.data.trim().length > 0) {
                console.log('[API] Fetched avatar URL:', response.data);
                return response.data; // 返回 data 字段中的 URL 字符串
            } else {
                // code=200 但 data 为空字符串或非字符串
                console.log('[API] Avatar URL received but is empty or not a string:', response.data);
                return null;
            }
        } else {
            // code 不是 200 或者 data 字段不存在
            console.warn('[API] Received successful HTTP status but invalid business response or missing data:', response);
            // 可以选择抛出错误或返回 null
            // throw new Error(response?.message || '获取头像失败，响应无效');
            return null;
        }
        // *** 检查逻辑结束 ***

    } catch (error) {
        // API 调用失败 (网络错误、4xx/5xx 状态码等被拦截器处理后 reject)
        console.error('[API] Failed to fetch user avatar URL:', error);
        return null; // 返回 null，让组件显示默认头像
    }
};