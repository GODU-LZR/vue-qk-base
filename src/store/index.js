import Vue from 'vue';
import Vuex from 'vuex';
import { login as apiLogin, logout as apiLogout, getCurrentUser, parseToken } from '@/api/modules/auth'; // 假设您的认证API文件路径为 @/api/auth.js

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 从 localStorage 加载用户信息，如果不存在则为 null
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    // 从 localStorage 加载 token
    token: localStorage.getItem('auth_token') || null,
  },

  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
      // 将用户信息持久化到 localStorage
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        localStorage.removeItem('userInfo');
      }
    },

    clearUserInfo(state) {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },

    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    },

    clearToken(state) {
      state.token = null;
      localStorage.removeItem('auth_token');
    }
  },

  getters: {
    getUserInfo: state => state.userInfo,
    isLoggedIn: state => !!state.userInfo,
    getToken: state => state.token,

    // 获取用户角色
    getUserRoles: state => state.userInfo ? state.userInfo.roles : [],

    // 检查用户是否有特定角色
    hasRole: (state) => (roleCode) => {
      if (!state.userInfo || !state.userInfo.roles) return false;
      return state.userInfo.roles.includes(roleCode);
    }
  },

  actions: {
    // 登录操作
    async login({ commit }, { email, password }) {
      try {
        const result = await apiLogin(email, password);

        if (result.success) {
          // 保存 token
          commit('setToken', localStorage.getItem('auth_token'));
          // 保存用户信息
          commit('setUserInfo', result.data);
          return result;
        } else {
          throw new Error(result.message || '登录失败');
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    // 登出操作
    async logout({ commit }) {
      try {
        const result = await apiLogout();

        // 无论API调用是否成功，都清除本地用户信息和token
        commit('clearUserInfo');
        commit('clearToken');

        return result;
      } catch (error) {
        // 即使失败也清除本地状态
        commit('clearUserInfo');
        commit('clearToken');
        console.error('Logout failed:', error);
        throw error;
      }
    },

    // 检查并恢复用户会话（例如在应用启动时调用）
    checkAuth({ commit, state }) {
      if (!state.token) return false;

      // 获取当前用户信息
      const userInfo = getCurrentUser();

      if (userInfo) {
        // 更新用户信息（确保与 token 中的信息一致）
        commit('setUserInfo', userInfo);
        return true;
      } else {
        // token 无效或过期，清除状态
        commit('clearUserInfo');
        commit('clearToken');
        return false;
      }
    },

    // 从 token 更新用户信息（例如，当从后端获取新 token 时）
    updateUserInfoFromToken({ commit }, token) {
      if (!token) return false;

      const userInfo = parseToken(token);
      if (userInfo) {
        commit('setUserInfo', userInfo);
        commit('setToken', token);
        return true;
      }
      return false;
    }
  },

  modules: {},
});
