let mongoose = require('mongoose');

// 人员检测记录Schema
let PersonDetectionSchema = new mongoose.Schema({
    detectionId: {
        type: String,
        required: true,
        unique: true
    },
    roomId: {
        type: String,
        required: true
    },
    personCount: {
        type: Number,
        default: 0
    },
    originalImage: {
        type: String,  // base64 编码的原始图片
        required: false
    },
    detectedImage: {
        type: String,  // base64 编码的检测后的图片
        required: false
    },
    detections: [{
        class: Number,
        confidence: Number,
        label: String,
        bbox: {
            x: Number,
            y: Number,
            width: Number,
            height: Number
        }
    }],
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
    collection: 'person_detections',
    strict: false
});

// 创建索引以提高查询性能
PersonDetectionSchema.index({ roomId: 1, timestamp: -1 });
PersonDetectionSchema.index({ detectionId: 1 });
PersonDetectionSchema.index({ date: 1 });

module.exports = mongoose.model('PersonDetection', PersonDetectionSchema);
