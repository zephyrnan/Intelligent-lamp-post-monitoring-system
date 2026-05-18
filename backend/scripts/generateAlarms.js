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

// 房间名称映射
const roomNames = {
  '1': '灯杆01',
  '2': '灯杆02',
  '3': '灯杆03'
};

// 根据历史数据生成报警
async function generateAlarmsFromHistory() {
  try {
    console.log('\n🚨 基于历史数据生成报警记录...\n');

    // 获取所有报警级别不为0的历史记录
    const warnRecords = await RoomListModel.find({
      warn: { $ne: '0' }
    }).sort({ date: -1, time: -1 });

    console.log(`找到 ${warnRecords.length} 条报警记录`);

    const alarms = [];

    for (const record of warnRecords) {
      const roomId = `room0${record.roomId}`;
      const roomName = roomNames[record.roomId] || `房间${record.roomId}`;

      // 解析温度、湿度、烟雾值
      const temp = parseFloat(record.temp) || 0;
      const hum = parseFloat(record.hum) || 0;
      const smoke = parseFloat(record.smoke) || 0;

      // 确定报警类型和消息
      let type = 'temperature';
      let message = '';
      let level = record.warn === '2' ? 'critical' : record.warn === '1' ? 'high' : 'medium';

      // 判断具体是什么类型的报警
      if (temp > 26 || temp < 18) {
        type = 'temperature';
        if (temp > 30) {
          message = `温度严重超标 (${temp}°C)，请立即处理`;
          level = 'critical';
        } else if (temp > 26) {
          message = `温度过高 (${temp}°C)`;
          level = 'high';
        } else if (temp < 18) {
          message = `温度过低 (${temp}°C)`;
          level = 'high';
        }
      } else if (hum > 70 || hum < 30) {
        type = 'humidity';
        if (hum > 80) {
          message = `湿度严重超标 (${hum}%)`;
          level = 'critical';
        } else if (hum > 70) {
          message = `湿度过高 (${hum}%)`;
          level = 'high';
        } else if (hum < 30) {
          message = `湿度过低 (${hum}%)`;
          level = 'high';
        }
      } else if (smoke > 5) {
        type = 'smoke';
        if (smoke > 10) {
          message = `检测到烟雾浓度严重超标 (${smoke})！`;
          level = 'critical';
        } else {
          message = `烟雾浓度偏高 (${smoke})`;
          level = 'high';
        }
      } else {
        // 默认报警消息
        message = `环境参数异常 - 温度:${temp}°C 湿度:${hum}% 烟雾:${smoke}`;
      }

      // 构建时间戳
      const timestamp = new Date(`${record.date}T${record.time}`);

      // 确定状态（随机）
      const rand = Math.random();
      let status = 'active';
      let acknowledged = false;
      let acknowledgedBy = undefined;
      let acknowledgedAt = undefined;
      let resolvedAt = undefined;

      if (rand < 0.3) {
        // 30% 已解决
        status = 'resolved';
        acknowledged = true;
        acknowledgedBy = 'admin';
        acknowledgedAt = new Date(timestamp.getTime() + 10 * 60 * 1000);
        resolvedAt = new Date(acknowledgedAt.getTime() + 20 * 60 * 1000);
      } else if (rand < 0.6) {
        // 30% 已确认
        status = 'acknowledged';
        acknowledged = true;
        acknowledgedBy = 'admin';
        acknowledgedAt = new Date(timestamp.getTime() + 10 * 60 * 1000);
      }
      // 40% 保持活跃状态

      alarms.push({
        alarmId: generateAlarmId(),
        roomId,
        roomName,
        type,
        level,
        message,
        status,
        acknowledged,
        acknowledgedBy,
        acknowledgedAt,
        resolvedAt,
        timestamp,
        date: record.date,
        time: record.time
      });
    }

    // 清空旧报警数据
    await Alarm.deleteMany({});
    console.log('🗑️  已清空旧的报警数据');

    // 插入新报警
    if (alarms.length > 0) {
      await Alarm.insertMany(alarms);
      console.log(`✅ 成功生成 ${alarms.length} 条报警记录`);

      // 统计
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
    } else {
      console.log('⚠️  没有找到需要生成报警的记录');
    }

    console.log('\n✅ 报警生成完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 生成报警失败:', error);
    process.exit(1);
  }
}

generateAlarmsFromHistory();
