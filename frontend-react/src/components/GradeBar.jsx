import React from 'react';

const GRADE_ORDER = ['NEW', 'A', 'B', 'C'];
const GRADE_LABELS = { NEW: 'Neuf', A: 'Grade A', B: 'Grade B', C: 'Grade C' };

export default function GradeBar({ breakdown }) {
  const total = GRADE_ORDER.reduce((sum, grade) => sum + Number(breakdown?.[grade] || 0), 0);

  if (!total) {
    return <div className="empty-state">Aucune unité disponible en stock pour le moment.</div>;
  }

  return (
    <div>
      <div className="grade-bar">
        {GRADE_ORDER.map((grade) => {
          const count = Number(breakdown?.[grade] || 0);
          if (!count) {
            return null;
          }
          const percent = (count / total) * 100;
          return (
            <div
              key={grade}
              className="grade-bar-segment"
              data-grade={grade}
              style={{ flexBasis: `${percent}%` }}
              title={`${GRADE_LABELS[grade]} — ${count} unité(s)`}
            />
          );
        })}
      </div>

      <div className="grade-legend">
        {GRADE_ORDER.map((grade) => {
          const count = Number(breakdown?.[grade] || 0);
          const percent = total ? Math.round((count / total) * 100) : 0;
          return (
            <span className="grade-legend-item" key={grade}>
              <span className="grade-legend-dot" data-grade={grade} />
              {GRADE_LABELS[grade]} <strong>{count}</strong>
              <span style={{ color: 'var(--muted)' }}>({percent}%)</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
