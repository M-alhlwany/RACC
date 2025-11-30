const mongoose = require('mongoose');
const dotEnv = require('dotenv');
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 💥 Shutting down...');
  console.log(err.name, ' ', err.message);
  process.exit(1);
});
dotEnv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DB_URL.replace('<PASSWOR>', process.env.DB_PASSWORD);

mongoose.connect(DB).then(() => console.log('Db connction successfuly'));

// start server
const port = 8000;
const server = app.listen(port, () => {
  console.log(`app running on http://localhost:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJCTION 💥 Shutting down...');
  console.log(err.name, ' ', err.message);
  console.log('err.stack', ' ', err.stack);
  server.close(() => {
    process.exit(1);
  });
});
