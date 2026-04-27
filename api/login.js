export default function handler(req, res) {
  // السماح فقط لطلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // تحقق بسيط (يمكنك تعديل بيانات الدخول هنا)
  if (username === 'admin@example.com' && password === 'admin123') {
    return res.status(200).json({ 
      success: true, 
      token: 'fake-jwt-token',
      message: 'Login successful' 
    });
  }

  // فشل تسجيل الدخول
  return res.status(401).json({ 
    success: false, 
    error: 'Invalid username or password' 
  });
}
