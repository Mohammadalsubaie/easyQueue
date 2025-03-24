import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== rePassword) {
      return setError("Passwords don't match");
    }
    setLoading(true);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect to login
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h1>EasyQueue</h1>
      <div className="image-placeholder">ICON<br />or<br />sign up image</div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <div className="password-input">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              ⓒ
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>RePassword</label>
          <div className="password-input">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              ⓒ
            </span>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        <button className="auth-button" disabled={loading}>
          {loading ? 'Loading...' : 'Sign up'}
        </button>

      </form>

      <div className="auth-links">
        <Link to="/">Already have an account? Log in here</Link>
      </div>
    </div>
  );
};

export default Register;