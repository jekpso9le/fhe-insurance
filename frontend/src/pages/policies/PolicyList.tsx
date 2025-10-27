import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Table,
  Button,
  Typography,
  Space,
  Select,
  Tag,
  Empty,
} from 'antd';
import { PlusOutlined, SafetyOutlined, EyeOutlined } from '@ant-design/icons';
import { usePolicies } from '../../hooks/usePolicies';
import { EncryptedField } from '../../components/EncryptedField';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPolicyType, formatPolicyStatus, formatDate } from '../../utils/contracts';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Policy List page
 */
const PolicyList = () => {
  const navigate = useNavigate();
  const { policies, loading } = usePolicies();
  const [typeFilter, setTypeFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<number | undefined>();

  const filteredPolicies = policies.filter((policy) => {
    if (typeFilter !== undefined && policy.policyType !== typeFilter) return false;
    if (statusFilter !== undefined && policy.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    {
      title: 'Policy ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'policyType',
      key: 'policyType',
      render: (type: number) => formatPolicyType(type),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => <StatusBadge status={formatPolicyStatus(status)} />,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: number) => formatDate(date),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: number) => formatDate(date),
    },
    {
      title: 'Premium',
      key: 'premium',
      render: () => <EncryptedField size="small" />,
    },
    {
      title: 'Coverage',
      key: 'coverage',
      render: () => <EncryptedField size="small" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/policies/${record.id}`)}
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
              <SafetyOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
              <div>
                <Title level={1} style={{ margin: 0 }}>
                  Insurance Policies
                </Title>
                <Text type="secondary">View and manage your insurance policies</Text>
              </div>
            </Space>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/policies/create')}
            >
              Create New Policy
            </Button>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Select
              placeholder="Filter by Type"
              style={{ width: 200 }}
              allowClear
              onChange={setTypeFilter}
            >
              <Option value={0}>Health</Option>
              <Option value={1}>Property</Option>
              <Option value={2}>Life</Option>
              <Option value={3}>Cyber</Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: 200 }}
              allowClear
              onChange={setStatusFilter}
            >
              <Option value={0}>Active</Option>
              <Option value={1}>Suspended</Option>
              <Option value={2}>Cancelled</Option>
              <Option value={3}>Expired</Option>
            </Select>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredPolicies}
            loading={loading}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  description="No policies found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} policies`,
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

export default PolicyList;
