import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient.js';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('12345678');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">تسجيل الدخول</h2>
        <p className="login-subtitle">دخول لوحة تحكم مكتب رموز الفكر</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            البريد الإلكتروني
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="login-label">
            كلمة المرور
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
