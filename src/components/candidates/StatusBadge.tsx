import React from 'react';

type Status = 'accepted' | 'rejected' | 'pending' | 'sent' | 'Accepted' | 'Rejected' | 'Pending' | 'Sent';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles = {
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-blue-100 text-blue-800',
  // Add title case variants for backward compatibility
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Sent: 'bg-blue-100 text-blue-800',
} as const;

const statusLabels = {
  accepted: 'Accepted',
  rejected: 'Rejected',
  pending: 'Pending',
  sent: 'Sent',
  // Add title case variants for backward compatibility
  Accepted: 'Accepted',
  Rejected: 'Rejected',
  Pending: 'Pending',
  Sent: 'Sent',
} as const;

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
