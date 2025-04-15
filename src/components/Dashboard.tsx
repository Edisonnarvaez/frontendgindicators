// Dashboard.tsx
import React from 'react';
import Layout from './Layout';
import DashboardPage from "../components/Dashboard/DashboardPage";

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <DashboardPage />
    </Layout>
  );
};

export default Dashboard;
