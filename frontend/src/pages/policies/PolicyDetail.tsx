import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Button,
  Typography,
  Space,
  Descriptions,
  Divider,
  Empty,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  SafetyOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { usePolicies, Policy } from '../../hooks/usePolicies';
import { useClaims } from '../../hooks/useClaims';
import { EncryptedField } from '../../components/EncryptedField';
import { StatusBadge } from '../../components/StatusBadge';
import { ClaimCard } from '../../components/ClaimCard';
import { formatPolicyType, formatPolicyStatus, formatDate } from '../../utils/contracts';

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * Policy Detail page
 */
const PolicyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { policies, loading, renewPolicy } = usePolicies();
  const { claims } = useClaims();
  const [renewing, setRenewing] = useState(false);

  const policy = policies.find((p) => p.id === Number(id));
  const policyClaims = claims.filter((c) => c.policyId === Number(id));

  const handleRenew = async () => {
    if (!policy) return;
    setRenewing(true);
    await renewPolicy(policy.id);
    setRenewing(false);
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
        <Content style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!policy) {
    return (
      <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
        <Content style={{ padding: '48px 24px' }}>
          <Empty description="Policy not found" />
        </Content>
      </Layout>
    );
  }

  const policyTypeStr = formatPolicyType(policy.policyType);
  const statusStr = formatPolicyStatus(policy.status);

  return (
    <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/policies')}
            style={{ marginBottom: '24px' }}
          >
            Back to Policies
          </Button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <Space size="middle">
              <SafetyOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
              <div>
                <Title level={1} style={{ margin: 0 }}>
                  {policyTypeStr} Insurance
                </Title>
                <Text type="secondary">Policy #{policy.id}</Text>
              </div>
            </Space>
            <Space>
              {policy.status === 0 && (
                <>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRenew}
                    loading={renewing}
                  >
                    Renew Policy
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={() => navigate(`/claims/create?policyId=${policy.id}`)}
                  >
                    Submit Claim
                  </Button>
                </>
              )}
            </Space>
          </div>

          {/* Policy Details */}
          <Card
            title="Policy Information"
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Policy ID">#{policy.id}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={statusStr} />
              </Descriptions.Item>
              <Descriptions.Item label="Type">{policyTypeStr}</Descriptions.Item>
              <Descriptions.Item label="Owner">
                <Text code style={{ fontSize: '12px' }}>
                  {policy.owner}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {formatDate(policy.startDate)}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {formatDate(policy.endDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Monthly Premium">
                <EncryptedField />
              </Descriptions.Item>
              <Descriptions.Item label="Coverage Amount">
                <EncryptedField />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Claims History */}
          <Card title="Claims History" style={{ borderRadius: '8px' }}>
            {policyClaims.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {policyClaims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </div>
            ) : (
              <Empty description="No claims submitted for this policy yet" />
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default PolicyDetail;
