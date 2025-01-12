// src/micro/index.js
import { registerMicroApps, addGlobalUncaughtErrorHandler, start } from 'qiankun'
import apps from './apps';

export function registerQiankun() {
    // 注册子应用
    registerMicroApps(apps, {
        beforeLoad: app => {
            console.log('[LifeCycle] before load => ', app.name)
        },
        beforeMount: app => {
            console.log('[LifeCycle] before mount => ', app.name)
        },
        afterUnmount: app => {
            console.log('[LifeCycle] after unmount => ', app.name)
        }
    })

    // 全局错误捕获
    addGlobalUncaughtErrorHandler((event) => {
        const { msg } = event || {};
        if (msg && msg.includes('died in status LOADING_SOURCE_CODE')) {
            console.error('加载子应用失败，请检查子应用是否可访问', event);
        }
    })

    // 启动 qiankun
    start({
        sandbox: { experimentalStyleIsolation: true },
        prefetch: true
    })
    console.log('qiankun 已启动')
}
