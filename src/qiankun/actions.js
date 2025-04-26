// src/qiankun/actions.js (主应用)

// 初始时提供一个安全的默认实现，防止在 actions 初始化完成前被调用时报错
let actionsInstance = {
    setGlobalState: (state) => {
        console.warn("qiankun actions.setGlobalState 未初始化或未正确调用:", state);
    },
    onGlobalStateChange: (callback, fireImmediately) => {
        console.warn("qiankun actions.onGlobalStateChange 未初始化或未正确调用:", callback, fireImmediately);
    },
};

/**
 * 设置 Qiankun 全局状态操作对象
 * @param {object} actions - 从 initGlobalState 返回的 actions 对象
 */
export const initActions = (actions) => {
    if (actions && typeof actions.setGlobalState === 'function' && typeof actions.onGlobalStateChange === 'function') {
        console.log('[qiankun/actions] Qiankun actions 已初始化');
        actionsInstance = actions;
    } else {
        console.error('[qiankun/actions] 初始化 Qiankun actions 失败，传入的对象无效:', actions);
    }
};

// 导出实例，供其他模块使用
export { actionsInstance as actions };