import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = [
  { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
  { month: 'Feb', revenue: 52000, expenses: 38000, profit: 14000 },
  { month: 'Mar', revenue: 48000, expenses: 35000, profit: 13000 },
  { month: 'Apr', revenue: 61000, expenses: 42000, profit: 19000 },
  { month: 'May', revenue: 55000, expenses: 39000, profit: 16000 },
  { month: 'Jun', revenue: 67000, expenses: 45000, profit: 22000 },
];

const quarterlyComparison = [
  { quarter: 'Q1 2023', value: 135000 },
  { quarter: 'Q2 2023', value: 158000 },
  { quarter: 'Q3 2023', value: 142000 },
  { quarter: 'Q4 2023', value: 167000 },
  { quarter: 'Q1 2024', value: 183000 },
];

const reports = [
  { name: 'Profit & Loss Statement', description: 'Complete P&L for the current period', lastGenerated: '2024-01-26', type: 'financial' },
  { name: 'Balance Sheet', description: 'Assets, liabilities, and equity overview', lastGenerated: '2024-01-25', type: 'financial' },
  { name: 'Cash Flow Statement', description: 'Cash inflows and outflows analysis', lastGenerated: '2024-01-24', type: 'financial' },
  { name: 'Tax Summary Report', description: 'Tax obligations and deductions summary', lastGenerated: '2024-01-20', type: 'tax' },
  { name: 'Expense Report', description: 'Detailed breakdown of business expenses', lastGenerated: '2024-01-22', type: 'expense' },
  { name: 'Invoice Aging Report', description: 'Outstanding invoices by aging period', lastGenerated: '2024-01-23', type: 'receivables' },
];

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [reportFilter, setReportFilter] = useState('all');

  const filteredReports = reports.filter(report => 
    reportFilter === 'all' || report.type === reportFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Financial insights and business analytics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$328,000</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+15.3%</span>
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
              <p className="text-2xl font-bold text-gray-900">$231,000</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 ml-1">+8.7%</span>
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
              <p className="text-2xl font-bold text-gray-900">$97,000</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+29.6%</span>
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
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">29.6%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+2.1%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={quarterlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Available Reports</h2>
            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="financial">Financial</option>
              <option value="tax">Tax</option>
              <option value="expense">Expense</option>
              <option value="receivables">Receivables</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredReports.map((report, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Last generated: {report.lastGenerated}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.type === 'financial' ? 'bg-blue-100 text-blue-800' :
                    report.type === 'tax' ? 'bg-red-100 text-red-800' :
                    report.type === 'expense' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {report.type}
                  </span>
                  <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Generate
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};