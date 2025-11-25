
import React, { useEffect, useState } from 'react';
import { db } from '../services/storage';
import { BarChart3, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Reports: React.FC = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalCheckouts: 0
  });

  useEffect(() => {
    const load = async () => {
        const data = await db.getStats();
        setStats(data);
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Items" value={stats.totalItems} icon={BookOpen} color="bg-blue-500" />
        <StatCard title="Active Loans" value={stats.activeLoans} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Overdue Items" value={stats.overdueLoans} icon={AlertTriangle} color="bg-red-500" />
        <StatCard title="Total Transactions" value={stats.totalCheckouts} icon={BarChart3} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-64 flex flex-col justify-center items-center text-slate-400">
           <p>Top Borrowed Items Chart Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-64 flex flex-col justify-center items-center text-slate-400">
           <p>Monthly Circulation Trends Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
