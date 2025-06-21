import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Filter, 
  Search, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';

const bankAccounts = [
  { id: 1, name: 'Business Checking', bank: 'Chase Bank', balance: 45680, type: 'checking' },
  { id: 2, name: 'Business Savings', bank: 'Chase Bank', balance: 125000, type: 'savings' },
  { id: 3, name: 'Business Credit Card', bank: 'American Express', balance: -2450, type: 'credit' },
];

const transactions = [
  { id: 1, date: '2024-01-15', description: 'ABC Corp - Invoice Payment', amount: 5800, status: 'reconciled', category: 'Revenue' },
  { id: 2, date: '2024-01-15', description: 'Office Depot - Supplies', amount: -235, status: 'pending', category: 'Office Expenses' },
  { id: 3, date: '2024-01-14', description: 'Stripe Payment Processing', amount: 2450, status: 'reconciled', category: 'Revenue' },
  { id: 4, date: '2024-01-14', description: 'Monthly Rent Payment', amount: -1200, status: 'reconciled', category: 'Rent' },
  { id: 5, date: '2024-01-13', description: 'XYZ Services - Consulting', amount: 3200, status: 'pending', category: 'Revenue' },
  { id: 6, date: '2024-01-13', description: 'Google Ads', amount: -450, status: 'reconciled', category: 'Marketing' },
  { id: 7, date: '2024-01-12', description: 'Software License', amount: -299, status: 'pending', category: 'Software' },
  { id: 8, date: '2024-01-12', description: 'Client Deposit - DEF Ltd', amount: 1500, status: 'reconciled', category: 'Revenue' },
];

export const Banking: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || transaction.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banking</h1>
          <p className="text-gray-600 mt-1">Manage your bank accounts and transactions</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Bank Accounts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bankAccounts.map((account) => (
          <div 
            key={account.id}
            onClick={() => setSelectedAccount(account)}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all ${
              selectedAccount.id === account.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.bank}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className={`text-2xl font-bold ${
                  account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${Math.abs(account.balance).toLocaleString()}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                account.type === 'checking' ? 'bg-blue-100 text-blue-800' :
                account.type === 'savings' ? 'bg-green-100 text-green-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {account.type}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Transactions - {selectedAccount.name}
            </h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="reconciled">Reconciled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          {/* Transaction Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Total Inflow</p>
                  <p className="text-lg font-semibold text-green-700">$12,950</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Total Outflow</p>
                  <p className="text-lg font-semibold text-red-700">$2,184</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Reconciled</p>
                  <p className="text-lg font-semibold text-blue-700">6 of 8</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.status === 'reconciled' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'reconciled' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {transaction.status === 'reconciled' ? 'Reconciled' : 'Pending'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {transaction.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  {transaction.status === 'pending' && (
                    <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                      Reconcile
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};