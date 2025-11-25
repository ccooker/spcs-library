
import React, { useEffect, useState } from 'react';
import { db } from '../services/storage';
import { User, UserType } from '../types';
import { Shield, Upload, UserPlus } from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    Promise.all([db.getUsers(), db.getUserTypes()]).then(([u, t]) => {
        setUsers(u);
        setUserTypes(t);
    });
  }, []);

  const handleImport = async () => {
      setIsImporting(true);
      await db.importUsers("fake,csv,data");
      const updated = await db.getUsers();
      setUsers(updated);
      setIsImporting(false);
  };

  const getTypeName = (id: number) => userTypes.find(t => t.userTypeId === id)?.typeName || 'Unknown';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <div className="flex gap-2">
            <button 
                onClick={handleImport}
                disabled={isImporting}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
                <Upload className="w-4 h-4" /> {isImporting ? 'Importing...' : 'Batch Import (CSV)'}
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <UserPlus className="w-4 h-4" /> Add User
            </button>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role / Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">SIS ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.userId} className="hover:bg-slate-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 block">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-slate-400">@{u.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.userTypeId === 1 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                        {u.userTypeId === 1 && <Shield className="w-3 h-3" />}
                        {getTypeName(u.userTypeId)}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-500">{u.sisId || '-'}</td>
                <td className="px-6 py-4 text-sm">
                    <span className="text-green-600 font-medium">{u.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
