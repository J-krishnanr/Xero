import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  FileText, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const cashFlowData = [
  { month: 'Jan', inflow: 45000, outflow: 32000 },
  { month: 'Feb', inflow: 52000, outflow: 38000 },
  { month: 'Mar', inflow: 48000, outflow: 35000 },
  { month: 'Apr', inflow: 61000, outflow: 42000 },
  { month: 'May', inflow: 55000, outflow: 39000 },
  { month: 'Jun', inflow: 67000, outflow: 45000 },
];

const expenseBreakdown = [
  { name: 'Office Supplies', value: 8500, color: '#3B82F6' },
  { name: 'Marketing', value: 12000, color: '#10B981' },
  { name: 'Travel', value: 5200, color: '#F59E0B' },
  { name: 'Software', value: 3800, color: '#EF4444' },
];

const recentTransactions = [
  { id: 1, description: 'Invoice #INV-2024-001', amount: 2500, type: 'income', date: '2024-01-15' },
  { id: 2, description: 'Office Rent', amount: -1200, type: 'expense', date: '2024-01-14' },
  { id: 3, description: 'Client Payment - ABC Corp', amount: 5800, type: 'income', date: '2024-01-13' },
  { id: 4, description: 'Software Subscription', amount: -299, type: 'expense', date: '2024-01-12' },
  { id: 5, description: 'Marketing Campaign', amount: -450, type: 'expense', date: '2024-01-11' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">Today at 2:30 PM</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">$67,890</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900">$29,500</p>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 ml-1">+8.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-3xl font-bold text-gray-900">$38,390</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+15.3%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-3xl font-bold text-gray-900">$12,450</p>
              <div className="flex items-center mt-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-600 ml-1">5 overdue</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={3} name="Inflow" />
              <Line type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={3} name="Outflow" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {expenseBreakdown.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Create Invoice</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Record Expense</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Bank Reconciliation</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};