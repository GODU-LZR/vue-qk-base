import config from '@/api/config';
import jwtDecode from 'jwt-decode';


// 正确引用config中的axios实例
const { axios } = config;

/**
 * 计算字符串的 SHA-256 哈希值
 * @param {string} message - 需要计算哈希的字符串
 * @returns {Promise<string>} - 返回十六进制格式的哈希字符串
 */
async function sha256(message) {
    try {
        // 将字符串编码为 UTF-8 字节数组
        const msgBuffer = new TextEncoder().encode(message);
        // 使用 SubtleCrypto API 计算哈希值 (返回 ArrayBuffer)
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        // 将 ArrayBuffer 转换为字节数组
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // 将字节数组转换为十六进制字符串
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (error) {
        console.error("SHA-256 哈希计算失败:", error);
        // 在出错时返回一个可识别的错误值或 null/undefined
        return 'sha256_error';
    }
}

/**
 * 获取客户端指纹 (基于 User-Agent 的 SHA-256 哈希)
 * @returns {Promise<string>} - 返回指纹哈希字符串
 */
export async function getClientFingerprint() {
    // 获取 User-Agent 字符串，如果获取不到则使用 'unknown'
    const userAgent = navigator.userAgent || 'unknown_user_agent';
    console.log("User-Agent:", userAgent); // 调试信息
    // 计算 User-Agent 的 SHA-256 哈希作为指纹
    const fingerprintHash = await sha256(userAgent);
    console.log("计算出的客户端指纹哈希:", fingerprintHash); // 调试信息
    return fingerprintHash;
}


/**
 * 用户登录
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise} - 返回登录结果
 */
export const login = async (email, password) => {
    try {
        // === 新增：在发送登录请求前获取客户端指纹 ===
        const clientFingerprint = await getClientFingerprint();
        // === 新增结束 ===

        console.log("登录时发送的指纹:", clientFingerprint); // 调试信息

        // 使用axios而不是api
        const response = await axios.post('/user/login', {
            email,
            password,
            clientFingerprint // === 新增：将指纹添加到请求体 ===
        });

        // 假设后端返回的数据结构为 { code: 200, message: '操作成功', data: { token, userId } }
        // 注意：后端返回的 data 中可能只有 token，userId 需要从 token 解析
        // 确保你的后端登录接口确实返回了 token
        if (!response || !response.data || !response.data.token) {
            console.error('登录响应无效，未找到 token:', response);
            throw new Error('登录失败，响应无效');
        }
        const { token } = response.data; // 假设 data 中有 token 字段

        // 存储 token 到本地存储
        localStorage.setItem('auth_token', token);

        // 解析 token 中的用户信息 (你的 parseToken 函数)
        const userInfo = parseToken(token); // 使用你现有的 parseToken 函数

        // 确保 userInfo 解析成功
        if (!userInfo) {
            console.error('Token 解析失败:', token);
            // 清理无效的 token
            localStorage.removeItem('auth_token');
            throw new Error('登录成功，但无法解析用户信息');
        }

        return {
            success: true,
            // 返回解析后的用户信息，确保包含 userId
            data: { ...userInfo }
        };
    } catch (error) {
        // 清理可能已存储的无效 token
        localStorage.removeItem('auth_token');
        console.error('登录过程中出错:', error); // 打印更详细的错误
        return {
            success: false,
            // 优先使用 error 对象中的 message，否则提供通用消息
            message: error.message || '登录失败，请稍后重试',
            error // 可以选择性地返回原始错误对象用于调试
        };
    }
};


export const logout = async () => {
    try {
        // 获取 token
        const token = localStorage.getItem('auth_token');

        // 先清除本地存储的 token，避免后续路由守卫问题
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');

        // 如果没有token，直接返回成功
        if (!token) {
            return { success: true };
        }

        // 调用登出 API
        await axios.post('/user/logout', null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return {
            success: true
        };
    } catch (error) {
        console.error('Logout API error:', error);

        // 即使 API 调用失败，确保本地 token 已被清除
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');

        // 忽略401错误，因为这可能是token已经失效
        if (error.response && error.response.status === 401) {
            return { success: true };
        }

        return {
            success: false,
            message: error.response?.data?.message || '登出过程中遇到问题',
            error
        };
    }
};


/**
 * 解析 JWT token
 * @param {string} token - JWT token 字符串
 * @returns {Object} - 解析后的用户信息
 */
export const parseToken = (token) => {
    // ... 你之前的 parseToken 实现 ...
    // 确保它能正确解析后端生成的 JWT payload
    // 特别是 userId, username, email, status, roles, exp 等字段
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token format');
        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(jsonPayload);

        // 注意：确保这里的字段名 (userId, username, email, status, roles, iat, exp)
        // 与你后端 JwtUtil 生成 token 时放入 claims 的 key 一致！
        return {
            userId: decoded.userId, // 来自 claims.put("userId", ...)
            username: decoded.username, // 来自 claims.put("username", ...)
            email: decoded.email, // 来自 claims.put("email", ...)
            status: decoded.status, // 来自 claims.put("status", ...)
            // 后端存的是逗号分隔的字符串，前端解析为数组
            roles: decoded.roles ? decoded.roles.split(',') : [], // 来自 claims.put("roles", rolesStr)
            // 使用标准的 iat (Issued At) 和 exp (Expiration Time)
            issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null, // 来自 .setIssuedAt(now)
            expiration: decoded.exp ? new Date(decoded.exp * 1000) : null // 来自 .setExpiration(expiryDate)
        };
    } catch (error) {
        console.error('Token 解析失败:', error);
        localStorage.removeItem('auth_token'); // 解析失败时移除无效 token
        return null;
    }
};

/**
 * 检查 token 是否有效
 * @returns {boolean} - token 是否有效
 */
export function isTokenValid() {
    console.log('[isTokenValid - Original] Function called');
    const token = localStorage.getItem('auth_token');
    console.log('[isTokenValid - Original] Token from localStorage:', token);

    if (!token) {
        console.log('[isTokenValid - Original] No token found, returning false.');
        return false;
    }

    try {
        // --- JWT 解析和验证 ---
        console.log('[isTokenValid - Original] Attempting to decode token...');
        const decoded = jwtDecode(token); // 使用你的解码库
        console.log('[isTokenValid - Original] Decoded token:', decoded);

        if (!decoded.exp) {
            console.warn('[isTokenValid - Original] Token does not have an expiration claim (exp). Assuming valid.');
            return true; // 或者根据你的业务逻辑决定如何处理无 exp 的 token
        }

        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        console.log('[isTokenValid - Original] Current time (seconds):', currentTimeInSeconds);
        console.log('[isTokenValid - Original] Token expiration time (seconds):', decoded.exp);

        // 检查过期
        if (decoded.exp < currentTimeInSeconds) {
            console.log('[isTokenValid - Original] Token expired. exp:', decoded.exp, '< currentTime:', currentTimeInSeconds);
            // localStorage.removeItem('auth_token'); // 清除过期token
            return false;
        }

        console.log('[isTokenValid - Original] Token exists and is NOT expired, returning true.');
        return true;
        // --- JWT 解析结束 ---

    } catch (error) {
        console.error('[isTokenValid - Original] Error decoding or validating token:', error);
        // localStorage.removeItem('auth_token'); // 发生错误时也可能需要移除
        return false; // 解析或验证出错，视为无效
    }
}


/**
 * 刷新 token
 * @returns {Promise} - 返回刷新结果
 */
export const refreshToken = async () => {
    // 暂时不实现刷新 token 的功能，因为后端没有提供相应的接口
    throw new Error('后端未提供刷新 token 的接口');
};

/**
 * 获取当前登录用户信息
 * @returns {Object|null} - 用户信息或 null（如未登录）
 */
export const getCurrentUser = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    return parseToken(token);
};

/**
 * 检查用户是否有指定角色
 * @param {string} roleCode - 角色编码
 * @returns {boolean} - 是否拥有该角色
 */
export const hasRole = (roleCode) => {
    const user = getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.includes(roleCode);
};
