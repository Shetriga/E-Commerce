const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sectionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
});

module.exports = new mongoose.model('Section', sectionSchema);