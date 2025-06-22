import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  Filter, 
  Search, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'reconciled' | 'pending';
  category: string;
}

export const Banking: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) {
      loadBankingData();
    }
  }, [currentOrganization]);

  const loadBankingData = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);

      // Load bank accounts (cash and bank accounts from chart of accounts)
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('type', 'asset')
        .eq('is_active', true);

      if (accountsError) {
        console.error('Error loading bank accounts:', accountsError);
        // Don't throw error, just set empty data
        setBankAccounts([]);
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Filter for cash/bank accounts (containing 'cash', 'bank', or 'checking' in name)
      const bankAccountsData: BankAccount[] = (accounts || [])
        .filter(account => 
          account.name.toLowerCase().includes('cash') ||
          account.name.toLowerCase().includes('bank') ||
          account.name.toLowerCase().includes('checking') ||
          account.name.toLowerCase().includes('savings')
        )
        .map(account => ({
          id: account.id,
          name: account.name,
          type: 'checking', // Default type
          balance: 0 // Will be calculated from journal entries
        }));

      setBankAccounts(bankAccountsData);
      
      if (bankAccountsData.length > 0 && !selectedAccount) {
        setSelectedAccount(bankAccountsData[0]);
      }

      // Load transactions from journal entries
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
        .order('date', { ascending: false })
        .limit(50);

      if (entriesError) {
        console.error('Error loading transactions:', entriesError);
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Transform journal entries to transactions
      const transactionsData: Transaction[] = [];
      (journalEntries || []).forEach(entry => {
        entry.journal_lines?.forEach((line: any) => {
          if (line.accounts && (line.debit > 0 || line.credit > 0)) {
            transactionsData.push({
              id: `${entry.id}-${line.id}`,
              date: entry.date,
              description: entry.description,
              amount: line.debit > 0 ? -line.debit : line.credit,
              status: 'reconciled', // Default status
              category: line.accounts.name
            });
          }
        });
      });

      setTransactions(transactionsData);

    } catch (error) {
      console.error('Error loading banking data:', error);
      setBankAccounts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || transaction.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalInflow = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const reconciledCount = transactions.filter(t => t.status === 'reconciled').length;

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

      {bankAccounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts found</h3>
          <p className="text-gray-500 mb-6">Create cash or bank accounts in your Chart of Accounts to get started</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Chart of Accounts
          </button>
        </div>
      ) : (
        <>
          {/* Bank Accounts Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bankAccounts.map((account) => (
              <div 
                key={account.id}
                onClick={() => setSelectedAccount(account)}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all ${
                  selectedAccount?.id === account.id 
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
                      <p className="text-sm text-gray-500">{account.type}</p>
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
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                  Transactions {selectedAccount && `- ${selectedAccount.name}`}
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
                      <p className="text-lg font-semibold text-green-700">${totalInflow.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-red-600">Total Outflow</p>
                      <p className="text-lg font-semibold text-red-700">${totalOutflow.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Reconciled</p>
                      <p className="text-lg font-semibold text-blue-700">{reconciledCount} of {transactions.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.status === 'reconciled' ? 'bg-green-500' : 'bg-orange-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
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
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No transactions found</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add First Transaction
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};