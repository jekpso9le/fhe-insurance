import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Table,
  Button,
  Typography,
  Space,
  Select,
  Empty,
} from 'antd';
import { PlusOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import { useClaims } from '../../hooks/useClaims';
import { EncryptedField } from '../../components/EncryptedField';
import { StatusBadge } from '../../components/StatusBadge';
import { formatClaimType, formatClaimStatus, formatDateTime } from '../../utils/contracts';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Claim List page
 */
const ClaimList = () => {
  const navigate = useNavigate();
  const { claims, loading } = useClaims();
  const [statusFilter, setStatusFilter] = useState<number | undefined>();

  const filteredClaims = claims.filter((claim) => {
    if (statusFilter !== undefined && claim.status !== statusFilter) return false;
    return true;
  });

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
      render: (id: number) => <Text>Policy #{id}</Text>,
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
      title: 'Claim Amount',
      key: 'amount',
      render: () => <EncryptedField size="small" />,
    },
    {
      title: 'Approved Amount',
      key: 'approvedAmount',
      render: (_: any, record: any) =>
        record.status >= 2 ? <EncryptedField size="small" /> : <Text type="secondary">-</Text>,
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
          View
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <Space size="middle">
              <FileTextOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
              <div>
                <Title level={1} style={{ margin: 0 }}>
                  Insurance Claims
                </Title>
                <Text type="secondary">View and manage your insurance claims</Text>
              </div>
            </Space>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/claims/create')}
            >
              Submit New Claim
            </Button>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: '24px' }}>
            <Select
              placeholder="Filter by Status"
              style={{ width: 200 }}
              allowClear
              onChange={setStatusFilter}
            >
              <Option value={0}>Pending</Option>
              <Option value={1}>Under Review</Option>
              <Option value={2}>Approved</Option>
              <Option value={3}>Rejected</Option>
              <Option value={4}>Paid</Option>
            </Select>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredClaims}
            loading={loading}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  description="No claims found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} claims`,
            }}
            style={{
              background: 'hsl(var(--card))',
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
            }}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default ClaimList;
