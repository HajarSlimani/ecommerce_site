import React from 'react';

// Signature visuelle de Reforge : chaque unité reconditionnée est notée
// NEW / A / B après inspection. Ce badge reprend ce sceau partout où un
// produit ou une unité est affiché, pour ancrer la promesse de confiance.
export default function GradeSeal({ grade }) {
  if (!grade) {
    return null;
  }
  return (
    <span className="grade-seal" data-grade={grade}>
      Grade {grade}
    </span>
  );
}
