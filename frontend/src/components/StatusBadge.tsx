import { Tag } from 'antd';
import { getStatusColor } from '../utils/formatters';

interface StatusBadgeProps {
  status: string;
}

/**
 * Component to display status badges with appropriate colors
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = getStatusColor(status);

  return (
    <Tag color={color} style={{ borderRadius: '4px', fontWeight: 500 }}>
      {status}
    </Tag>
  );
};
