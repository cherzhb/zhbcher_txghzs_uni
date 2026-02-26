const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const compression = require('compression');
const svgCaptcha = require('svg-captcha');
require('dotenv').config();

// 图形验证码存储（内存缓存，生产环境建议用Redis）
const captchaStore = new Map();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET 环境变量未设置！');
  process.exit(1);
}

// 安全中间件
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// 通用速率限制
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: { error: '请求过于频繁，请稍后再试' }
});

// 认证相关速率限制（更严格）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15分钟内最多5次尝试
  message: { error: '登录/注册尝试过多，请15分钟后再试' }
});

// 中间件
// CORS配置
app.use(cors({
  origin: [
    'https://txghzs.19780918.xyz',
    'http://localhost:5173',
    'http://localhost:3001',
    'https://uni.q-fan.cn'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '../dist')));

// 初始化数据库
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

db.serialize(() => {
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password TEXT NOT NULL,
      gender INTEGER DEFAULT 1,
      birth_date TEXT,
      job_type INTEGER DEFAULT 1,
      location_code TEXT DEFAULT '110000',
      salary REAL DEFAULT 0,
      account_balance REAL DEFAULT 0,
      contribution_years INTEGER DEFAULT 0,
      contribution_index REAL DEFAULT 1.0,
      is_verified INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 验证码表
  db.run(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      phone TEXT,
      code TEXT NOT NULL,
      type TEXT DEFAULT 'register',
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 文章表
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      category TEXT DEFAULT 'policy',
      cover_image TEXT,
      view_count INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      author_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 收藏表
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      article_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (article_id) REFERENCES articles(id)
    )
  `);

  // 系统配置表
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 初始化文章数据
  db.get("SELECT COUNT(*) as count FROM articles", (err, row) => {
    if (row.count === 0) {
      const articles = [
        ['2025年退休政策最新解读', '详细解析新退休政策实施细则', '<h2>2025年退休政策最新解读</h2><p>随着人口老龄化加剧，国家陆续出台了一系列退休相关政策。</p>', 'policy', 12580],
        ['退休后如何保持健康的生活方式', '专家建议：保持适度运动、合理饮食', '<h2>退休后的健康生活方式</h2><p>退休后保持健康的生活方式至关重要。</p>', 'health', 9832],
        ['退休理财规划全攻略', '从风险控制到收益最大化', '<h2>退休理财规划</h2><p>合理的理财规划可以帮助您实现财务自由。</p>', 'finance', 8765],
        ['老年常见疾病预防指南', '高血压、糖尿病等老年病的预防', '<h2>老年常见疾病预防</h2><p>预防胜于治疗。</p>', 'health', 7568],
        ['社保退休年龄最新规定', '2025年社保退休年龄规定一览', '<h2>社保退休年龄规定</h2><p>2025年社保退休年龄规定如下。</p>', 'policy', 15230]
      ];
      articles.forEach(article => {
        db.run(
          "INSERT INTO articles (title, summary, content, category, view_count) VALUES (?, ?, ?, ?, ?)",
          article
        );
      });
    }
  });

  // 创建默认管理员账号
  db.get("SELECT COUNT(*) as count FROM users WHERE is_admin = 1", (err, row) => {
    if (row.count === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        "INSERT INTO users (username, email, password, is_admin, is_verified) VALUES (?, ?, ?, 1, 1)",
        ['admin', 'admin@txghzs.com', hashedPassword]
      );
      console.log('✅ Default admin created: admin / admin123');
    }
  });
});

// 邮件发送配置
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER || 'zhbcher@gmail.com',
      pass: process.env.SMTP_PASS || ''
    }
  });
};

// 生成随机验证码
const generateCode = () => {
  return Math.random().toString().slice(-6);
};

// JWT 验证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
};

// 管理员验证中间件
const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// ==================== 认证相关API ====================

// 验证图形验证码函数
const verifyCaptcha = (captchaId, captchaText) => {
  if (!captchaId || !captchaText) {
    return false;
  }
  const stored = captchaStore.get(captchaId);
  if (!stored) {
    return false;
  }
  // 检查是否过期
  if (stored.expires < Date.now()) {
    captchaStore.delete(captchaId);
    return false;
  }
  // 验证后立即删除，防止重复使用
  captchaStore.delete(captchaId);
  return stored.text === captchaText.toLowerCase();
};

// 生成图形验证码
app.get('/api/auth/captcha', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 4,           // 验证码长度
    ignoreChars: '0o1il',  // 排除容易混淆的字符
    noise: 2,          // 干扰线数量
    color: true,       // 彩色
    background: '#1e252e'  // 背景色
  });
  
  // 生成唯一ID
  const captchaId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // 存储验证码，5分钟有效
  captchaStore.set(captchaId, {
    text: captcha.text.toLowerCase(),
    expires: Date.now() + 5 * 60 * 1000
  });
  
  // 清理过期的验证码
  for (const [key, value] of captchaStore.entries()) {
    if (value.expires < Date.now()) {
      captchaStore.delete(key);
    }
  }
  
  res.json({
    captchaId,
    svg: captcha.data
  });
});

// 发送验证码（需要图形验证码）
app.post('/api/auth/send-code', async (req, res) => {
  const { email, phone, type = 'register', captchaId, captchaText } = req.body;
  
  // 验证图形验证码
  if (!verifyCaptcha(captchaId, captchaText)) {
    return res.status(400).json({ error: '图形验证码错误或已过期' });
  }
  
  if (!email && !phone) {
    return res.status(400).json({ error: '请提供邮箱或手机号' });
  }

  // 找回密码时，先检查用户是否存在
  if (type === 'reset') {
    const checkUser = () => {
      return new Promise((resolve, reject) => {
        db.get(
          "SELECT id FROM users WHERE email = ? OR phone = ?",
          [email, phone],
          (err, user) => {
            if (err) reject(err);
            else resolve(user);
          }
        );
      });
    };
    
    const userExists = await checkUser();
    if (!userExists) {
      return res.status(400).json({ error: '该邮箱/手机号未注册' });
    }
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟有效

  db.run(
    "INSERT INTO verification_codes (email, phone, code, type, expires_at) VALUES (?, ?, ?, ?, ?)",
    [email, phone, code, type, expiresAt.toISOString()],
    async (err) => {
      if (err) {
        console.error('保存验证码失败:', err);
        return res.status(500).json({ error: '发送验证码失败' });
      }

      // 发送邮件
      if (email) {
        try {
          const transporter = createTransporter();
          console.log('SMTP配置:', {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            user: process.env.SMTP_USER || 'zhbcher@gmail.com',
            hasPass: !!process.env.SMTP_PASS
          });

          if (process.env.SMTP_PASS) {
            const info = await transporter.sendMail({
              from: process.env.SMTP_USER || '18612348799@163.com',
              to: email,
              subject: '【退休规划助手】验证码',
              html: `
                <div style="padding: 20px; background: #f5f5f5;">
                  <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #1989fa;">退休规划助手</h2>
                    <p>您的验证码是：</p>
                    <div style="font-size: 32px; font-weight: bold; color: #1989fa; letter-spacing: 8px; margin: 20px 0;">
                      ${code}
                    </div>
                    <p style="color: #999; font-size: 14px;">验证码5分钟内有效，请勿泄露给他人。</p>
                  </div>
                </div>
              `
            });
            console.log('邮件发送成功:', info.messageId);
          } else {
            console.log('未配置SMTP密码，跳过邮件发送');
          }
        } catch (error) {
          console.error('发送邮件失败:', error);
        }
      }

      res.json({
        message: '验证码已发送'
        // 开发环境返回验证码
        // code: code
      });
    }
  );
});

// 注册
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { username, email, phone, password, code } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' });
  }

  if (!email && !phone) {
    return res.status(400).json({ error: '请提供邮箱或手机号' });
  }

  // 验证验证码
  if (code) {
    db.get(
      "SELECT * FROM verification_codes WHERE (email = ? OR phone = ?) AND code = ? AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
      [email, phone, code, new Date().toISOString()],
      async (err, row) => {
        if (!row) {
          return res.status(400).json({ error: '验证码无效或已过期' });
        }

        // 标记验证码已使用
        db.run("UPDATE verification_codes SET used = 1 WHERE id = ?", [row.id]);

        // 创建用户
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
          "INSERT INTO users (username, email, phone, password, is_verified) VALUES (?, ?, ?, ?, 1)",
          [username, email, phone, hashedPassword],
          function(err) {
            if (err) {
              if (err.message && err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: '用户名已存在' });
              }
              return res.status(500).json({ error: '注册失败' });
            }

            const token = jwt.sign({ id: this.lastID, username, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });

            res.json({
              message: '注册成功',
              token,
              user: { id: this.lastID, username, email, phone }
            });
          }
        );
      }
    );
  } else {
    // 无验证码注册（开发模式）
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)",
      [username, email, phone, hashedPassword],
      function(err) {
        if (err) {
          if (err.message && err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '用户名已存在' });
          }
          return res.status(500).json({ error: '注册失败' });
        }

        const token = jwt.sign({ id: this.lastID, username, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
          message: '注册成功',
          token,
          user: { id: this.lastID, username, email, phone }
        });
      }
    );
  }
});

// 登录
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' });
  }

  db.get(
    "SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?",
    [username, username, username],
    async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, isAdmin: user.is_admin === 1 },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          isAdmin: user.is_admin === 1
        }
      });
    }
  );
});

// 获取当前用户信息
app.get('/api/auth/me', authMiddleware, (req, res) => {
  db.get("SELECT id, username, email, phone, gender, birth_date, job_type, location_code, salary, account_balance, contribution_years, contribution_index, is_verified, is_admin FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(user);
  });
});

// 更新用户档案
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const { gender, birth_date, job_type, location_code, salary, account_balance, contribution_years, contribution_index, username, email } = req.body;
  
  // 构建更新字段
  const updates = [];
  const values = [];
  
  if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
  if (birth_date !== undefined) { updates.push('birth_date = ?'); values.push(birth_date); }
  if (job_type !== undefined) { updates.push('job_type = ?'); values.push(job_type); }
  if (location_code !== undefined) { updates.push('location_code = ?'); values.push(location_code); }
  if (salary !== undefined) { updates.push('salary = ?'); values.push(salary); }
  if (account_balance !== undefined) { updates.push('account_balance = ?'); values.push(account_balance); }
  if (contribution_years !== undefined) { updates.push('contribution_years = ?'); values.push(contribution_years); }
  if (contribution_index !== undefined) { updates.push('contribution_index = ?'); values.push(contribution_index); }
  if (username !== undefined) { updates.push('username = ?'); values.push(username); }
  if (email !== undefined) { updates.push('email = ?'); values.push(email); }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: '没有需要更新的字段' });
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.user.id);
  
  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      console.error('更新用户档案失败:', err);
      if (err.message && err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: '用户名或邮箱已被使用' });
      }
      return res.status(500).json({ error: '更新失败' });
    }
    res.json({ message: '档案已更新' });
  });
});

// 注销账号
app.delete('/api/auth/account', authMiddleware, (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.user.id], (err) => {
    if (err) {
      return res.status(500).json({ error: '注销失败' });
    }
    res.json({ message: '账号已注销' });
  });
});

// 重置密码
app.post('/api/auth/reset-password', async (req, res) => {
  const { phone, email, code, password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' });
  }

  // 验证验证码
  db.get(
    "SELECT * FROM verification_codes WHERE (email = ? OR phone = ?) AND code = ? AND type = 'reset' AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
    [email, phone, code, new Date().toISOString()],
    async (err, row) => {
      if (!row) {
        return res.status(400).json({ error: '验证码无效或已过期' });
      }

      // 标记验证码已使用
      db.run("UPDATE verification_codes SET used = 1 WHERE id = ?", [row.id]);

      // 更新密码
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? OR phone = ?",
        [hashedPassword, email, phone],
        function(err) {
          if (err) {
            return res.status(500).json({ error: '重置密码失败' });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: '用户不存在' });
          }
          res.json({ message: '密码重置成功' });
        }
      );
    }
  );
});

// ==================== 文章相关API ====================

// 获取文章列表
app.get('/api/articles', (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = "SELECT id, title, summary, category, cover_image, view_count, created_at FROM articles WHERE is_published = 1";
  let params = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);

  db.all(sql, params, (err, articles) => {
    if (err) {
      return res.status(500).json({ error: '获取文章列表失败' });
    }
    res.json(articles);
  });
});

// 获取文章详情
app.get('/api/articles/:id', (req, res) => {
  db.get("SELECT * FROM articles WHERE id = ?", [req.params.id], (err, article) => {
    if (err || !article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 增加浏览量
    db.run("UPDATE articles SET view_count = view_count + 1 WHERE id = ?", [req.params.id]);

    res.json(article);
  });
});

// ==================== 收藏相关API ====================

// 获取收藏列表
app.get('/api/favorites', authMiddleware, (req, res) => {
  db.all(
    `SELECT f.id as favorite_id, a.* FROM favorites f JOIN articles a ON f.article_id = a.id WHERE f.user_id = ? ORDER BY f.created_at DESC`,
    [req.user.id],
    (err, favorites) => {
      if (err) {
        return res.status(500).json({ error: '获取收藏失败' });
      }
      res.json(favorites);
    }
  );
});

// 添加收藏
app.post('/api/favorites', authMiddleware, (req, res) => {
  const { article_id } = req.body;

  db.run(
    "INSERT INTO favorites (user_id, article_id) VALUES (?, ?)",
    [req.user.id, article_id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: '收藏失败' });
      }
      res.json({ message: '已收藏' });
    }
  );
});

// 取消收藏
app.delete('/api/favorites/:article_id', authMiddleware, (req, res) => {
  db.run(
    "DELETE FROM favorites WHERE user_id = ? AND article_id = ?",
    [req.user.id, req.params.article_id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: '取消收藏失败' });
      }
      res.json({ message: '已取消收藏' });
    }
  );
});

// ==================== 管理员API ====================

// 获取所有用户
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  db.all("SELECT id, username, email, phone, gender, birth_date, job_type, location_code, salary, account_balance, contribution_years, contribution_index, is_verified, is_admin, created_at FROM users", (err, users) => {
    if (err) {
      return res.status(500).json({ error: '获取用户列表失败' });
    }
    res.json(users);
  });
});

// 删除用户
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: '删除用户失败' });
    }
    res.json({ message: '用户已删除' });
  });
});

// 管理员测试路由
// 管理员修改密码
app.post('/api/admin/change-password', authMiddleware, adminMiddleware, async (req, res) => {
  console.log('=== CHANGE PASSWORD ROUTE CALLED ===');
  console.log('Body:', req.body);
  console.log('User:', req.user);

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '请填写原密码和新密码' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码长度不能少于6位' });
  }

  // 获取当前用户
  db.get("SELECT * FROM users WHERE id = ?", [req.user.id], async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证原密码
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: '原密码错误' });
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.run(
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedPassword, req.user.id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: '修改密码失败' });
        }
        res.json({ message: '密码修改成功' });
      }
    );
  });
});

// 创建文章
// 获取管理员文章列表
app.get('/api/admin/articles', authMiddleware, adminMiddleware, (req, res) => {
  const { category, keyword, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let sql = "SELECT a.*, u.username as author_name FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE 1=1";
  let params = [];

  if (category) {
    sql += " AND a.category = ?";
    params.push(category);
  }

  if (keyword) {
    sql += " AND (a.title LIKE ? OR a.summary LIKE ?)";
    params.push(`%${keyword}%`);
  }

  sql += " ORDER BY a.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);

  db.all(sql, params, (err, articles) => {
    if (err) {
      return res.status(500).json({ error: '获取文章列表失败' });
    }

    let countSql = "SELECT COUNT(*) as total FROM articles WHERE 1=1";
    let countParams = [];

    if (category) {
      countSql += " AND category = ?";
      countParams.push(category);
    }

    if (keyword) {
      countSql += " AND (title LIKE ? OR summary LIKE ?)";
      countParams.push(`%${keyword}%`);
    }

    db.get(countSql, countParams, (err, row) => {
      res.json({
        list: articles,
        total: row?.total || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    });
  });
});

// 获取单篇文章（管理员）
app.get('/api/admin/articles/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.get("SELECT * FROM articles WHERE id = ?", [req.params.id], (err, article) => {
    if (err || !article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    res.json(article);
  });
});

app.post('/api/admin/articles', authMiddleware, adminMiddleware, (req, res) => {
  const { title, summary, content, category, cover_image, is_published } = req.body;

  db.run(
    "INSERT INTO articles (title, summary, content, category, cover_image, is_published, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, summary, content, category, cover_image, is_published ? 1 : 0, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '创建文章失败' });
      }
      res.json({ message: '文章已创建', id: this.lastID });
    }
  );
});

// 更新文章
app.put('/api/admin/articles/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { title, summary, content, category, cover_image, is_published } = req.body;

  db.run(
    "UPDATE articles SET title = ?, summary = ?, content = ?, category = ?, cover_image = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, summary, content, category, cover_image, is_published ? 1 : 0, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: '更新文章失败' });
      }
      res.json({ message: '文章已更新' });
    }
  );
});

// 删除文章
app.delete('/api/admin/articles/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.run("DELETE FROM articles WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: '删除文章失败' });
    }
    res.json({ message: '文章已删除' });
  });
});

// 获取统计数据
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
  const stats = {};

  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    stats.users = row?.count || 0;

    db.get("SELECT COUNT(*) as count FROM articles", (err, row) => {
      stats.articles = row?.count || 0;

      db.get("SELECT SUM(view_count) as total FROM articles", (err, row) => {
        stats.totalViews = row?.total || 0;
        res.json(stats);
      });
    });
  });
});

// 获取系统配置
app.get('/api/admin/settings', authMiddleware, adminMiddleware, (req, res) => {
  db.all("SELECT * FROM settings", (err, settings) => {
    if (err) {
      return res.status(500).json({ error: '获取配置失败' });
    }

    const result = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });

    res.json(result);
  });
});

// 更新系统配置
app.put('/api/admin/settings', authMiddleware, adminMiddleware, (req, res) => {
  const settings = req.body;

  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  Object.entries(settings).forEach(([key, value]) => {
    stmt.run(key, value);
  });
  stmt.finalize();

  res.json({ message: '配置已更新' });
});

// ==================== APP版本管理 ====================

// 获取最新版本信息
app.get('/api/app/version', (req, res) => {
  const { platform = 'android', versionCode } = req.query;

  db.get(
    "SELECT * FROM app_versions WHERE platform = ? AND is_latest = 1 ORDER BY version_code DESC LIMIT 1",
    [platform],
    (err, latest) => {
      if (err) {
        return res.status(500).json({ error: '获取版本信息失败' });
      }

      if (!latest) {
        return res.json({ hasUpdate: false, currentVersion: versionCode });
      }

      // 比较版本号
      const currentCode = parseInt(versionCode) || 0;
      const hasUpdate = latest.version_code > currentCode;

      // 判断是否强制更新
      const forceUpdate = latest.update_type === 'force' && hasUpdate;

      res.json({
        hasUpdate,
        forceUpdate,
        latestVersion: latest.version,
        latestVersionCode: latest.version_code,
        updateType: latest.update_type,
        updateUrl: latest.update_url || 'https://txghzs.19780918.xyz',
        updateContent: latest.update_content,
        currentVersionCode: currentCode
      });
    }
  );
});

// 管理员：获取所有版本
app.get('/api/admin/versions', authMiddleware, adminMiddleware, (req, res) => {
  db.all("SELECT * FROM app_versions ORDER BY created_at DESC", (err, versions) => {
    if (err) {
      return res.status(500).json({ error: '获取版本列表失败' });
    }
    res.json(versions);
  });
});

// 管理员：发布新版本
app.post('/api/admin/versions', authMiddleware, adminMiddleware, (req, res) => {
  const { version, versionCode, platform, updateType, updateUrl, updateContent } = req.body;

  if (!version || !versionCode) {
    return res.status(400).json({ error: '版本号和版本代码不能为空' });
  }

  // 将之前的版本设为非最新
  db.run("UPDATE app_versions SET is_latest = 0 WHERE platform = ?", [platform || 'android']);

  // 插入新版本
  db.run(
    "INSERT INTO app_versions (version, version_code, platform, update_type, update_url, update_content, is_latest) VALUES (?, ?, ?, ?, ?, ?, 1)",
    [version, versionCode, platform || 'android', updateType || 'optional', updateUrl, updateContent],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '发布版本失败' });
      }
      res.json({ message: '版本发布成功', id: this.lastID, version, versionCode });
    }
  );
});

// SPA 回退 - 所有其他路由返回前端
app.get('/*path', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 退休规划助手后端服务已启动`);
  console.log(`📡 API地址: http://localhost:${PORT}/api`);
  console.log(`🌐 前端地址: http://localhost:${PORT}`);
  console.log(`👤 管理员账号: admin / admin123\n`);
});
