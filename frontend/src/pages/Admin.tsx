import { useState } from 'react';
import { Layout, Card, Table, Button, Typography, Space, Statistic, Row, Col, Empty } from 'antd';
import {
  SettingOutlined,
  FileTextOutlined,
  SafetyOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useClaims } from '../hooks/useClaims';
import { usePolicies } from '../hooks/usePolicies';
import { useIsOwner } from '../hooks/useContracts';
import { StatusBadge } from '../components/StatusBadge';
import { formatClaimType, formatClaimStatus, formatDateTime } from '../utils/contracts';

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * Admin page - Only accessible by contract owner
 */
const Admin = () => {
  const navigate = useNavigate();
  const isOwner = useIsOwner();
  const { claims } = useClaims();
  const { policies } = usePolicies();

  const pendingClaims = claims.filter((c) => c.status <= 1);
  const approvedClaims = claims.filter((c) => c.status === 2);
  const activePolicies = policies.filter((p) => p.status === 0);

  // If not owner, show access denied
  if (!isOwner) {
    return (
      <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
            <Empty
              description={
                <div>
                  <Title level={3}>Access Denied</Title>
                  <Text type="secondary">
                    This page is only accessible by the contract administrator.
                  </Text>
                </div>
              }
            />
            <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: '24px' }}>
              Go to Dashboard
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  const columns = [
    {
      title: 'Claim ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Policy ID',
      dataIndex: 'policyId',
      key: 'policyId',
      render: (id: number) => <Text>#{id}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'claimType',
      key: 'claimType',
      render: (type: number) => formatClaimType(type),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => <StatusBadge status={formatClaimStatus(status)} />,
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: number) => formatDateTime(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/claims/${record.id}`)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <Space size="middle" style={{ marginBottom: '32px' }}>
            <SettingOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
            <div>
              <Title level={1} style={{ margin: 0 }}>
                Admin Dashboard
              </Title>
              <Text type="secondary">Manage claims and monitor system statistics</Text>
            </div>
          </Space>

          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: '8px' }}>
                <Statistic
                  title="Total Policies"
                  value={policies.length}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: 'hsl(var(--primary))' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: '8px' }}>
                <Statistic
                  title="Active Policies"
                  value={activePolicies.length}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: 'hsl(var(--success))' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: '8px' }}>
                <Statistic
                  title="Pending Claims"
                  value={pendingClaims.length}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: 'hsl(var(--warning))' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: '8px' }}>
                <Statistic
                  title="Approved Claims"
                  value={approvedClaims.length}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: 'hsl(var(--success))' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Pending Claims Table */}
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Claims Awaiting Review</span>
              </Space>
            }
            style={{ borderRadius: '8px' }}
          >
            <Table
              columns={columns}
              dataSource={pendingClaims}
              rowKey="id"
              locale={{
                emptyText: (
                  <Empty
                    description="No claims pending review"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} claims`,
              }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Admin;
