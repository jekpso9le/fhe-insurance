import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Drawer } from 'antd';
import {
  DashboardOutlined,
  SafetyOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useIsMobile } from '../hooks/use-mobile';
import { useIsOwner } from '../hooks/useContracts';

const { Header } = Layout;

/**
 * Navigation component with wallet integration
 */
export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isOwner = useIsOwner();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/policies',
      icon: <SafetyOutlined />,
      label: 'Policies',
    },
    {
      key: '/claims',
      icon: <FileTextOutlined />,
      label: 'Claims',
    },
    {
      key: '/risk-assessment',
      icon: <SafetyOutlined />,
      label: 'Risk Assessment',
    },
  ];

  if (isOwner) {
    menuItems.push({
      key: '/admin',
      icon: <SettingOutlined />,
      label: 'Admin',
    });
  }

  const handleMenuClick = (key: string) => {
    navigate(key);
    setDrawerVisible(false);
  };

  return (
    <Header
      style={{
        background: 'hsl(var(--card))',
        borderBottom: '1px solid hsl(var(--border))',
        padding: isMobile ? '0 16px' : '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <SafetyOutlined style={{ fontSize: '24px', color: 'hsl(var(--primary))' }} />
        <span style={{ fontSize: '18px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
          FHE Insurance
        </span>
      </div>

      {/* Desktop Menu */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, marginLeft: '48px' }}>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
            }}
          />
          <ConnectButton />
        </div>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
        />
      )}

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ border: 'none' }}
        />
        <div style={{ marginTop: '24px', padding: '0 16px' }}>
          <ConnectButton />
        </div>
      </Drawer>
    </Header>
  );
};
