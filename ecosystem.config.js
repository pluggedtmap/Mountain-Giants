module.exports = {
  apps : [{
    name: 'mountain-giants-backend',
    script: './backend/server.js',
    cwd: './',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3018
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
