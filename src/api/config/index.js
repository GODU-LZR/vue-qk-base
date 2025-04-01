import axios from 'axios';
import { getClientFingerprint } from '@/api/modules/auth'; // 假设你的 auth.js 在 services 目录

// 创建axios实例
const instance = axios.create({
    baseURL: 'http://localhost:8081/api', // 你的 API 网关地址
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 请求拦截器
// === 将拦截器函数改为 async ===
instance.interceptors.request.use(
    async config => { // <--- 改为 async
        // 获取token
        const token = localStorage.getItem('auth_token');

        if (token) {
            // 添加 Authorization 头
            config.headers['Authorization'] = `Bearer ${token}`;

            // === 新增：如果携带 token，则计算并添加指纹头 ===
            try {
                const fingerprint = await getClientFingerprint(); // 计算当前指纹
                config.headers['X-Client-Fingerprint'] = fingerprint; // 添加自定义头
                console.log("请求拦截器添加的指纹头:", fingerprint); // 调试信息
            } catch (error) {
                console.error("无法在请求拦截器中获取客户端指纹:", error);
                // 根据策略决定是否阻止请求或继续（不带指纹头）
                return Promise.reject(new Error("无法获取客户端指纹")); // 阻止请求
            }
            // === 新增结束 ===
        }

        // 排除登录请求自身携带指纹头（登录是在 payload 中传递）
        // 虽然上面的逻辑是 if(token)，登录请求理论上不应该有 token，但为了更明确可以加个判断
        if (config.url === '/user/login') {
            delete config.headers['X-Client-Fingerprint']; // 确保登录请求不带指纹头
        }


        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器 (保持不变)
instance.interceptors.response.use(
    // ... 你原来的响应拦截器逻辑 ...
    response => {
        // 检查后端返回的通用结构，如果存在 code 且不为成功码 (假设 200 为成功)
        // 这取决于你的后端 API 设计
        if (response.data && response.data.code && response.data.code !== 200) {
            console.warn('API returned non-success code:', response.data);
            // 可以将后端返回的错误信息包装成 Promise reject
            return Promise.reject({
                success: false,
                status: response.status, // HTTP 状态码
                message: response.data.message || '操作失败', // 后端消息
                code: response.data.code, // 后端业务码
                data: response.data.data // 可能的错误详情
            });
        }
        // 如果后端直接返回数据，或者 code 是 200
        return response.data; // 直接返回 data 部分
    },
    error => {
        // ... 你原来的错误处理逻辑 ...
        if (error.response) {
            // 处理401错误（未授权）
            if (error.response.status === 401) {
                console.warn('收到 401 未授权响应, 可能 token 失效或指纹不匹配');
                // 可以在这里处理登出逻辑
                localStorage.removeItem('auth_token');
                // 如果有Vue Router实例，可以跳转到登录页
                // router.push('/login'); // 取消注释如果你使用了 Vue Router
            }

            // 处理其他HTTP错误
            return Promise.reject({
                success: false,
                status: error.response.status,
                // 尝试从 error.response.data 获取后端返回的详细错误信息
                message: error.response.data?.message || error.response.statusText || '请求失败',
                code: error.response.data?.code, // 如果后端返回 code
                data: error.response.data // 后端返回的完整 data
            });
        }

        // 处理请求超时
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            console.error('请求超时:', error);
            return Promise.reject({
                success: false,
                message: '请求超时，请稍后重试'
            });
        }

        // 处理网络错误
        if (!window.navigator.onLine) {
            console.error('网络错误:', error);
            return Promise.reject({
                success: false,
                message: '网络连接已断开，请检查您的网络'
            });
        }

        // 其他未知错误
        console.error('未知请求错误:', error);
        return Promise.reject({
            success: false,
            message: error.message || '发生未知错误'
        });
    }
);

// 导出 axios 实例 (保持不变)
export default {
    axios: instance,
    apiBaseUrl: 'http://localhost:8081/api'
};


