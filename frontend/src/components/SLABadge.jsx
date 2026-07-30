import React from 'react';

export default function SLABadge({ slaDeadline, status }) {
  if (status === 'resolved') {
    return (
      <span className="badge badge-resolved">
        ✓ Resolved
      </span>
    );
  }

  const deadline = new Date(slaDeadline).getTime();
  const now = new Date().getTime();
  const diffHours = Math.round((deadline - now) / (1000 * 60 * 60));

  if (diffHours < 0) {
    return (
      <span className="badge badge-escalated">
        ⚠️ SLA Breached (Escalated)
      </span>
    );
  }

  return (
    <span className="badge badge-warning">
      ⏳ {diffHours}h Remaining
    </span>
  );
}
