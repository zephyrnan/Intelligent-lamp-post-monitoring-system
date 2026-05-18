# Bugs and Known Issues

## BUG-001: RoomDetail.vue WebSocket 事件监听内存泄漏

- Status: Fixed
- Date: 2026-05-18
- Scenario: 用户从房间 A 返回列表，再进入房间 B
- Symptom: 房间 A 的事件监听仍挂在全局 wsStore 上，房间 B 数据到达时执行房间 A 的回调，控制台报 Vue 警告
- Impact: 内存泄漏，已销毁组件的数据被错误修改
- Files: `frontend/src/views/RoomDetail.vue`
- Attempts: 在 onUnmounted 中添加 `wsStore.off('room_data_update')` 和 `wsStore.off('room_status_update')`
- Resolution: Fixed — 组件卸载时正确注销所有 WebSocket 事件监听
- Next Steps: 检查其他使用 `wsStore.on()` 的组件是否存在同类问题

## BUG-002: websocketStore eventListeners 使用 ref 包装导致性能损耗

- Status: Fixed
- Date: 2026-05-18
- Scenario: `eventListeners` 使用 `ref<Map<string, Function[]>>()` 声明
- Symptom: Vue 3 的 Proxy 机制会为 Map 中每个回调函数添加响应式拦截器，但 UI 根本不需要对函数增删做响应式渲染
- Impact: 不必要的性能开销和内存占用
- Files: `frontend/src/stores/modules/websocketStore.ts`
- Attempts: 将 `ref<Map>()` 改为普通 `new Map()`，所有 `eventListeners.value` 改为 `eventListeners`
- Resolution: Fixed — 事件监听器存储剥离出响应式系统
- Next Steps: 无

## BUG-003: BaseChart.vue ECharts 数据响应式性能黑洞

- Status: Fixed
- Date: 2026-05-18
- Scenario: 后端传来大量数据点（如 5000 个），通过 props.data 传递给 BaseChart
- Symptom: Vue 会遍历所有数据对象添加 getter/setter，但 ECharts 只需要纯数字绘图，导致渲染卡顿
- Impact: 数据量大时页面冻结，渲染耗时从 10ms 飙升到 1000ms
- Files: `frontend/src/components/charts/BaseChart.vue`
- Attempts: 在 computed 中使用 `markRaw(props.data)` 剥离响应式
- Resolution: Fixed — ECharts 数据源不再被 Vue 深度代理
- Next Steps: 无

## BUG-004: RoomList.vue 缺少 onUnmounted 导致定时器和 WebSocket 监听泄漏

- Status: Fixed
- Date: 2026-05-18
- Scenario: 用户在 RoomList 页面搜索后导航离开
- Symptom: searchTimer 的 setTimeout 回调继续执行，WebSocket 事件监听器（room_status_update、room_data_update）残留在全局 wsStore 上
- Impact: 内存泄漏，已销毁组件的回调仍被触发
- Files: `frontend/src/views/RoomList.vue`
- Attempts: 添加 onUnmounted 钩子，清理 searchTimer 并注销两个事件监听器
- Resolution: Fixed — 组件卸载时正确清理定时器和 WebSocket 监听
- Next Steps: 无

## BUG-005: BaseChart.vue throttleTimer 未在卸载时清理

- Status: Fixed
- Date: 2026-05-18
- Scenario: 包含 BaseChart 的页面在节流定时器未触发前被卸载
- Symptom: throttleTimer（setTimeout）回调在组件销毁后执行，尝试更新已销毁的 shallowRef
- Impact: 内存泄漏，控制台可能报 Vue 警告
- Files: `frontend/src/components/charts/BaseChart.vue`
- Attempts: 在 onUnmounted 中添加 clearTimeout(throttleTimer)
- Resolution: Fixed — 组件卸载时清理节流定时器
- Next Steps: 无

## BUG-006: websocketStore Socket 使用 ref 而非 shallowRef 导致不必要的深度代理

