import { Card, Typography, Space, Button } from 'antd';
import { SafetyOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Policy } from '../hooks/usePolicies';
import { StatusBadge } from './StatusBadge';
import { EncryptedField } from './EncryptedField';
import { formatPolicyType, formatPolicyStatus, formatDate } from '../utils/contracts';

const { Title, Text } = Typography;

interface PolicyCardProps {
  policy: Policy;
}

/**
 * Card component to display policy information
 */
export const PolicyCard: React.FC<PolicyCardProps> = ({ policy }) => {
  const navigate = useNavigate();
  const policyTypeStr = formatPolicyType(policy.policyType);
  const statusStr = formatPolicyStatus(policy.status);

  return (
    <Card
      hoverable
      onClick={() => navigate(`/policies/${policy.id}`)}
      style={{
        borderRadius: '8px',
        border: '1px solid hsl(var(--border))',
      }}
      styles={{
        body: { padding: '20px' },
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Space>
            <SafetyOutlined style={{ fontSize: '24px', color: 'hsl(var(--primary))' }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {policyTypeStr} Insurance
              </Title>
              <Text type="secondary">Policy #{policy.id}</Text>
            </div>
          </Space>
          <StatusBadge status={statusStr} />
        </div>

        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Premium:</Text>
            <EncryptedField size="small" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Coverage:</Text>
            <EncryptedField size="small" />
          </div>
        </Space>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: 'hsl(var(--muted-foreground))' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
          </Text>
        </div>

        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/claims/create?policyId=${policy.id}`);
          }}
        >
          Submit Claim
        </Button>
      </Space>
    </Card>
  );
};
