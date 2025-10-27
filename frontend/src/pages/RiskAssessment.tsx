import { useState } from 'react';
import {
  Layout,
  Card,
  Form,
  InputNumber,
  Button,
  Typography,
  Space,
  Alert,
  message,
} from 'antd';
import { SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { useContracts, useUserAddress } from '../hooks/useContracts';
import { useFHE } from '../hooks/useFHE';
import { RiskScoreChart } from '../components/RiskScoreChart';

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * Risk Assessment page
 */
const RiskAssessment = () => {
  const [form] = Form.useForm();
  const contracts = useContracts();
  const userAddress = useUserAddress();
  const { initialize: initFHE, encryptRiskProfile } = useFHE();
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!contracts || !userAddress) {
      message.error('Wallet not connected');
      return;
    }

    setLoading(true);
    try {
      await initFHE();

      const contractsInstance = await contracts;
      if (!contractsInstance) {
        throw new Error('Contracts not initialized');
      }

      const riskContractAddress = contractsInstance.riskAssessment.target as string;

      const {
        encryptedAge,
        ageProof,
        encryptedHealthScore,
        healthProof,
        encryptedCreditScore,
        creditProof,
      } = await encryptRiskProfile(
        values.age,
        values.healthScore,
        values.creditScore,
        riskContractAddress,
        userAddress
      );

      const tx = await contractsInstance.riskAssessment.createRiskProfile(
        encryptedAge,
        encryptedHealthScore,
        encryptedCreditScore,
        ageProof,
        healthProof,
        creditProof
      );

      message.loading('Creating risk profile...', 0);
      await tx.wait();
      message.destroy();
      message.success('Risk profile created successfully!');

      setHasProfile(true);
      form.resetFields();
    } catch (error) {
      console.error('Failed to create risk profile:', error);
      message.error('Failed to create risk profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <Space size="middle" style={{ marginBottom: '32px' }}>
            <SafetyOutlined style={{ fontSize: '32px', color: 'hsl(var(--primary))' }} />
            <div>
              <Title level={1} style={{ margin: 0 }}>
                Risk Assessment
              </Title>
              <Text type="secondary">Create a privacy-protected risk profile for better rates</Text>
            </div>
          </Space>

          <Alert
            message="Complete Privacy Protection"
            description="All risk assessment data (age, health score, credit score) will be encrypted using FHE technology. Your sensitive information remains completely private while still enabling accurate risk calculations."
            type="info"
            icon={<LockOutlined />}
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Form */}
            <Card title="Create Risk Profile" style={{ borderRadius: '8px' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Form.Item
                  label={
                    <Space>
                      <span>Age</span>
                      <LockOutlined style={{ color: 'hsl(var(--primary))' }} />
                    </Space>
                  }
                  name="age"
                  rules={[
                    { required: true, message: 'Please enter your age' },
                    { type: 'number', min: 18, max: 120, message: 'Age must be 18-120' },
                  ]}
                  extra="Encrypted before storage"
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="Enter your age"
                    min={18}
                    max={120}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Space>
                      <span>Health Score (0-100)</span>
                      <LockOutlined style={{ color: 'hsl(var(--primary))' }} />
                    </Space>
                  }
                  name="healthScore"
                  rules={[
                    { required: true, message: 'Please enter health score' },
                    { type: 'number', min: 0, max: 100, message: 'Score must be 0-100' },
                  ]}
                  extra="Higher score indicates better health. Encrypted before storage"
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="Enter health score"
                    min={0}
                    max={100}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Space>
                      <span>Credit Score (0-100)</span>
                      <LockOutlined style={{ color: 'hsl(var(--primary))' }} />
                    </Space>
                  }
                  name="creditScore"
                  rules={[
                    { required: true, message: 'Please enter credit score' },
                    { type: 'number', min: 0, max: 100, message: 'Score must be 0-100' },
                  ]}
                  extra="Normalized credit score. Encrypted before storage"
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="Enter credit score"
                    min={0}
                    max={100}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    block
                  >
                    Create Risk Profile
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Risk Score Chart */}
            <div>
              <RiskScoreChart hasProfile={hasProfile} />
              
              {hasProfile && (
                <Card
                  style={{ marginTop: '24px', borderRadius: '8px' }}
                  styles={{ body: { padding: '16px' } }}
                >
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Your risk profile is now active and will be used to calculate personalized insurance rates. All your data is encrypted and secure.
                  </Text>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default RiskAssessment;
