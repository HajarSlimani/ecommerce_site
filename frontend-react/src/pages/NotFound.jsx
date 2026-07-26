import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <span className="code">Erreur 404</span>
      <h1>Cette page n'existe pas.</h1>
      <p>Le lien est peut-être mal orthographié, ou la page a été déplacée.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')} type="button">
        Retour à l'accueil
      </button>
    </div>
  );
}
