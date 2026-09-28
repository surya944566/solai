// const path = require('path');

// require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// module.exports = {
//   port: process.env.PORT || 5000,
//   nodeEnv: process.env.NODE_ENV || 'development',
//   clientUrl: process.env.CLIENT_URL || 'https://solaimatrimony.netlify.app',
//   corsOrigins: (process.env.CORS_ORIGINS || 'https://solaimatrimony.netlify.app')
//     .split(',')
//     .map((s) => s.trim())
//     .filter(Boolean),
//   mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/solai_matrimony',
//   jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
//   jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
//   adminJwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1d',
//   uploadDir: path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
//   maxFileSize: process.env.MAX_FILE_SIZE || '5mb',
//   socketCorsOrigin:
//     process.env.SOCKET_CORS_ORIGIN ||
//     (process.env.CORS_ORIGINS || 'https://solaimatrimony.netlify.app').split(',').map((s) => s.trim()),
// };


const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});

const corsOrigins = (process.env.CORS_ORIGINS || 'https://solaimatrimony.netlify.app')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

module.exports = {
  port: process.env.PORT || 5000,

  nodeEnv: process.env.NODE_ENV || 'development',

  clientUrl:
    process.env.CLIENT_URL || 'https://solaimatrimony.netlify.app',

  corsOrigins,

  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/solai_matrimony',

  jwtSecret:
    process.env.JWT_SECRET || 'dev_secret_change_me',

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN || '7d',

  adminJwtExpiresIn:
    process.env.ADMIN_JWT_EXPIRES_IN || '1d',

  uploadDir: path.join(
    __dirname,
    '..',
    process.env.UPLOAD_DIR || 'uploads'
  ),

  maxFileSize:
    process.env.MAX_FILE_SIZE || '5mb',

  socketCorsOrigin:
    (process.env.SOCKET_CORS_ORIGIN ||
      'https://solaimatrimony.netlify.app')
      .trim()
      .replace(/\/$/, ''),
};