import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Button,
  Typography,
  Space,
  Descriptions,
  Empty,
  Spin,
  Timeline,
  Modal,
  Form,
  InputNumber,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useClaims } from '../../hooks/useClaims';
import { usePolicies } from '../../hooks/usePolicies';
import { useIsOwner } from '../../hooks/useContracts';
import { EncryptedField } from '../../components/EncryptedField';
import { StatusBadge } from '../../components/StatusBadge';
import { formatClaimType, formatClaimStatus, formatPolicyType, formatDateTime } from '../../utils/contracts';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

/**
 * Claim Detail page
 */
const ClaimDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { claims, loading, approveClaim, rejectClaim, markPaid } = useClaims();
  const { policies } = usePolicies();
  const isOwner = useIsOwner();
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);

  const claim = claims.find((c) => c.id === Number(id));
  const policy = claim ? policies.find((p) => p.id === claim.policyId) : null;

  const handleApprove = async (values: any) => {
    if (!claim) return;
    setProcessing(true);
    const success = await approveClaim(claim.id, values.amount);
    setProcessing(false);
    if (success) {
      setApproveModalVisible(false);
      form.resetFields();
    }
  };

  const handleReject = async () => {
    if (!claim) return;
    Modal.confirm({
      title: 'Reject Claim',
      content: 'Are you sure you want to reject this claim? This action cannot be undone.',
      okText: 'Reject',
      okType: 'danger',
      onOk: async () => {
        await rejectClaim(claim.id);
      },
    });
  };

  const handleMarkPaid = async () => {
    if (!claim) return;
    Modal.confirm({
      title: 'Mark as Paid',
      content: 'Are you sure you want to mark this claim as paid?',
      okText: 'Confirm',
      onOk: async () => {
        await markPaid(claim.id);
      },
    });
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

  if (!claim) {
    return (
      <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
        <Content style={{ padding: '48px 24px' }}>
          <Empty description="Claim not found" />
        </Content>
      </Layout>
    );
  }

  const claimTypeStr = formatClaimType(claim.claimType);
  const statusStr = formatClaimStatus(claim.status);

  // Status timeline
  const timelineItems = [
    {
      color: 'blue',
      dot: <ClockCircleOutlined />,
      children: (
        <>
          <Text strong>Claim Submitted</Text>
          <br />
          <Text type="secondary">{formatDateTime(claim.submittedAt)}</Text>
        </>
      ),
    },
  ];

  if (claim.status >= 1) {
    timelineItems.push({
      color: 'orange',
      dot: <ClockCircleOutlined />,
      children: <Text strong>Under Review</Text>,
    });
  }

  if (claim.status === 2) {
    timelineItems.push({
      color: 'green',
      dot: <CheckCircleOutlined />,
      children: <Text strong>Claim Approved</Text>,
    });
  } else if (claim.status === 3) {
    timelineItems.push({
      color: 'red',
      dot: <CloseCircleOutlined />,
      children: <Text strong>Claim Rejected</Text>,
    });
  }

  if (claim.status === 4) {
    timelineItems.push({
      color: 'green',
      dot: <DollarOutlined />,
      children: <Text strong>Payment Completed</Text>,
    });
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/claims')}
            style={{ marginBottom: '24px' }}
          >
            Back to Claims
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
              <FileTextOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
              <div>
                <Title level={1} style={{ margin: 0 }}>
                  {claimTypeStr} Claim
                </Title>
                <Text type="secondary">Claim #{claim.id}</Text>
              </div>
            </Space>
            {isOwner && claim.status <= 1 && (
              <Space>
                <Button danger onClick={handleReject}>
                  Reject
                </Button>
                <Button type="primary" onClick={() => setApproveModalVisible(true)}>
                  Approve
                </Button>
              </Space>
            )}
            {isOwner && claim.status === 2 && (
              <Button type="primary" onClick={handleMarkPaid}>
                Mark as Paid
              </Button>
            )}
          </div>

          {/* Claim Details */}
          <Card
            title="Claim Information"
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Claim ID">#{claim.id}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={statusStr} />
              </Descriptions.Item>
              <Descriptions.Item label="Policy ID">
                <Button type="link" onClick={() => navigate(`/policies/${claim.policyId}`)}>
                  #{claim.policyId}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="Policy Type">
                {policy ? formatPolicyType(policy.policyType) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Claim Type">{claimTypeStr}</Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {formatDateTime(claim.submittedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Claimant">
                <Text code style={{ fontSize: '12px' }}>
                  {claim.claimant}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Claim Amount">
                <EncryptedField />
              </Descriptions.Item>
              {claim.status >= 2 && (
                <Descriptions.Item label="Approved Amount" span={2}>
                  <EncryptedField />
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Description" span={2}>
                <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {claim.description}
                </Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Status Timeline */}
          <Card title="Status History" style={{ borderRadius: '8px' }}>
            <Timeline items={timelineItems} />
          </Card>
        </div>
      </Content>

      {/* Approve Modal */}
      <Modal
        title="Approve Claim"
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Alert
          message="Encrypted Approval"
          description="The approved amount will be encrypted before being stored on-chain."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Form form={form} layout="vertical" onFinish={handleApprove}>
          <Form.Item
            label="Approved Amount"
            name="amount"
            rules={[
              { required: true, message: 'Please enter approved amount' },
              { type: 'number', min: 1, message: 'Amount must be greater than 0' },
            ]}
          >
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              prefix="$"
              placeholder="Enter approved amount"
              min={1}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setApproveModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={processing}>
                Approve
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ClaimDetail;
