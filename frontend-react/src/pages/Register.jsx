import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError('');

    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    const success = await register(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/');
    }
  }

  return (
    <div className="auth-shell">
      <h1>Créer un compte</h1>
      <p className="lede">Rejoignez Reforge pour suivre vos commandes de matériel gaming reconditionné.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Mot de passe</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-confirm-password">Confirmer le mot de passe</label>
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {(localError || error) && <p className="form-error">{localError || error}</p>}

        <button type="submit" className="btn-primary btn-full" style={{ marginTop: 22 }} disabled={submitting}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="auth-switch">
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}
