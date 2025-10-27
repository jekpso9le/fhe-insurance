import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Form,
  Select,
  InputNumber,
  Button,
  Typography,
  Space,
  Alert,
} from 'antd';
import { ArrowLeftOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { usePolicies } from '../../hooks/usePolicies';
import { PolicyType } from '../../utils/contracts';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Create Policy page
 */
const CreatePolicy = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { createPolicy } = usePolicies();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const result = await createPolicy(
        values.policyType,
        values.premium,
        values.coverage,
        values.duration
      );

      if (result) {
        navigate('/policies');
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
            <SafetyOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
            <div>
              <Title level={1} style={{ margin: 0 }}>
                Create Insurance Policy
              </Title>
              <Text type="secondary">Set up your privacy-protected insurance coverage</Text>
            </div>
          </Space>

          <Alert
            message="Privacy Protected"
            description="Your premium and coverage amounts will be encrypted using FHE technology. Only you and authorized parties can access this information."
            type="info"
            icon={<LockOutlined />}
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Card style={{ borderRadius: '8px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                policyType: PolicyType.Health,
                duration: 12,
              }}
            >
              <Form.Item
                label="Insurance Type"
                name="policyType"
                rules={[{ required: true, message: 'Please select insurance type' }]}
              >
                <Select size="large">
                  <Option value={PolicyType.Health}>
                    <Space>
                      🏥 Health Insurance
                    </Space>
                  </Option>
                  <Option value={PolicyType.Property}>
                    <Space>
                      🏠 Property Insurance
                    </Space>
                  </Option>
                  <Option value={PolicyType.Life}>
                    <Space>
                      💼 Life Insurance
                    </Space>
                  </Option>
                  <Option value={PolicyType.Cyber}>
                    <Space>
                      🔒 Cyber Insurance
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <span>Monthly Premium</span>
                    <LockOutlined style={{ color: 'hsl(var(--primary))' }} />
                  </Space>
                }
                name="premium"
                rules={[
                  { required: true, message: 'Please enter monthly premium' },
                  { type: 'number', min: 1, message: 'Premium must be greater than 0' },
                ]}
                extra="This amount will be encrypted before being stored on-chain"
              >
                <InputNumber
                  size="large"
                  style={{ width: '100%' }}
                  prefix="$"
                  placeholder="Enter monthly premium amount"
                  min={1}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <span>Maximum Coverage Amount</span>
                    <LockOutlined style={{ color: 'hsl(var(--primary))' }} />
                  </Space>
                }
                name="coverage"
                rules={[
                  { required: true, message: 'Please enter coverage amount' },
                  { type: 'number', min: 1000, message: 'Coverage must be at least $1,000' },
                ]}
                extra="This amount will be encrypted before being stored on-chain"
              >
                <InputNumber
                  size="large"
                  style={{ width: '100%' }}
                  prefix="$"
                  placeholder="Enter maximum coverage amount"
                  min={1000}
                />
              </Form.Item>

              <Form.Item
                label="Policy Duration"
                name="duration"
                rules={[
                  { required: true, message: 'Please select duration' },
                  { type: 'number', min: 1, max: 60, message: 'Duration must be 1-60 months' },
                ]}
              >
                <Select size="large">
                  <Option value={3}>3 Months</Option>
                  <Option value={6}>6 Months</Option>
                  <Option value={12}>12 Months (1 Year)</Option>
                  <Option value={24}>24 Months (2 Years)</Option>
                  <Option value={36}>36 Months (3 Years)</Option>
                </Select>
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
                    Create Policy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default CreatePolicy;
