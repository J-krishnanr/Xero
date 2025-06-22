import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './auth/AuthGuard';
import { Layout } from './Layout';
import { Dashboard } from '../pages/Dashboard';
import { ChartOfAccounts } from '../pages/ChartOfAccounts';
import { Banking } from '../pages/Banking';
import { Invoicing } from '../pages/Invoicing';
import { Expenses } from '../pages/Expenses';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';

export const DashboardApp: React.FC = () => {
  return (
    <AuthGuard>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<ChartOfAccounts />} />
          <Route path="/banking" element={<Banking />} />
          <Route path="/invoicing" element={<Invoicing />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </AuthGuard>
  );
};