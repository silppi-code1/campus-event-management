// Login Page: Allows users to login with email and password
// Saves JWT token to localStorage and redirects to home

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API call to login endpoint
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user info to localStorage
      onLogin(data.token, data.user);

      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="page-heading">
        <h1>Login</h1>
        <p>Enter your credentials to access your account</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••"
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>

      {/* Demo Credentials */}
      <div
        style={{
          background: '#e3f2fd',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#1565c0',
        }}
      >
        <strong>Demo Credentials:</strong>
        <div>Student: student@example.com / password</div>
        <div>Admin: admin@example.com / password</div>
      </div>
    </div>
  );
}

export default Login;
