import { Card, Typography, Space, Tag } from 'antd';
import { FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Claim } from '../hooks/useClaims';
import { StatusBadge } from './StatusBadge';
import { EncryptedField } from './EncryptedField';
import { formatClaimType, formatClaimStatus, formatDateTime } from '../utils/contracts';

const { Title, Text, Paragraph } = Typography;

interface ClaimCardProps {
  claim: Claim;
}

/**
 * Card component to display claim information
 */
export const ClaimCard: React.FC<ClaimCardProps> = ({ claim }) => {
  const navigate = useNavigate();
  const claimTypeStr = formatClaimType(claim.claimType);
  const statusStr = formatClaimStatus(claim.status);

  return (
    <Card
      hoverable
      onClick={() => navigate(`/claims/${claim.id}`)}
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
            <FileTextOutlined style={{ fontSize: '24px', color: 'hsl(var(--primary))' }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {claimTypeStr} Claim
              </Title>
              <Text type="secondary">Claim #{claim.id} · Policy #{claim.policyId}</Text>
            </div>
          </Space>
          <StatusBadge status={statusStr} />
        </div>

        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ margin: 0, color: 'hsl(var(--foreground))' }}
        >
          {claim.description}
        </Paragraph>

        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Claim Amount:</Text>
            <EncryptedField size="small" />
          </div>
          {claim.status >= 2 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Approved Amount:</Text>
              <EncryptedField size="small" />
            </div>
          )}
        </Space>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: 'hsl(var(--muted-foreground))' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Submitted: {formatDateTime(claim.submittedAt)}
          </Text>
        </div>
      </Space>
    </Card>
  );
};