- Status: Fixed
- Date: 2026-05-18
- Scenario: `socket` 使用 `ref<Socket | null>(null)` 声明
- Symptom: Vue 会尝试对 Socket.IO 实例进行深度 Proxy 代理，Socket 对象内部结构复杂（包含大量内部属性和方法），深度代理无意义且有性能损耗
- Impact: 不必要的性能开销，可能导致 Socket 内部方法调用异常
- Files: `frontend/src/stores/modules/websocketStore.ts`
- Attempts: 将 `ref<Socket>()` 改为 `shallowRef<Socket>()`
- Resolution: Fixed — Socket 实例不再被 Vue 深度代理
- Next Steps: 无

## BUG-007: websocketStore pong 监听器在 startHeartbeat 中重复注册

- Status: Fixed
- Date: 2026-05-18
- Scenario: 每次 WebSocket 断线重连后调用 startHeartbeat()
- Symptom: `socket.value.on('pong', ...)` 在 startHeartbeat 内注册，每次重连都会添加一个新的 pong 监听器，导致回调累积
- Impact: 心跳延迟日志重复打印 N 次（N = 重连次数），性能损耗
- Files: `frontend/src/stores/modules/websocketStore.ts`
- Attempts: 将 pong 监听器移到 connect() 中的 socket 初始化阶段，只注册一次
- Resolution: Fixed — pong 监听器在连接建立时注册一次，不再重复绑定
- Next Steps: 无

## BUG-008: websocketStore 重复 computed（isConnected / connected）

- Status: Fixed
- Date: 2026-05-18
- Scenario: 同时存在 `isConnected` 和 `connected` 两个 computed，逻辑完全相同
- Symptom: 代码冗余，维护时容易混淆
- Impact: 代码质量问题
- Files: `frontend/src/stores/modules/websocketStore.ts`, `frontend/src/components/layout/AppLayout.vue`, `frontend/src/components/WebSocketVideoStream.vue`
- Attempts: 移除 `connected`，保留 `isConnected`，更新所有引用
- Resolution: Fixed — 统一使用 `isConnected`
- Next Steps: 无

## BUG-009: RoomDetail.vue watch(props.id) 未离开旧房间 + 竞态条件

- Status: Fixed
- Date: 2026-05-18
- Scenario: 用户从房间 A 导航到房间 B
- Symptom: 1) 旧房间 A 的 WebSocket 房间未离开；2) 快速切换房间时，房间 A 的异步响应可能覆盖房间 B 的数据
- Impact: 服务器端房间资源泄漏，数据竞态导致显示错误房间的数据
- Files: `frontend/src/views/RoomDetail.vue`
- Attempts: watch 中添加 wsStore.leaveRoom(oldId)；fetchRoomData 中添加 fetchRequestId 竞态防护
- Resolution: Fixed — 切换房间时正确离开旧房间，过期异步响应被丢弃
- Next Steps: 无

## BUG-010: DeviceControl.vue 组件挂载时双重请求

- Status: Fixed
- Date: 2026-05-18
- Scenario: DeviceControl 组件挂载
- Symptom: watch(immediate: true) 和 onMounted 各调用一次 fetchDeviceStatus，导致同一接口被请求两次
- Impact: 不必要的网络请求
- Files: `frontend/src/components/common/DeviceControl.vue`
- Attempts: 移除 onMounted 中的 fetchDeviceStatus 调用，保留 watch(immediate: true)
- Resolution: Fixed — 只触发一次请求
- Next Steps: 无

## BUG-011: WebSocketVideoStream.vue watch(roomId) 未离开旧房间

- Status: Fixed
- Date: 2026-05-18
- Scenario: roomId prop 变化时
- Symptom: watch 中调用 ws.joinRoom(newId) 但未调用 ws.leaveRoom(oldId)，旧房间的视频流订阅未取消
- Impact: 服务器端房间资源泄漏
- Files: `frontend/src/components/WebSocketVideoStream.vue`
- Attempts: watch 中添加 ws.leaveRoom(oldId)
- Resolution: Fixed — 切换房间时正确离开旧房间
- Next Steps: 无
