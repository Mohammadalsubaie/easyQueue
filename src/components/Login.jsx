import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Redirect after login
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };


  return (
    <div className="auth-container">
      <h1>EasyQueue</h1>
      <div className="image-placeholder">ICON<br />or<br />Log in image</div>
      
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
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        <button className="auth-button" disabled={loading}>
          {loading ? 'Loading...' : 'Log in'}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/forgot-password">Forgot your password? Click here</Link>
        <Link to="/register">New user? Sign up here</Link>
      </div>
    </div>
  );
};

export default Login;