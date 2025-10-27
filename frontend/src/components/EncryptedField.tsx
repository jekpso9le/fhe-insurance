import { LockOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

interface EncryptedFieldProps {
  label?: string;
  size?: 'small' | 'default';
}

/**
 * Component to display encrypted data indicator
 */
export const EncryptedField: React.FC<EncryptedFieldProps> = ({ 
  label = 'Encrypted', 
  size = 'default' 
}) => {
  return (
    <Tag
      icon={<LockOutlined />}
      color="blue"
      style={{
        fontSize: size === 'small' ? '12px' : '14px',
        padding: size === 'small' ? '2px 8px' : '4px 12px',
        borderRadius: '4px',
      }}
    >
      {label}
    </Tag>
  );
};
