import { Layout, Typography, Card, Timeline, Space, Alert, Divider, Row, Col } from 'antd';
import {
  LockOutlined,
  RocketOutlined,
  CodeOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

/**
 * Documentation page with project details and demo
 */
const Documentation = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <img
              src="/veilsure-logo.svg"
              alt="VeilSure"
              style={{ width: '80px', height: '80px', marginBottom: '24px' }}
            />
            <Title level={1}>VeilSure Insurance Platform</Title>
            <Paragraph style={{ fontSize: '18px', color: 'hsl(var(--muted-foreground))' }}>
              Privacy-Preserving Insurance Platform Powered by Fully Homomorphic Encryption
            </Paragraph>
          </div>

          {/* Demo Video */}
          <Card
            title={
              <Space>
                <RocketOutlined />
                <span>Platform Demo</span>
              </Space>
            }
            style={{ marginBottom: '32px', borderRadius: '8px' }}
          >
            <video
              controls
              style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }}
              poster="/veilsure-logo.svg"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <Paragraph style={{ marginTop: '16px', color: 'hsl(var(--muted-foreground))' }}>
              Watch how VeilSure enables privacy-preserving insurance operations with encrypted data processing
            </Paragraph>
          </Card>

          {/* Overview */}
          <Card
            title={
              <Space>
                <SafetyOutlined />
                <span>Project Overview</span>
              </Space>
            }
            style={{ marginBottom: '32px', borderRadius: '8px' }}
          >
            <Paragraph>
              VeilSure is a decentralized insurance platform built on Ethereum that leverages{' '}
              <Text strong>Fully Homomorphic Encryption (FHE)</Text> technology from Zama to enable
              privacy-preserving insurance operations. Users can create policies, file claims, and assess
              risk profiles while keeping all sensitive data encrypted on-chain.
            </Paragraph>

            <Alert
              message="Why Privacy Matters in Insurance"
              description="Traditional insurance requires users to expose sensitive personal information including health records, financial status, and age. VeilSure solves this by encrypting all sensitive data while still enabling accurate risk assessment and premium calculation."
              type="info"
              showIcon
              icon={<LockOutlined />}
              style={{ marginTop: '16px' }}
            />
          </Card>

          {/* How It Works */}
          <Card
            title={
              <Space>
                <CodeOutlined />
                <span>How It Works</span>
              </Space>
            }
            style={{ marginBottom: '32px', borderRadius: '8px' }}
          >
            <Title level={3}>FHE Technology Architecture</Title>
            <Paragraph>
              VeilSure uses Zama's fhEVM (Fully Homomorphic Encryption Virtual Machine) to perform
              computations directly on encrypted data without ever decrypting it.
            </Paragraph>

            <Timeline
              style={{ marginTop: '24px' }}
              items={[
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>Client-Side Encryption</Text>
                      <Paragraph style={{ marginTop: '8px' }}>
                        User data (premium amounts, claim amounts, health scores) is encrypted in the browser
                        using Zama's FHE SDK before being sent to the blockchain.
                      </Paragraph>
                      <pre
                        style={{
                          background: 'hsl(var(--muted))',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {`const fhe = await initializeFHE();
const input = fhe.createEncryptedInput(contractAddress, userAddress);
input.add64(premiumAmount);
const encrypted = await input.encrypt();`}
                      </pre>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>On-Chain Computation</Text>
                      <Paragraph style={{ marginTop: '8px' }}>
                        Smart contracts perform calculations on encrypted data using FHE operations. Risk
                        scores, premium calculations, and claim validations happen without decryption.
                      </Paragraph>
                      <pre
                        style={{
                          background: 'hsl(var(--muted))',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {`function createPolicy(
    externalEuint64 encryptedPremium,
    bytes calldata premiumProof
) external {
    euint64 premium = FHE.fromExternal(encryptedPremium, premiumProof);
    FHE.allow(premium, msg.sender);
    // Compute on encrypted data
}`}
                      </pre>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>Authorized Decryption</Text>
                      <Paragraph style={{ marginTop: '8px' }}>
                        Only authorized parties can decrypt specific data through the Zama Gateway using
                        cryptographic proofs, ensuring complete privacy control.
                      </Paragraph>
                      <pre
                        style={{
                          background: 'hsl(var(--muted))',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {`const decrypted = await fhe.decrypt(
    contractAddress,
    encryptedValue,
    userAddress
);`}
                      </pre>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Key Features */}
          <Card
            title={
              <Space>
                <ThunderboltOutlined />
                <span>Key Features</span>
              </Space>
            }
            style={{ marginBottom: '32px', borderRadius: '8px' }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card type="inner" title="Encrypted Policies">
                  <Paragraph>
                    Create insurance policies with encrypted premium amounts and coverage details. Policy
                    data remains private while being verifiable on-chain.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card type="inner" title="Private Claims">
                  <Paragraph>
                    File insurance claims with encrypted claim amounts. Claim validation and approval
                    processes occur without exposing sensitive financial information.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card type="inner" title="Confidential Risk Assessment">
                  <Paragraph>
                    Submit encrypted health scores, credit scores, and age data for risk profiling. Risk
                    calculations happen on encrypted data, protecting user privacy.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card type="inner" title="Decentralized & Transparent">
                  <Paragraph>
                    All operations are recorded on Ethereum blockchain ensuring transparency and
                    immutability while maintaining data confidentiality through FHE.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Technology Stack */}
          <Card
            title={
              <Space>
                <GlobalOutlined />
                <span>Technology Stack</span>
              </Space>
            }
            style={{ marginBottom: '32px', borderRadius: '8px' }}
          >
            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <Title level={4}>Smart Contracts</Title>
                <ul style={{ lineHeight: 2 }}>
                  <li>
                    <Text strong>Solidity 0.8.28</Text> - Smart contract language
                  </li>
                  <li>
                    <Text strong>@fhevm/solidity 0.8.0</Text> - Zama FHE library for Solidity
                  </li>
                  <li>
                    <Text strong>Hardhat</Text> - Development environment
                  </li>
                  <li>
                    <Text strong>Ethereum Sepolia</Text> - Testnet deployment
                  </li>
                </ul>
              </Col>
              <Col xs={24} md={12}>
                <Title level={4}>Frontend</Title>
                <ul style={{ lineHeight: 2 }}>
                  <li>
                    <Text strong>React 18 + TypeScript</Text> - UI framework
                  </li>
                  <li>
                    <Text strong>@zama-fhe/relayer-sdk 0.3.0</Text> - FHE client SDK
                  </li>
                  <li>
                    <Text strong>RainbowKit + Wagmi</Text> - Web3 wallet integration
                  </li>
                  <li>
                    <Text strong>Ant Design 5</Text> - UI component library
                  </li>
                  <li>
                    <Text strong>Vite</Text> - Build tool
                  </li>
                </ul>
              </Col>
            </Row>
          </Card>

          {/* Roadmap */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Roadmap</span>
              </Space>
            }
            style={{ marginBottom: '32px', borderRadius: '8px' }}
          >
            <Timeline
              items={[
                {
                  dot: <CheckCircleOutlined style={{ color: 'green' }} />,
                  children: (
                    <div>
                      <Text strong>Phase 1: Core Platform (Completed)</Text>
                      <ul style={{ marginTop: '8px' }}>
                        <li>Policy creation and management with FHE</li>
                        <li>Claims submission and processing</li>
                        <li>Risk assessment with encrypted health data</li>
                        <li>RainbowKit wallet integration</li>
                        <li>Sepolia testnet deployment</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>Phase 2: Advanced Features (In Progress)</Text>
                      <ul style={{ marginTop: '8px' }}>
                        <li>Multi-signature claims approval workflow</li>
                        <li>Automated premium calculation based on risk scores</li>
                        <li>Policy NFT minting for ownership proof</li>
                        <li>Enhanced admin dashboard with analytics</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <div>
                      <Text strong>Phase 3: Scaling & Governance (Planned)</Text>
                      <ul style={{ marginTop: '8px' }}>
                        <li>Mainnet deployment</li>
                        <li>DAO governance for claim dispute resolution</li>
                        <li>Integration with health data oracles</li>
                        <li>Mobile application</li>
                        <li>Cross-chain support</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <div>
                      <Text strong>Phase 4: Enterprise Adoption (Future)</Text>
                      <ul style={{ marginTop: '8px' }}>
                        <li>Insurance company partnerships</li>
                        <li>Regulatory compliance frameworks</li>
                        <li>Advanced actuarial models with FHE</li>
                        <li>White-label solutions for insurance providers</li>
                      </ul>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Security & Privacy */}
          <Card
            title={
              <Space>
                <LockOutlined />
                <span>Security & Privacy Guarantees</span>
              </Space>
            }
            style={{ marginBottom: '32px', borderRadius: '8px' }}
          >
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Alert
                  message="Cryptographic Privacy"
                  description="All sensitive data is encrypted using Zama's FHE technology before being sent to the blockchain. Even smart contracts and validators cannot see the plaintext data."
                  type="success"
                  showIcon
                />
              </Col>
              <Col span={24}>
                <Alert
                  message="Access Control"
                  description="Only authorized users can decrypt their own data through cryptographic proofs. Insurance companies cannot access raw user data without explicit permission."
                  type="success"
                  showIcon
                />
              </Col>
              <Col span={24}>
                <Alert
                  message="Audit Trail"
                  description="All operations are recorded on Ethereum blockchain providing an immutable audit trail while maintaining data confidentiality through encryption."
                  type="success"
                  showIcon
                />
              </Col>
            </Row>
          </Card>

          {/* Get Started */}
          <Card
            title={
              <Space>
                <RocketOutlined />
                <span>Get Started</span>
              </Space>
            }
            style={{ borderRadius: '8px' }}
          >
            <Title level={4}>Try VeilSure Now</Title>
            <Paragraph>
              1. Connect your Web3 wallet (MetaMask, WalletConnect, etc.) using the button in the top
              right
            </Paragraph>
            <Paragraph>
              2. Make sure you're on <Text strong>Sepolia Testnet</Text>
            </Paragraph>
            <Paragraph>
              3. Get Sepolia ETH from faucets:{' '}
              <a
                href="https://sepoliafaucet.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'hsl(var(--primary))' }}
              >
                sepoliafaucet.com
              </a>
            </Paragraph>
            <Paragraph>4. Create your risk profile in the Risk Assessment page</Paragraph>
            <Paragraph>5. Create your first insurance policy</Paragraph>
            <Paragraph>6. Experience privacy-preserving insurance operations!</Paragraph>

            <Divider />

            <Title level={4}>Smart Contract Addresses (Sepolia)</Title>
            <Paragraph>
              <Text code style={{ fontSize: '12px' }}>
                PolicyRegistry: {import.meta.env.VITE_POLICY_REGISTRY_ADDRESS}
              </Text>
            </Paragraph>
            <Paragraph>
              <Text code style={{ fontSize: '12px' }}>
                ClaimsManager: {import.meta.env.VITE_CLAIMS_MANAGER_ADDRESS}
              </Text>
            </Paragraph>
            <Paragraph>
              <Text code style={{ fontSize: '12px' }}>
                RiskAssessment: {import.meta.env.VITE_RISK_ASSESSMENT_ADDRESS}
              </Text>
            </Paragraph>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Documentation;
