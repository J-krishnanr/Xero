import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Upload, 
  Search,
  Filter,
  Calendar,
  PieChart,
  TrendingUp,
  Camera
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const expenses = [
  { 
    id: 1, 
    date: '2024-01-26', 
    description: 'Office Supplies - Staples', 
    amount: 125.50, 
    category: 'Office Supplies', 
    receipt: true,
    status: 'approved'
  },
  { 
    id: 2, 
    date: '2024-01-25', 
    description: 'Business Lunch - Client Meeting', 
    amount: 87.30, 
    category: 'Meals & Entertainment', 
    receipt: true,
    status: 'pending'
  },
  { 
    id: 3, 
    date: '2024-01-24', 
    description: 'Uber - Airport Transfer', 
    amount: 45.20, 
    category: 'Travel', 
    receipt: false,
    status: 'approved'
  },
  { 
    id: 4, 
    date: '2024-01-23', 
    description: 'Adobe Creative Suite', 
    amount: 299.99, 
    category: 'Software', 
    receipt: true,
    status: 'approved'
  },
  { 
    id: 5, 
    date: '2024-01-22', 
    description: 'Hotel Stay - Business Trip', 
    amount: 189.00, 
    category: 'Travel', 
    receipt: true,
    status: 'approved'
  },
  { 
    id: 6, 
    date: '2024-01-21', 
    description: 'Marketing Materials - Printing', 
    amount: 67.85, 
    category: 'Marketing', 
    receipt: true,
    status: 'pending'
  },
];

const expenseCategories = [
  { name: 'Office Supplies', value: 125.50, color: '#3B82F6' },
  { name: 'Travel', value: 234.20, color: '#10B981' },
  { name: 'Software', value: 299.99, color: '#F59E0B' },
  { name: 'Meals & Entertainment', value: 87.30, color: '#EF4444' },
  { name: 'Marketing', value: 67.85, color: '#8B5CF6' },
];

export const Expenses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);
  const expensesThisMonth = expenses.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage your business expenses</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Scan Receipt</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600">${pendingExpenses.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">{expensesThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Expense</p>
              <p className="text-2xl font-bold text-green-600">${(totalExpenses / expensesThisMonth).toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Categories Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {expenseCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">${category.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Travel">Travel</option>
                <option value="Software">Software</option>
                <option value="Meals & Entertainment">Meals & Entertainment</option>
                <option value="Marketing">Marketing</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-500">{expense.date}</p>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {expense.category}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          expense.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {expense.status}
                        </span>
                        {expense.receipt && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Receipt
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};