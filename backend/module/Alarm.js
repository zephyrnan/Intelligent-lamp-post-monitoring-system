let mongoose = require('mongoose');

// 报警Schema
let AlarmSchema = new mongoose.Schema({
    alarmId: {
        type: String,
        required: true,
        unique: true
    },
    roomId: {
        type: String,
        required: true
    },
    roomName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['temperature', 'humidity', 'smoke', 'water', 'lux', 'sc', 'sv', 'bv', 'device_offline', 'intrusion', 'person']
    },
    level: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical']
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'acknowledged', 'resolved']
    },
    acknowledged: {
        type: Boolean,
        default: false
    },
    acknowledgedBy: {
        type: String,
        default: null
    },
    acknowledgedAt: {
        type: Date,
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    time: {
        type: String,
        default: () => new Date().toTimeString().split(' ')[0]
    }
}, {
    collection: 'alarms',
    strict: false
});

// 创建索引以提高查询性能
AlarmSchema.index({ roomId: 1, timestamp: -1 });
AlarmSchema.index({ alarmId: 1 });
AlarmSchema.index({ status: 1 });
AlarmSchema.index({ level: 1 });
AlarmSchema.index({ date: 1 });

module.exports = mongoose.model('Alarm', AlarmSchema);
