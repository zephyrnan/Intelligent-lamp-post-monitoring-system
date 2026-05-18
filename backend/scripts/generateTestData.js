const mongoose = require('mongoose');
const Alarm = require('../module/Alarm');
const RoomListModel = require('../module/RoomsList');

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/roomMonitor')
  .then(() => console.log('✅ MongoDB连接成功'))
  .catch(err => {
    console.error('❌ MongoDB连接失败:', err);
    process.exit(1);
  });

// 生成报警ID
function generateAlarmId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ALARM-${timestamp}-${random}`;
}

// 生成随机数（指定范围）
function randomInRange(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// 生成随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成历史数据
async function generateHistoryData() {
  console.log('\n📊 开始生成历史数据...');

  const historyData = [];
  const roomIds = ['1', '2', '3'];
  const now = new Date();

  // 生成最近7天的数据，每个房间每小时一条
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      for (const roomId of roomIds) {
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(hour, randomInt(0, 59), randomInt(0, 59));

        const date = timestamp.toISOString().split('T')[0];
        const time = timestamp.toTimeString().split(' ')[0];

        // 生成传感器数据
        const temperature = randomInRange(18, 28);
        const humidity = randomInRange(40, 70);
        const smoke = randomInRange(0, 20);
        const lux = randomInRange(100, 500);

        // 根据传感器值判断报警等级
        let warn = '0'; // 正常
        if (parseFloat(temperature) > 26 || parseFloat(temperature) < 20 ||
            parseFloat(humidity) > 65 || parseFloat(humidity) < 45 ||
            parseFloat(smoke) > 10) {
          warn = randomInt(0, 10) > 7 ? '2' : '1'; // 10%概率严重，20%概率警告
        }

        historyData.push({
          roomId,
          smoke,
          temp: temperature,
          water: '0',
          warn,
          hum: humidity,
          sc: randomInRange(0.5, 2.5),
          lux,
          sv: randomInRange(220, 240),
          bv: randomInRange(220, 240),
          date,
          time,
          timestamp: timestamp.toISOString()
        });
      }
    }
  }

  // 清空旧数据
  await RoomListModel.deleteMany({});
  console.log('🗑️  已清空旧的历史数据');

  // 插入新数据
  await RoomListModel.insertMany(historyData);
  console.log(`✅ 成功生成 ${historyData.length} 条历史数据`);
}

// 生成报警数据
async function generateAlarmData() {
  console.log('\n🚨 开始生成报警数据...');

  const alarms = [];
  const roomIds = ['1', '2', '3'];
  const roomNames = ['灯杆01', '灯杆02', '灯杆03'];
  const types = ['temperature', 'humidity', 'smoke', 'lux', 'sc', 'sv', 'device_offline'];
  const levels = ['critical', 'high', 'medium', 'low'];
  const statuses = ['active', 'acknowledged', 'resolved'];

  const now = new Date();

  // 生成最近24小时的报警，随机数量
  const alarmCount = randomInt(20, 50);

  for (let i = 0; i < alarmCount; i++) {
    const roomIndex = randomInt(0, roomIds.length - 1);
    const roomId = roomIds[roomIndex];
    const roomName = roomNames[roomIndex];

    const type = types[randomInt(0, types.length - 1)];
    const level = levels[randomInt(0, levels.length - 1)];

    // 70%活跃，20%已确认，10%已解决
    let status;
    const rand = Math.random();
    if (rand < 0.7) status = 'active';
    else if (rand < 0.9) status = 'acknowledged';
    else status = 'resolved';

    const timestamp = new Date(now.getTime() - randomInt(0, 24 * 60 * 60 * 1000));

    const alarm = {
      alarmId: generateAlarmId(),
      roomId: `room0${roomId}`,
      roomName,
      type,
      level,
      message: getAlarmMessage(type, level),
      status,
      acknowledged: status !== 'active',
      timestamp,
      date: timestamp.toISOString().split('T')[0],
      time: timestamp.toTimeString().split(' ')[0]
    };

    if (status === 'acknowledged' || status === 'resolved') {
      alarm.acknowledgedBy = 'admin';
      alarm.acknowledgedAt = new Date(timestamp.getTime() + randomInt(5, 30) * 60 * 1000);
    }

    if (status === 'resolved') {
      alarm.resolvedAt = new Date(alarm.acknowledgedAt.getTime() + randomInt(10, 60) * 60 * 1000);
    }

    alarms.push(alarm);
  }

  // 清空旧数据
  await Alarm.deleteMany({});
  console.log('🗑️  已清空旧的报警数据');

  // 插入新数据
  await Alarm.insertMany(alarms);
  console.log(`✅ 成功生成 ${alarms.length} 条报警数据`);

  // 统计信息
  const stats = {
    active: alarms.filter(a => a.status === 'active').length,
    acknowledged: alarms.filter(a => a.status === 'acknowledged').length,
    resolved: alarms.filter(a => a.status === 'resolved').length,
    critical: alarms.filter(a => a.level === 'critical').length,
    high: alarms.filter(a => a.level === 'high').length,
    medium: alarms.filter(a => a.level === 'medium').length,
    low: alarms.filter(a => a.level === 'low').length
  };

  console.log('\n📈 报警统计:');
  console.log(`   活跃: ${stats.active}`);
  console.log(`   已确认: ${stats.acknowledged}`);
  console.log(`   已解决: ${stats.resolved}`);
  console.log(`   严重: ${stats.critical}`);
  console.log(`   高: ${stats.high}`);
  console.log(`   中: ${stats.medium}`);
  console.log(`   低: ${stats.low}`);
}

// 获取报警消息
function getAlarmMessage(type, level) {
  const messages = {
    temperature: {
      critical: '温度严重超标，请立即处理',
      high: '温度过高，需要关注',
      medium: '温度略高于正常范围',
      low: '温度轻微偏离正常值'
    },
    humidity: {
      critical: '湿度严重异常，请立即检查',
      high: '湿度过高，可能影响设备',
      medium: '湿度偏高',
      low: '湿度略有偏差'
    },
    smoke: {
      critical: '检测到烟雾浓度严重超标！',
      high: '烟雾浓度过高，请检查',
      medium: '烟雾浓度偏高',
      low: '检测到轻微烟雾'
    },
    lux: {
      critical: '光照强度异常',
      high: '光照强度过强',
      medium: '光照强度偏高',
      low: '光照强度偏低'
    },
    sc: {
      critical: '旁路电流严重异常',
      high: '旁路电流过高',
      medium: '旁路电流偏高',
      low: '旁路电流略高'
    },
    sv: {
      critical: '旁路电压严重异常',
      high: '旁路电压过高',
      medium: '旁路电压偏高',
      low: '旁路电压略高'
    },
    device_offline: {
      critical: '设备离线超过30分钟',
      high: '设备离线超过10分钟',
      medium: '设备短暂离线',
      low: '检测到设备连接不稳定'
    }
  };

  return messages[type]?.[level] || `${type} 报警 (${level})`;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始生成测试数据...\n');

    await generateHistoryData();
    await generateAlarmData();

    console.log('\n✅ 所有测试数据生成完成！');
    console.log('💡 请刷新前端页面查看数据');

    process.exit(0);
  } catch (error) {
    console.error('❌ 生成测试数据失败:', error);
    process.exit(1);
  }
}

// 运行
main();
