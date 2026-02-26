module.exports = {
  apps: [{
    name: 'txghzs-backend',
    script: './index.js',
    cwd: '/root/.openclaw/zhbcher_txghzs/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/txghzs-error.log',
    out_file: '/var/log/txghzs-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
