import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { config } from './lib/wagmi';
import { Navigation } from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import CreatePolicy from "./pages/policies/CreatePolicy";
import PolicyList from "./pages/policies/PolicyList";
import PolicyDetail from "./pages/policies/PolicyDetail";
import CreateClaim from "./pages/claims/CreateClaim";
import ClaimList from "./pages/claims/ClaimList";
import ClaimDetail from "./pages/claims/ClaimDetail";
import RiskAssessment from "./pages/RiskAssessment";
import Documentation from "./pages/Documentation";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Ant Design theme configuration - Linear style
const antTheme = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    colorBgBase: '#ffffff',
    colorTextBase: '#000000',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  algorithm: theme.defaultAlgorithm,
};

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConfigProvider theme={antTheme}>
            <BrowserRouter>
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                  },
                }}
              />
              <Navigation />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/policies/create" element={<CreatePolicy />} />
                <Route path="/policies" element={<PolicyList />} />
                <Route path="/policies/:id" element={<PolicyDetail />} />
                <Route path="/claims/create" element={<CreateClaim />} />
                <Route path="/claims" element={<ClaimList />} />
                <Route path="/claims/:id" element={<ClaimDetail />} />
                <Route path="/risk-assessment" element={<RiskAssessment />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ConfigProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
