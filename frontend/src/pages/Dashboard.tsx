import { useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Card, Button, Typography, Space, Statistic, Empty } from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  SafetyOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { usePolicies } from '../hooks/usePolicies';
import { useClaims } from '../hooks/useClaims';
import { PolicyCard } from '../components/PolicyCard';
import { ClaimCard } from '../components/ClaimCard';
import { RiskScoreChart } from '../components/RiskScoreChart';

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * Dashboard page - User's insurance overview and quick actions
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { policies, loading: policiesLoading } = usePolicies();
  const { claims, loading: claimsLoading } = useClaims();

  const activePolicies = policies.filter((p) => p.status === 0);
  const activeClaims = claims.filter((c) => c.status <= 1);

  return (
    <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <Space size="middle" style={{ marginBottom: '24px' }}>
              <DashboardOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
              <div>
                <Title level={1} style={{ margin: 0 }}>
                  Dashboard
                </Title>
                <Text type="secondary">Manage your insurance and claims</Text>
              </div>
            </Space>
          </div>

          {/* Quick Actions */}
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12}>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                block
                onClick={() => navigate('/policies/create')}
                style={{ height: '56px', fontSize: '16px' }}
              >
                Create New Policy
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                size="large"
                icon={<FileTextOutlined />}
                block
                onClick={() => navigate('/claims/create')}
                style={{ height: '56px', fontSize: '16px' }}
              >
                Submit Claim
              </Button>
            </Col>
          </Row>

          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '8px' }}>
                <Statistic
                  title="Active Policies"
                  value={activePolicies.length}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: 'hsl(var(--primary))' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '8px' }}>
                <Statistic
                  title="Active Claims"
                  value={activeClaims.length}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: 'hsl(var(--warning))' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '8px' }}>
                <Statistic
                  title="Total Policies"
                  value={policies.length}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: 'hsl(var(--success))' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Risk Score */}
          <div style={{ marginBottom: '32px' }}>
            <RiskScoreChart hasProfile={false} />
          </div>

          {/* Active Policies */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={3}>Active Policies</Title>
              <Button type="link" onClick={() => navigate('/policies')}>
                View All
              </Button>
            </div>
            {policiesLoading ? (
              <div>Loading...</div>
            ) : activePolicies.length > 0 ? (
              <Row gutter={[16, 16]}>
                {activePolicies.slice(0, 3).map((policy) => (
                  <Col xs={24} md={8} key={policy.id}>
                    <PolicyCard policy={policy} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No active policies" />
            )}
          </div>

          {/* Recent Claims */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={3}>Recent Claims</Title>
              <Button type="link" onClick={() => navigate('/claims')}>
                View All
              </Button>
            </div>
            {claimsLoading ? (
              <div>Loading...</div>
            ) : claims.length > 0 ? (
              <Row gutter={[16, 16]}>
                {claims.slice(0, 3).map((claim) => (
                  <Col xs={24} md={8} key={claim.id}>
                    <ClaimCard claim={claim} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No claims submitted yet" />
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
