import React, { useEffect, useState } from 'react';
import { db } from '../services/storage';
import { Book, Item, Loan, User } from '../types';
import { BookOpen, Users, Clock, AlertTriangle } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    books: 0,
    items: 0,
    activeLoans: 0,
    overdueLoans: 0,
    users: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const [books, items, loans, users] = await Promise.all([
        db.getBooks(),
        db.getItems(),
        db.getLoans(),
        db.getUsers()
      ]);

      const active = loans.filter(l => l.status === 'CURRENT' || l.status === 'OVERDUE');
      const overdue = loans.filter(l => l.status === 'OVERDUE' || (l.status === 'CURRENT' && new Date(l.dueDate) < new Date()));

      setStats({
        books: books.length,
        items: items.length,
        activeLoans: active.length,
        overdueLoans: overdue.length,
        users: users.length
      });
    };
    loadStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Books (Titles)" 
          value={stats.books} 
          icon={BookOpen} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Loans" 
          value={stats.activeLoans} 
          icon={Clock} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Registered Users" 
          value={stats.users} 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Overdue Items" 
          value={stats.overdueLoans} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
             <button className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-colors">
                <span className="block font-medium text-slate-700">Check Out Item</span>
                <span className="text-xs text-slate-500">Scan RFID or Enter ID</span>
             </button>
             <button className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-colors">
                <span className="block font-medium text-slate-700">Return Item</span>
                <span className="text-xs text-slate-500">Process return</span>
             </button>
             <button className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-colors">
                <span className="block font-medium text-slate-700">Add New Book</span>
                <span className="text-xs text-slate-500">Catalog entry</span>
             </button>
             <button className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-colors">
                <span className="block font-medium text-slate-700">Register User</span>
                <span className="text-xs text-slate-500">Add student/staff</span>
             </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-900">Database Connection</span>
                </div>
                <span className="text-xs text-green-700">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-900">RFID Gateway</span>
                </div>
                <span className="text-xs text-green-700">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-blue-900">Last Sync</span>
                </div>
                <span className="text-xs text-blue-700">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
