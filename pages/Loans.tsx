import React, { useState } from 'react';
import { db } from '../services/storage';
import { Item, User } from '../types';
import { ArrowLeftRight, User as UserIcon, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

const Loans: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'return'>('checkout');
  
  // Checkout State
  const [userIdInput, setUserIdInput] = useState('');
  const [itemInput, setItemInput] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Return State
  const [returnInput, setReturnInput] = useState('');
  const [returnMessage, setReturnMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleUserLookup = async () => {
    const users = await db.getUsers();
    // Search by username or sisID
    const user = users.find(u => u.username === userIdInput || u.sisId === userIdInput);
    if (user) setFoundUser(user);
    else setCheckoutMessage({ type: 'error', text: 'User not found' });
  };

  const handleItemLookup = async () => {
    // Input could be Item ID or RFID Tag value
    const items = await db.getItems();
    
    // 1. Try RFID match
    let item = items.find(i => i.rfidTagId === itemInput);
    
    // 2. Try ID match (fallback)
    if (!item) {
       item = items.find(i => i.itemId.toString() === itemInput);
    }

    if (item) {
        setFoundItem(item);
        setCheckoutMessage(null);
    } else {
        setCheckoutMessage({ type: 'error', text: 'Item not found in inventory' });
        setFoundItem(null);
    }
  };

  const executeCheckout = async () => {
    if (!foundUser || !foundItem) return;

    if (foundItem.currentStatus !== 'Available') {
        setCheckoutMessage({ type: 'error', text: `Item is currently ${foundItem.currentStatus}` });
        return;
    }

    try {
        await db.checkout(foundUser.userId, foundItem.rfidTagId);
        setCheckoutMessage({ type: 'success', text: 'Checkout successful!' });
        
        // Reset item but keep user for speed
        setFoundItem(null);
        setItemInput('');
    } catch (e: any) {
        setCheckoutMessage({ type: 'error', text: e.message || 'Checkout failed' });
    }
  };

  const executeReturn = async () => {
      // Find item by rfid
      const items = await db.getItems();
      
      let item = items.find(i => i.rfidTagId === returnInput);
      if (!item) {
          item = items.find(i => i.itemId.toString() === returnInput);
      }

      if (!item) {
          setReturnMessage({ type: 'error', text: 'Item not found' });
          return;
      }

      try {
        const res = await db.returnItem(item.rfidTagId);
        let msg = `Item returned successfully.`;
        if (res.fine) {
            msg += ` Fine Issued: $${res.fine.amount}`;
        }
        setReturnMessage({ type: 'success', text: msg });
        setReturnInput('');
      } catch (e: any) {
        setReturnMessage({ type: 'error', text: e.message || 'Return failed' });
      }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Circulation Desk</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('checkout')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'checkout' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Check Out (Issue)
            </button>
            <button 
                onClick={() => setActiveTab('return')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'return' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Check In (Return)
            </button>
        </div>

        <div className="p-8 min-h-[400px]">
            {activeTab === 'checkout' ? (
                <div className="space-y-8">
                    {/* Step 1: User */}
                    <div className={`transition-opacity ${foundUser ? 'opacity-50' : 'opacity-100'}`}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">1. Identify User</label>
                        <div className="flex gap-2">
                            <input 
                                disabled={!!foundUser}
                                value={userIdInput}
                                onChange={e => setUserIdInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleUserLookup()}
                                type="text" 
                                placeholder="Enter Username or SIS ID" 
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {foundUser ? (
                                <button onClick={() => { setFoundUser(null); setFoundItem(null); setCheckoutMessage(null); }} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium">Clear</button>
                            ) : (
                                <button onClick={handleUserLookup} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Lookup</button>
                            )}
                        </div>
                        {foundUser && (
                            <div className="mt-3 flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <div className="p-2 bg-white rounded-full"><UserIcon className="w-5 h-5 text-indigo-600" /></div>
                                <div>
                                    <p className="font-semibold text-indigo-900">{foundUser.firstName} {foundUser.lastName}</p>
                                    <p className="text-xs text-indigo-600">{foundUser.email} • {foundUser.sisId}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Item */}
                    {foundUser && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                             <label className="block text-sm font-medium text-slate-700 mb-2">2. Scan Item</label>
                             <div className="flex gap-2">
                                <input 
                                    autoFocus
                                    value={itemInput}
                                    onChange={e => setItemInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleItemLookup()}
                                    type="text" 
                                    placeholder="Scan RFID Tag" 
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                />
                                <button onClick={handleItemLookup} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Find</button>
                             </div>
                             
                             {foundItem && (
                                <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            <BookOpen className="w-8 h-8 text-slate-700" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{foundItem.title}</h4>
                                            <p className="text-sm text-slate-600">{foundItem.author}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                <span className="font-mono bg-white px-2 py-1 rounded border">RFID: {foundItem.rfidTagId}</span>
                                                <span className={`px-2 py-1 rounded font-medium ${foundItem.currentStatus === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {foundItem.currentStatus}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={executeCheckout}
                                            disabled={foundItem.currentStatus !== 'Available'}
                                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all"
                                        >
                                            Checkout
                                        </button>
                                    </div>
                                </div>
                             )}

                             {checkoutMessage && (
                                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${checkoutMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {checkoutMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    {checkoutMessage.text}
                                </div>
                             )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-xl mx-auto space-y-6 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ArrowLeftRight className="w-10 h-10 text-slate-400" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Scan Item to Return</label>
                        <input 
                            autoFocus
                            value={returnInput}
                            onChange={e => setReturnInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && executeReturn()}
                            type="text" 
                            placeholder="Scan RFID Tag" 
                            className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono"
                        />
                    </div>
                    
                    <button onClick={executeReturn} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
                        Process Return
                    </button>

                    {returnMessage && (
                         <div className={`mt-4 p-4 rounded-xl flex items-center justify-center gap-2 ${returnMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {returnMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {returnMessage.text}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Loans;