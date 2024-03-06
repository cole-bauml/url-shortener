const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.databaseName}`).then(() => {
    console.log('Connected to MongoDB')
  });
}

const URLSchema = new mongoose.Schema({
    alias: String,
    URL: String
});

const URLModel = mongoose.model('urls', URLSchema);

module.exports = {
    main,
    URLModel
}