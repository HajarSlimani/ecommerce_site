import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/');
    }
  }

  return (
    <div className="auth-shell">
      <h1>Connexion</h1>
      <p className="lede">Accédez à votre panier et à l'historique de vos commandes Reforge.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Mot de passe</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary btn-full" style={{ marginTop: 22 }} disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="auth-switch">
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}
