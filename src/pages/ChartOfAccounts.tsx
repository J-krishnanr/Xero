import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  FolderOpen,
  Building,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_account_id: string | null;
  is_active: boolean;
  children?: Account[];
}

interface NewAccount {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_account_id: string | null;
}

const accountTypeIcons = {
  asset: Building,
  liability: CreditCard,
  equity: DollarSign,
  income: TrendingUp,
  expense: TrendingDown,
};

const accountTypeColors = {
  asset: 'bg-green-100 text-green-800',
  liability: 'bg-red-100 text-red-800',
  equity: 'bg-blue-100 text-blue-800',
  income: 'bg-emerald-100 text-emerald-800',
  expense: 'bg-orange-100 text-orange-800',
};

export const ChartOfAccounts: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState<NewAccount>({
    code: '',
    name: '',
    type: 'asset',
    parent_account_id: null,
  });

  useEffect(() => {
    if (currentOrganization) {
      loadAccounts();
    }
  }, [currentOrganization]);

  const loadAccounts = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('code');

      if (error) {
        console.error('Error loading accounts:', error);
        toast.error('Failed to load accounts');
        return;
      }

      // Build hierarchical structure
      const accountMap = new Map<string, Account>();
      const rootAccounts: Account[] = [];

      // First pass: create all accounts
      (data || []).forEach(account => {
        accountMap.set(account.id, { ...account, children: [] });
      });

      // Second pass: build hierarchy
      (data || []).forEach(account => {
        const accountObj = accountMap.get(account.id)!;
        if (account.parent_account_id) {
          const parent = accountMap.get(account.parent_account_id);
          if (parent) {
            parent.children!.push(accountObj);
          } else {
            rootAccounts.push(accountObj);
          }
        } else {
          rootAccounts.push(accountObj);
        }
      });

      setAccounts(rootAccounts);
    } catch (error: any) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAccounts = async () => {
    if (!currentOrganization) return;

    const defaultAccounts = [
      // Assets
      { code: '1000', name: 'Cash and Cash Equivalents', type: 'asset' as const },
      { code: '1100', name: 'Accounts Receivable', type: 'asset' as const },
      { code: '1200', name: 'Inventory', type: 'asset' as const },
      { code: '1500', name: 'Equipment', type: 'asset' as const },
      
      // Liabilities
      { code: '2000', name: 'Accounts Payable', type: 'liability' as const },
      { code: '2100', name: 'Accrued Expenses', type: 'liability' as const },
      { code: '2500', name: 'Long-term Debt', type: 'liability' as const },
      
      // Equity
      { code: '3000', name: 'Owner\'s Equity', type: 'equity' as const },
      { code: '3100', name: 'Retained Earnings', type: 'equity' as const },
      
      // Income
      { code: '4000', name: 'Sales Revenue', type: 'income' as const },
      { code: '4100', name: 'Service Revenue', type: 'income' as const },
      
      // Expenses
      { code: '5000', name: 'Cost of Goods Sold', type: 'expense' as const },
      { code: '6000', name: 'Operating Expenses', type: 'expense' as const },
      { code: '6100', name: 'Rent Expense', type: 'expense' as const },
      { code: '6200', name: 'Utilities Expense', type: 'expense' as const },
      { code: '6300', name: 'Marketing Expense', type: 'expense' as const },
    ];

    try {
      setLoading(true);
      const { error } = await supabase
        .from('accounts')
        .insert(
          defaultAccounts.map(account => ({
            ...account,
            organization_id: currentOrganization.id,
          }))
        );

      if (error) {
        console.error('Error creating accounts:', error);
        toast.error('Failed to create default accounts');
        return;
      }

      toast.success('Default chart of accounts created!');
      await loadAccounts();
    } catch (error: any) {
      console.error('Error creating accounts:', error);
      toast.error('Failed to create default accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!currentOrganization || !newAccount.code || !newAccount.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          ...newAccount,
          organization_id: currentOrganization.id,
        });

      if (error) {
        console.error('Error adding account:', error);
        if (error.code === '23505') {
          toast.error('Account code already exists');
        } else {
          toast.error('Failed to add account');
        }
        return;
      }

      toast.success('Account added successfully!');
      setShowAddModal(false);
      setNewAccount({
        code: '',
        name: '',
        type: 'asset',
        parent_account_id: null,
      });
      await loadAccounts();
    } catch (error: any) {
      console.error('Error adding account:', error);
      toast.error('Failed to add account');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
        return;
      }

      toast.success('Account deleted successfully!');
      await loadAccounts();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.includes(searchTerm);
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const renderAccount = (account: Account, level = 0) => {
    const Icon = accountTypeIcons[account.type];
    
    return (
      <div key={account.id}>
        <div 
          className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-l-4 ${
            level === 0 ? 'border-blue-500' : 'border-gray-200'
          }`}
          style={{ paddingLeft: `${1 + level * 2}rem` }}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              level === 0 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Icon className={`w-4 h-4 ${level === 0 ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">{account.code}</span>
                <span className="text-gray-700">{account.name}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${accountTypeColors[account.type]}`}>
                  {account.type}
                </span>
                {!account.is_active && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setEditingAccount(account)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDeleteAccount(account.id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {account.children && account.children.map(child => renderAccount(child, level + 1))}
      </div>
    );
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your account structure and classifications</p>
        </div>
        <div className="flex space-x-3">
          {accounts.length === 0 && (
            <button
              onClick={createDefaultAccounts}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Create Default Accounts</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(accountTypeColors).map(([type, colorClass]) => {
          const count = accounts.filter(acc => acc.type === type).length;
          const Icon = accountTypeIcons[type as keyof typeof accountTypeIcons];
          
          return (
            <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{type}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your chart of accounts</p>
          <button
            onClick={createDefaultAccounts}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Default Chart of Accounts
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="asset">Assets</option>
                <option value="liability">Liabilities</option>
                <option value="equity">Equity</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>

          {/* Accounts List */}
          <div className="divide-y divide-gray-200">
            {filteredAccounts.map(account => renderAccount(account))}
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Account</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                <input
                  type="text"
                  value={newAccount.code}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Cash and Cash Equivalents"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};