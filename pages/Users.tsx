import React, { useEffect, useState } from 'react';
import { db } from '../services/storage';
import { User, UserRole } from '../types';
import { Shield, User as UserIcon } from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    db.getUsers().then(setUsers);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">User Management</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <span className="font-medium text-slate-900">{u.firstName} {u.lastName}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : u.role === UserRole.LIBRARIAN ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}`}>
                        {u.role === UserRole.ADMIN && <Shield className="w-3 h-3" />}
                        {u.role === UserRole.LIBRARIAN && <UserIcon className="w-3 h-3" />}
                        {u.role}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-500">{u.studentId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
