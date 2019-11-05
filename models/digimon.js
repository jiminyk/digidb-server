const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const digimonSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    personality: String,
    stage: String,
    attribute: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Digimon', digimonSchema);