// src/api/modules/notification/index.js

import config from '@/api/config';
const { axios } = config;

/**
 * 请求后端发送邮箱验证码
 * @param {string} email - 目标邮箱地址
 * @returns {Promise<{success: boolean, message?: string}>} - 操作结果
 */
export const sendVerificationCode = async (email) => {
    console.log('[API] Attempting to send verification code to:', email);
    try {
        // 后端接口 @RequestParam String email, 使用 POST 请求和 params
        await axios.post('/user/sendVerificationCode', null, {
            params: { email }
        });
        // 假设拦截器处理了非成功业务码，能到这里说明成功触发
        console.log('[API] Send verification code request successful');
        return { success: true };
    } catch (error) {
        // 错误由 Axios 拦截器处理并包装
        console.error('[API] Failed to send verification code:', error);
        return {
            success: false,
            message: error.message || '发送验证码失败，请稍后重试'
        };
    }
};