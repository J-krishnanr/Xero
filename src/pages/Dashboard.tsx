import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  FileText, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingInvoices: number;
  recentTransactions: any[];
  monthlyData: any[];
  expenseBreakdown: any[];
}

export const Dashboard: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingInvoices: 0,
    recentTransactions: [],
    monthlyData: [],
    expenseBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) {
      loadDashboardData();
    }
  }, [currentOrganization]);

  const loadDashboardData = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);

      // Load journal entries for the current year
      const currentYear = new Date().getFullYear();
      const { data: journalEntries, error: entriesError } = await supabase
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

      if (entriesError) {
        console.error('Error loading journal entries:', entriesError);
        // Don't throw error, just set empty data
        setDashboardData({
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          outstandingInvoices: 0,
          recentTransactions: [],
          monthlyData: [],
          expenseBreakdown: []
        });
        setLoading(false);
        return;
      }

      // Calculate totals from actual journal entries
      let totalRevenue = 0;
      let totalExpenses = 0;
      const monthlyRevenue: { [key: string]: number } = {};
      const monthlyExpenses: { [key: string]: number } = {};
      const expensesByCategory: { [key: string]: number } = {};
      const recentTransactions: any[] = [];

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
            expensesByCategory[account.name] = (expensesByCategory[account.name] || 0) + line.debit;
          }
        });

        // Add to recent transactions (limit to 5)
        if (recentTransactions.length < 5) {
          const amount = entry.journal_lines?.reduce((sum: number, line: any) => {
            if (line.accounts?.type === 'income') return sum + line.credit;
            if (line.accounts?.type === 'expense') return sum - line.debit;
            return sum;
          }, 0) || 0;

          recentTransactions.push({
            id: entry.id,
            description: entry.description,
            amount: amount,
            type: amount > 0 ? 'income' : 'expense',
            date: entry.date
          });
        }
      });

      // Prepare monthly data for chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = months.map(month => ({
        month,
        inflow: monthlyRevenue[month] || 0,
        outflow: monthlyExpenses[month] || 0
      }));

      // Prepare expense breakdown for pie chart
      const expenseBreakdown = Object.entries(expensesByCategory)
        .map(([name, value], index) => ({
          name,
          value,
          color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
        }))
        .slice(0, 5); // Top 5 expense categories

      setDashboardData({
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        outstandingInvoices: 0, // This would come from invoices table when implemented
        recentTransactions,
        monthlyData,
        expenseBreakdown
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty data on error
      setDashboardData({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        outstandingInvoices: 0,
        recentTransactions: [],
        monthlyData: [],
        expenseBreakdown: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasData = dashboardData.totalRevenue > 0 || dashboardData.totalExpenses > 0;

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
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No financial data yet</h3>
          <p className="text-gray-500 mb-6">Start by creating journal entries to see your business insights here</p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Journal Entry</span>
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Import Data
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${dashboardData.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
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
                  <p className="text-3xl font-bold text-gray-900">${dashboardData.totalExpenses.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
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
                  <p className={`text-3xl font-bold ${dashboardData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(dashboardData.netProfit).toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    {dashboardData.netProfit >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${dashboardData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dashboardData.netProfit >= 0 ? 'Profit' : 'Loss'}
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
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-3xl font-bold text-gray-900">${dashboardData.outstandingInvoices.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 ml-1">Invoices</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cash Flow</h3>
              {dashboardData.monthlyData.some(d => d.inflow > 0 || d.outflow > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Line type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={3} name="Inflow" />
                    <Line type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={3} name="Outflow" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No monthly data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
              {dashboardData.expenseBreakdown.length > 0 ? (
                <>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dashboardData.expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dashboardData.expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {dashboardData.expenseBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No expense data available</p>
                  </div>
                </div>
              )}
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
              {dashboardData.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No recent transactions</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Create Journal Entry</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Record Transaction</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">View Reports</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};