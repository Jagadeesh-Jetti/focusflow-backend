const mongoose = require('mongoose');

const dotEnv = require('dotenv');

dotEnv.config({
  path: '.env',
});

const mongoURL = process.env.MONGODB;

const connectDB = () => {
  if (!mongoURL) {
    console.log('Environment variables not defined');
  } else {
    mongoose
      .connect(mongoURL)
      .then(() => {
        console.log('Database connected successfully');
      })
      .catch((error) => {
        console.log('Error while connecting to database', error);
      });
  }
};

module.exports = connectDB;
