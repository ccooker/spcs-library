
import React, { useEffect, useState } from 'react';
import { db } from '../services/storage';
import { User, Item, Circulation, Fine } from '../types';
import { ArrowLeftRight, CheckCircle2, AlertCircle, Clock, RotateCw, User as UserIcon, Receipt } from 'lucide-react';

const Circulation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'return' | 'renew' | 'overdue'>('checkout');
  
  // Checkout State
  const [userIdInput, setUserIdInput] = useState('');
  const [rfidInput, setRfidInput] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Overdue Data
  const [overdueItems, setOverdueItems] = useState<{circ: Circulation, item: Item, user: User, fine: number}[]>([]);

  useEffect(() => {
    if (activeTab === 'overdue') loadOverdue();
  }, [activeTab]);

  // --- ACTIONS ---

  const handleUserLookup = async () => {
    const users = await db.getUsers();
    // Search by username or sisID or userId
    const user = users.find(u => u.username === userIdInput || u.sisId === userIdInput || u.userId.toString() === userIdInput);
    if (user) setFoundUser(user);
    else setMessage({ type: 'error', text: 'User not found' });
  };

  const handleCheckout = async () => {
    if (!foundUser) return;
    try {
        await db.checkout(foundUser.userId, rfidInput);
        setMessage({ type: 'success', text: 'Checkout successful' });
        setRfidInput('');
    } catch (e: any) {
        setMessage({ type: 'error', text: e.message });
    }
  };

  const handleReturn = async () => {
    try {
        const result = await db.returnItem(rfidInput);
        let msg = 'Returned successfully.';
        if (result.fine) {
            msg += ` FINE ISSUED: $${result.fine.amount.toFixed(2)}`;
        }
        setMessage({ type: 'success', text: msg });
        setRfidInput('');
    } catch (e: any) {
        setMessage({ type: 'error', text: e.message });
    }
  };

  const handleRenew = async () => {
    try {
        await db.renewItem(rfidInput);
        setMessage({ type: 'success', text: 'Item renewed for 7 days.' });
        setRfidInput('');
    } catch (e: any) {
        setMessage({ type: 'error', text: e.message });
    }
  };

  const loadOverdue = async () => {
      const circs = await db.getCirculations();
      const items = await db.getItems();
      const users = await db.getUsers();
      
      const overdue = circs.filter(c => c.status === 'Checked Out' && new Date(c.dueDate) < new Date()).map(c => {
          const item = items.find(i => i.itemId === c.itemId)!;
          const user = users.find(u => u.userId === c.userId)!;
          // Calculate estimated fine for display
          const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(c.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          return { circ: c, item, user, fine: diffDays * 0.50 };
      });
      setOverdueItems(overdue);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Circulation Management</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
        <div className="flex border-b border-slate-200">
            {['checkout', 'return', 'renew', 'overdue'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => { setActiveTab(tab as any); setMessage(null); setRfidInput(''); setFoundUser(null); }}
                    className={`flex-1 py-4 text-sm font-medium text-center capitalize transition-colors ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className="p-8">
            {/* MESSAGES */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* CHECKOUT TAB */}
            {activeTab === 'checkout' && (
                <div className="space-y-8 max-w-2xl mx-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">1. Identify User (Scan ID)</label>
                        <div className="flex gap-2">
                            <input 
                                autoFocus
                                disabled={!!foundUser}
                                value={userIdInput}
                                onChange={e => setUserIdInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleUserLookup()}
                                type="text" 
                                placeholder="Enter Username or SIS ID" 
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {foundUser ? (
                                <button onClick={() => { setFoundUser(null); setMessage(null); }} className="px-6 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium text-slate-700">Clear</button>
                            ) : (
                                <button onClick={handleUserLookup} className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Lookup</button>
                            )}
                        </div>
                        {foundUser && (
                            <div className="mt-4 flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <div className="p-3 bg-white rounded-full"><UserIcon className="w-6 h-6 text-indigo-600" /></div>
                                <div>
                                    <p className="font-bold text-indigo-900">{foundUser.firstName} {foundUser.lastName}</p>
                                    <p className="text-sm text-indigo-600">{foundUser.email} • {foundUser.sisId || 'No ID'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {foundUser && (
                        <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                             <label className="block text-sm font-medium text-slate-700 mb-2">2. Scan Item (RFID)</label>
                             <div className="flex gap-2">
                                <input 
                                    autoFocus
                                    value={rfidInput}
                                    onChange={e => setRfidInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCheckout()}
                                    type="text" 
                                    placeholder="Click here and scan tag..." 
                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                />
                                <button onClick={handleCheckout} className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">Checkout</button>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* RETURN TAB */}
            {activeTab === 'return' && (
                <div className="max-w-xl mx-auto text-center space-y-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowLeftRight className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Scan Item to Return</label>
                        <input 
                            autoFocus
                            value={rfidInput}
                            onChange={e => setRfidInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleReturn()}
                            type="text" 
                            placeholder="Scan RFID Tag" 
                            className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono"
                        />
                    </div>
                    <button onClick={handleReturn} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
                        Process Return
                    </button>
                </div>
            )}

             {/* RENEW TAB */}
             {activeTab === 'renew' && (
                <div className="max-w-xl mx-auto text-center space-y-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RotateCw className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Scan Item to Renew</label>
                        <input 
                            autoFocus
                            value={rfidInput}
                            onChange={e => setRfidInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRenew()}
                            type="text" 
                            placeholder="Scan RFID Tag" 
                            className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono"
                        />
                    </div>
                    <button onClick={handleRenew} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                        Renew Item
                    </button>
                </div>
            )}

            {/* OVERDUE TAB */}
            {activeTab === 'overdue' && (
                <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-500" /> Overdue Items
                    </h3>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="px-4 py-3">Item</th>
                                <th className="px-4 py-3">Borrower</th>
                                <th className="px-4 py-3">Due Date</th>
                                <th className="px-4 py-3 text-right">Est. Fine</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {overdueItems.map((o, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900">{o.item.title}</p>
                                        <p className="text-xs text-slate-500 font-mono">{o.item.rfidTagId}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-900">{o.user.firstName} {o.user.lastName}</p>
                                        <p className="text-xs text-slate-500">{o.user.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                                        {new Date(o.circ.dueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-700 flex items-center justify-end gap-2">
                                        <Receipt className="w-4 h-4 text-slate-400" />
                                        ${o.fine.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {overdueItems.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No overdue items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Circulation;
