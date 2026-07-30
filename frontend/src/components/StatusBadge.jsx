import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    pending: { bg: '#fef3c7', text: '#d97706', label: 'Pending' },
    in_progress: { bg: '#dbeafe', text: '#2563eb', label: 'In Progress' },
    resolved: { bg: '#dcfce7', text: '#16a34a', label: 'Resolved' },
  };

  const current = styles[status] || styles.pending;

  return (
    <span
      style={{
        backgroundColor: current.bg,
        color: current.text,
        padding: '4px 8px',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '12px',
        textTransform: 'uppercase',
      }}
    >
      {current.label}
    </span>
  );
}
