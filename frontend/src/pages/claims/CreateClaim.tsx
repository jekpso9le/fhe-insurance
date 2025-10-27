import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layout,
  Card,
  Form,
  Select,
  InputNumber,
  Input,
  Button,
  Typography,
  Space,
  Alert,
} from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, LockOutlined } from '@ant-design/icons';
import { useClaims } from '../../hooks/useClaims';
import { usePolicies } from '../../hooks/usePolicies';
import { ClaimType } from '../../utils/contracts';
import { formatPolicyType } from '../../utils/contracts';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * Create Claim page
 */
const CreateClaim = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const { submitClaim } = useClaims();
  const { policies } = usePolicies();
  const [loading, setLoading] = useState(false);

  const policyIdParam = searchParams.get('policyId');

  useEffect(() => {
    if (policyIdParam) {
      form.setFieldsValue({ policyId: Number(policyIdParam) });
    }
  }, [policyIdParam, form]);

  const activePolicies = policies.filter((p) => p.status === 0);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const result = await submitClaim(
        values.policyId,
        values.claimType,
        values.amount,
        values.description
      );

      if (result) {
        navigate('/claims');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: '24px' }}
          >
            Back
          </Button>

          <Space size="middle" style={{ marginBottom: '32px' }}>
            <FileTextOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
            <div>
              <Title level={1} style={{ margin: 0 }}>
                Submit Insurance Claim
              </Title>
              <Text type="secondary">File a claim for your insurance policy</Text>
            </div>
          </Space>

          <Alert
            message="Privacy Protected"
            description="Your claim amount will be encrypted using FHE technology. Only you and authorized administrators can access this information."
            type="info"
            icon={<LockOutlined />}
            showIcon
            style={{ marginBottom: '24px' }}
          />

          {activePolicies.length === 0 ? (
            <Card style={{ borderRadius: '8px' }}>
              <Alert
                message="No Active Policies"
                description="You need an active insurance policy to submit a claim. Please create a policy first."
                type="warning"
                showIcon
                action={
                  <Button type="primary" onClick={() => navigate('/policies/create')}>
                    Create Policy
                  </Button>
                }
              />
            </Card>
          ) : (
            <Card style={{ borderRadius: '8px' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  claimType: ClaimType.Medical,
                }}
              >
                <Form.Item
                  label="Select Policy"
                  name="policyId"
                  rules={[{ required: true, message: 'Please select a policy' }]}
                >
                  <Select size="large" placeholder="Choose an active policy">
                    {activePolicies.map((policy) => (
                      <Option key={policy.id} value={policy.id}>
                        #{policy.id} - {formatPolicyType(policy.policyType)} Insurance
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Claim Type"
                  name="claimType"
                  rules={[{ required: true, message: 'Please select claim type' }]}
                >
                  <Select size="large">
                    <Option value={ClaimType.Medical}>🏥 Medical</Option>
                    <Option value={ClaimType.Accident}>🚗 Accident</Option>
                    <Option value={ClaimType.Property}>🏠 Property</Option>
                    <Option value={ClaimType.Cyber}>🔒 Cyber</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <Space>
                      <span>Claim Amount</span>
                      <LockOutlined style={{ color: 'hsl(var(--primary))' }} />
                    </Space>
                  }
                  name="amount"
                  rules={[
                    { required: true, message: 'Please enter claim amount' },
                    { type: 'number', min: 1, message: 'Amount must be greater than 0' },
                  ]}
                  extra="This amount will be encrypted before being stored on-chain"
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%' }}
                    prefix="$"
                    placeholder="Enter claim amount"
                    min={1}
                  />
                </Form.Item>

                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { required: true, message: 'Please provide a description' },
                    { min: 10, message: 'Description must be at least 10 characters' },
                    { max: 500, message: 'Description must not exceed 500 characters' },
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Describe the reason for your claim, including relevant details..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
                  <Space size="middle" style={{ width: '100%' }}>
                    <Button
                      size="large"
                      onClick={() => navigate(-1)}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={loading}
                      style={{ flex: 2 }}
                    >
                      Submit Claim
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default CreateClaim;
