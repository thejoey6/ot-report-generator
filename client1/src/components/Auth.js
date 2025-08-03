import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';


export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

       const endpoint = isRegister
        ? 'http://localhost:4000/api/users/register'
        : 'http://localhost:4000/api/users/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Something went wrong');
        return;
      }

      if (isRegister) {
        setMessage('Registration successful! Please log in.');
        setEmail('');
        setPassword('');
        setIsRegister(false);
      } else {
        // Login success: store JWT token
        login(data.token);
        setMessage('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage('Network error: ' + err.message);
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setIsRegister(true)} disabled={isRegister}>Register</button>
        <button onClick={() => setIsRegister(false)} disabled={!isRegister}>Login</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}