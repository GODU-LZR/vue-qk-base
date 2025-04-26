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
 * 用户登录 (更新：添加 verifyCode)
 * @param {string} email
 * @param {string} password
 * @param {string} verifyCode - 验证码
 * @returns {Promise<{success: boolean, message?: string, data?: object, error?: any}>}
 */
export const login = async (email, password, verifyCode) => {
    try {
        const clientFingerprint = await getClientFingerprint();
        console.log("登录时发送的指纹:", clientFingerprint);
        console.log("登录时发送的验证码:", verifyCode);

        // 发送请求
        const response = await axios.post('/user/login', {
            email,
            password,
            verifyCode,
            clientFingerprint
        });

        // *** 正确的检查逻辑 ***
        // 检查响应是否存在，code 是否为 200，data 是否存在，以及 data.token 是否存在
        if (response && response.code === 200 && response.data && response.data.token) {
            // 从 response.data 中获取 token 和 userId
            const { token } = response.data; // userId 可能也在 response.data 中，根据需要解构
            const userId = response.data.userId; // 显式获取 userId

            localStorage.setItem('auth_token', token);
            const userInfo = parseToken(token); // 调用你的 parseToken 函数

            if (!userInfo) {
                console.error('Token 解析失败:', token);
                localStorage.removeItem('auth_token');
                throw new Error('登录成功，但无法解析用户信息');
            }

            console.log('[API] Login successful, UserInfo:', userInfo);
            // 确保返回的 data 结构与 LoginForm.vue 中 $emit 时期望的一致
            return {
                success: true,
                data: { ...userInfo, userId: userId, token: token } // 返回包含解析后信息、userId 和 token 的对象
            };
        } else {
            // 如果 code 不是 200 或 data/token 缺失
            console.error('登录响应无效或业务失败:', response);
            const message = response?.message || '登录失败，响应数据无效'; // 使用后端消息或默认消息
            throw new Error(message);
        }
        // *** 检查逻辑结束 ***

    } catch (error) {
        localStorage.removeItem('auth_token'); // 清理 token
        console.error('登录过程中出错:', error);
        return {
            success: false,
            message: error.message || '登录失败，请检查输入或稍后重试',
            error
        };
    }
};

/**
 * 用户注册 (与之前一致)
 * @param {object} registrationData - { email, password, username, realName, avatar, verifyCode }
 * @returns {Promise<{success: boolean, message?: string, data?: any}>}
 */
export const register = async (registrationData) => {
    console.log('[API] Attempting to register user:', registrationData.email);
    try {
        const response = await axios.post('/user/register', registrationData);
        // 假设拦截器成功时返回 data 部分 (LoginResponse，仅含 userId)
        console.log('[API] Registration request successful:', response);
        return { success: true, data: response };
    } catch (error) {
        console.error('[API] Registration failed:', error);
        return {
            success: false,
            message: error.message || '注册失败，请稍后重试'
        };
    }
};

export const logout = async () => {
    try {
        // 获取 token 和 指纹 *之前* 清除 localStorage
        const token = localStorage.getItem('auth_token');
        let fingerprint = null;
        try {
            fingerprint = await getClientFingerprint(); // 尝试获取指纹
        } catch (fpError) {
            console.error("登出时获取指纹失败:", fpError);
            // 根据策略决定是否继续，如果后端强制要求指纹，这里可能需要抛出错误
        }

        // 先清除本地存储的 token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo'); // 假设也需要清除这个

        // 如果没有token，直接返回成功
        if (!token) {
            return { success: true };
        }

        // 准备请求头
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        // 如果获取到指纹，并且后端需要，则添加
        if (fingerprint) {
            headers['X-Client-Fingerprint'] = fingerprint;
            console.log("登出请求添加的指纹头:", fingerprint);
        } else {
            console.warn("登出请求未找到或无法添加指纹头");
            // 如果后端强制要求指纹，没有指纹的请求会失败 (如日志所示)
        }

        // 调用登出 API，传入准备好的 headers
        await axios.post('/user/logout', null, { headers });

        // 如果 API 调用成功 (没有抛出错误)
        return { success: true };

    } catch (error) {
        console.error('Logout API error:', error);

        // 即使 API 调用失败，确保本地 token 已被清除 (虽然上面已经清了，双重保险)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');

        // 忽略401错误 (保持你原来的逻辑)
        // 注意：如果修复了指纹问题，这里的 401 可能意味着 token 真的过期了
        if (error.response && error.response.status === 401) {
            console.warn("Logout API 返回 401，可能 token 过期或指纹仍有问题");
            return { success: true }; // 视为登出成功
        }

        // 其他错误视为失败
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
