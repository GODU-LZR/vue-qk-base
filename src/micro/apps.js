// vue-qk-base/src/micro/apps.js
/**
 * 假设我们只有一个帖子模块（posts-module），
 * 其他模块暂用假路径占位。
 */
const apps = [
   // {
   //      name: 'posts-module',        // 与子应用 package.json 中的 name 一致
   //      entry: 'http://localhost:3001', // 子应用运行地址
   //      container: '#micro-container',  // 挂载容器
   //      activeRule: '/posts'            // 路由前缀 /posts 时激活
   //  },
   //  {
   //      name: 'assistant-module',
   //      entry: 'http://localhost:3002',
   //      container: '#micro-container',
   //      activeRule: '/assistant'
   //  },
   //  {
   //      name: 'user-module',
   //      entry: 'http://localhost:3003',
   //      container: '#micro-container',
   //      activeRule: '/user'
   //  },
    {
        name: 'venue-module',
        entry: 'http://localhost:3004',
        container: '#micro-container',
        activeRule: '/venue',
    },
    // {
    //     name: 'equipment-module',
    //     entry: 'http://localhost:3005',
    //     container: '#micro-container',
    //     activeRule: '/equipment'
    // },
    // {
    //     name: 'events-module',
    //     entry: 'http://localhost:3006',
    //     container: '#micro-container',
    //     activeRule: '/events'
    // },
    // // {
    // //     name: 'finance-module',
    // //     entry: 'http://localhost:3007',
    // //     container: '#micro-container',
    // //     activeRule: '/finance'
    // // },
    // {
    //     name: 'hr-module',
    //     entry: 'http://localhost:3008',
    //     container: '#micro-container',
    //     activeRule: '/hr'
    // },
    // ...更多模块
];

export default apps;