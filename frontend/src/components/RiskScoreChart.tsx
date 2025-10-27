import { Card, Typography, Progress } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface RiskScoreChartProps {
  hasProfile: boolean;
}

/**
 * Component to visualize risk score
 */
export const RiskScoreChart: React.FC<RiskScoreChartProps> = ({ hasProfile }) => {
  // In a real app, this would show the decrypted risk score
  // For now, we show encrypted status
  
  return (
    <Card
      style={{
        borderRadius: '8px',
        border: '1px solid hsl(var(--border))',
        background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--accent)) 100%)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <SafetyOutlined style={{ fontSize: '48px', color: 'hsl(var(--primary))' }} />
        <Title level={3} style={{ marginTop: '16px' }}>
          Risk Profile
        </Title>
        {hasProfile ? (
          <>
            <Text type="secondary">Your risk data is encrypted and secure</Text>
            <div style={{ marginTop: '24px' }}>
              <Progress
                type="dashboard"
                percent={100}
                format={() => '🔒'}
                strokeColor={{
                  '0%': 'hsl(var(--primary))',
                  '100%': 'hsl(var(--accent))',
                }}
              />
            </div>
            <Text style={{ marginTop: '16px', display: 'block', color: 'hsl(var(--muted-foreground))' }}>
              Risk Assessment Complete
            </Text>
          </>
        ) : (
          <>
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              Create a risk profile to get personalized insurance rates
            </Text>
          </>
        )}
      </div>
    </Card>
  );
};
