import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyData: any[];
  quarterlyData: any[];
}

const reports = [
  { name: 'Profit & Loss Statement', description: 'Complete P&L for the current period', lastGenerated: 'Not generated', type: 'financial' },
  { name: 'Balance Sheet', description: 'Assets, liabilities, and equity overview', lastGenerated: 'Not generated', type: 'financial' },
  { name: 'Cash Flow Statement', description: 'Cash inflows and outflows analysis', lastGenerated: 'Not generated', type: 'financial' },
  { name: 'Tax Summary Report', description: 'Tax obligations and deductions summary', lastGenerated: 'Not generated', type: 'tax' },
  { name: 'Expense Report', description: 'Detailed breakdown of business expenses', lastGenerated: 'Not generated', type: 'expense' },
  { name: 'Invoice Aging Report', description: 'Outstanding invoices by aging period', lastGenerated: 'Not generated', type: 'receivables' },
];

export const Reports: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyData: [],
    quarterlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [reportFilter, setReportFilter] = useState('all');

  useEffect(() => {
    if (currentOrganization) {
      loadReportData();
    }
  }, [currentOrganization]);

  const loadReportData = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);

      // Load journal entries for the current year
      const currentYear = new Date().getFullYear();
      const { data: journalEntries, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          journal_lines (
            *,
            accounts (*)
          )
        `)
        .eq('organization_id', currentOrganization.id)
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading report data:', error);
        // Don't throw error, just set empty data
        setReportData({
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          profitMargin: 0,
          monthlyData: [],
          quarterlyData: []
        });
        setLoading(false);
        return;
      }

      // Calculate totals and monthly data
      let totalRevenue = 0;
      let totalExpenses = 0;
      const monthlyRevenue: { [key: string]: number } = {};
      const monthlyExpenses: { [key: string]: number } = {};

      (journalEntries || []).forEach(entry => {
        const month = new Date(entry.date).toLocaleString('default', { month: 'short' });
        
        entry.journal_lines?.forEach((line: any) => {
          const account = line.accounts;
          if (!account) return;

          // Revenue (Income accounts - credit increases revenue)
          if (account.type === 'income' && line.credit > 0) {
            totalRevenue += line.credit;
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + line.credit;
          }

          // Expenses (Expense accounts - debit increases expenses)
          if (account.type === 'expense' && line.debit > 0) {
            totalExpenses += line.debit;
            monthlyExpenses[month] = (monthlyExpenses[month] || 0) + line.debit;
          }
        });
      });

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Prepare monthly data for chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = months.map(month => ({
        month,
        revenue: monthlyRevenue[month] || 0,
        expenses: monthlyExpenses[month] || 0,
        profit: (monthlyRevenue[month] || 0) - (monthlyExpenses[month] || 0)
      }));

      // Prepare quarterly data
      const quarterlyData = [
        { quarter: 'Q1', value: monthlyData.slice(0, 3).reduce((sum, m) => sum + m.revenue, 0) },
        { quarter: 'Q2', value: monthlyData.slice(3, 6).reduce((sum, m) => sum + m.revenue, 0) },
        { quarter: 'Q3', value: monthlyData.slice(6, 9).reduce((sum, m) => sum + m.revenue, 0) },
        { quarter: 'Q4', value: monthlyData.slice(9, 12).reduce((sum, m) => sum + m.revenue, 0) },
      ];

      setReportData({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        monthlyData,
        quarterlyData
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      setReportData({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        monthlyData: [],
        quarterlyData: []
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => 
    reportFilter === 'all' || report.type === reportFilter
  );

  const hasData = reportData.totalRevenue > 0 || reportData.totalExpenses > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

      {!hasData ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No financial data for reports</h3>
          <p className="text-gray-500 mb-6">Create journal entries to generate meaningful financial reports</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Journal Entry
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${reportData.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 ml-1">This year</span>
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
                  <p className="text-2xl font-bold text-gray-900">${reportData.totalExpenses.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 ml-1">This year</span>
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
                  <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(reportData.netProfit).toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    {reportData.netProfit >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.netProfit >= 0 ? 'Profit' : 'Loss'}
                    </span>
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
                  <p className={`text-2xl font-bold ${reportData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(reportData.profitMargin).toFixed(1)}%
                  </p>
                  <div className="flex items-center mt-2">
                    {reportData.profitMargin >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${reportData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Margin
                    </span>
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
              {reportData.monthlyData.some(d => d.revenue > 0 || d.expenses > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                    <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Growth Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Revenue Trend</h3>
              {reportData.quarterlyData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No quarterly data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

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