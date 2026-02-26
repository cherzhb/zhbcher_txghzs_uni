// 在认证API之前插入的图形验证码代码

// 生成图形验证码
app.get('/api/auth/captcha', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 4,
    ignoreChars: '0o1il',
    noise: 2,
    color: true,
    background: '#1e252e'
  });
  
  const captchaId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  captchaStore.set(captchaId, {
    text: captcha.text.toLowerCase(),
    expires: Date.now() + 5 * 60 * 1000
  });
  
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

// 验证图形验证码
const verifyCaptcha = (captchaId, captchaText) => {
  if (!captchaId || !captchaText) {
    return false;
  }
  const stored = captchaStore.get(captchaId);
  if (!stored) {
    return false;
  }
  if (stored.expires < Date.now()) {
    captchaStore.delete(captchaId);
    return false;
  }
  captchaStore.delete(captchaId);
  return stored.text === captchaText.toLowerCase();
};
