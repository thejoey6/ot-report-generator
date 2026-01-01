import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { FileText, Mail, Lock, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import './auth.css';

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isRegister
      ? '/api/users/register'
      : '/api/users/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include", 
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Something went wrong');
        setMessageType('error');
        return;
      }

      if (isRegister) {
        setMessage('Registration successful! Please log in.');
        setMessageType('success');
        setEmail('');
        setPassword('');
        setIsRegister(false);
      } else {
        await login(email, password);
        setMessage('Login successful!');
        setMessageType('success');
      }

    } catch (err) {
      setMessage('Network error: ' + err.message);
      setMessageType('error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo/Brand Section */}
        <div className="auth-brand">
          <div className="brand-icon">
            <FileText className="icon" />
          </div>
          <h1 className="brand-title">OT Report</h1>
          <p className="brand-subtitle">Streamlined Occupational Therapy Reports</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setMessage('');
            }}
          >
            <LogIn size={18} />
            Login
          </button>
          <button
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setMessage('');
            }}
          >
            <UserPlus size={18} />
            Register
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`auth-message ${messageType}`}>
            {messageType === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <div className="auth-form">
          <div className="form-field">
            <label htmlFor="email">
              <Mail size={16} />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">
              <Lock size={16} />
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          <button onClick={handleSubmit} className="auth-submit-btn">
            {isRegister ? (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="auth-footer">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                className="text-link"
                onClick={() => {
                  setIsRegister(false);
                  setMessage('');
                }}
              >
                Sign in here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                className="text-link"
                onClick={() => {
                  setIsRegister(true);
                  setMessage('');
                }}
              >
                Create one now
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}