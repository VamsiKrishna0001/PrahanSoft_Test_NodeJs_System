const mongoose = require('mongoose');

const connectionStr = process.env.MONGO_URL;
const Username = process.env.MONGO_USERNAME;
const Password = process.env.MONGO_PASSWORD;
const options = {
    useNewUrlParser: true
};
const connectDB = async() => {
    try {
    const conn = await mongoose.connect(`mongodb+srv://${Username}:${Password}@${connectionStr}?retryWrites=true&w=majority`, options);
    console.log(`MongoDB Connected: `);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

}


module.exports = connectDB
