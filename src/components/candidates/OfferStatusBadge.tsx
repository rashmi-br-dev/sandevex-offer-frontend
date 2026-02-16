import React from 'react';
import { Tag } from 'antd';

interface OfferStatusBadgeProps {
  status?: 'pending' | 'accepted' | 'declined' | 'expired' | null;
}

const OfferStatusBadge: React.FC<OfferStatusBadgeProps> = ({ status }) => {
  if (!status) return null;

  const statusMap = {
    pending: { color: 'orange', text: 'Offer Sent' },
    accepted: { color: 'green', text: 'Accepted' },
    declined: { color: 'red', text: 'Declined' },
    expired: { color: 'default', text: 'Expired' },
  };

  const statusInfo = statusMap[status] || { color: 'default', text: 'Unknown' };

  return (
    <Tag color={statusInfo.color} style={{ margin: 0 }}>
      {statusInfo.text}
    </Tag>
  );
};

export default OfferStatusBadge;
