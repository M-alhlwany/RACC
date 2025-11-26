import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 8000;
const DB = process.env.DB_URLCOMPASS || 'mongodb://localhost:27017/romoz-db';

mongoose
  .connect(DB)
  .then(() => console.log('✅ DB connection successful'))
  .catch((err) => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`✅ App running on port ${PORT}...`);
});
