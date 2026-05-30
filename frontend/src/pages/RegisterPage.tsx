import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';

interface FormState {
  name: string;
  email: string;
  password: string;
  address: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  address?: string;
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>])/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (form.name.length < 20) errors.name = 'Name must be at least 20 characters';
  else if (form.name.length > 60) errors.name = 'Name must be at most 60 characters';
  if (!EMAIL_REGEX.test(form.email)) errors.email = 'Enter a valid email address';
  if (form.password.length < 8 || form.password.length > 16)
    errors.password = 'Password must be 8–16 characters';
  else if (!PASSWORD_REGEX.test(form.password))
    errors.password = 'Must include an uppercase letter and a special character';
  if (form.address.length === 0) errors.address = 'Address is required';
  else if (form.address.length > 400) errors.address = 'Address must be at most 400 characters';
  return errors;
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear field error on change for a responsive feel
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setApiError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err: any) {
      setApiError(err.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <span className="logo-icon">⭐</span>
          <h1 className="auth-title">StoreRate</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {apiError && <div className="alert alert-error">{apiError}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="At least 20 characters"
                value={form.name}
                onChange={handleChange}
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="8–16 chars, 1 uppercase, 1 special character"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              className="form-input form-textarea"
              placeholder="Your address (max 400 characters)"
              value={form.address}
              onChange={handleChange}
              rows={3}
              required
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
