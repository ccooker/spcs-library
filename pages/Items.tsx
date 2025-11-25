import React, { useEffect, useState } from 'react';
import { db } from '../services/storage';
import { Book, Item, ItemStatus, RFIDTag } from '../types';
import { Barcode, Scan, Plus, Search, Tag, CheckCircle, XCircle } from 'lucide-react';

const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Link RFID Modal
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [rfidInput, setRfidInput] = useState('');
  const [simulatingScan, setSimulatingScan] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [i, b] = await Promise.all([db.getItems(), db.getBooks()]);
    setItems(i);
    setBooks(b);
    setLoading(false);
  };

  const getBookDetails = (bookId: string) => {
    return books.find(b => b.id === bookId) || { title: 'Unknown', isbn: 'Unknown' };
  };

  const handleSimulateScan = () => {
    setSimulatingScan(true);
    setTimeout(() => {
        // Generate a random hex string to simulate an RFID tag ID
        const fakeTag = Array.from({length: 24}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
        setRfidInput(fakeTag);
        setSimulatingScan(false);
    }, 1000);
  };

  const handleLinkRfid = async () => {
    if (!selectedItem || !rfidInput) return;
    try {
        await db.linkRfidToItem(selectedItem.id, rfidInput);
        setSelectedItem(null);
        setRfidInput('');
        fetchData(); // refresh list
    } catch (err) {
        console.error("Failed to link", err);
    }
  };

  const statusColor = (status: ItemStatus) => {
      switch(status) {
          case ItemStatus.AVAILABLE: return 'bg-green-100 text-green-800';
          case ItemStatus.ON_LOAN: return 'bg-blue-100 text-blue-800';
          case ItemStatus.LOST: return 'bg-red-100 text-red-800';
          case ItemStatus.DAMAGED: return 'bg-amber-100 text-amber-800';
          default: return 'bg-slate-100 text-slate-800';
      }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
            <h2 className="text-2xl font-bold text-slate-800">Inventory Items</h2>
            <p className="text-slate-500 text-sm">Manage physical copies and RFID tags</p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Item
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Physical Barcode</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Book Title</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">RFID Tag</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                    const book = getBookDetails(item.bookId);
                    return (
                        <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 font-mono text-sm text-slate-700">
                                    <Barcode className="w-4 h-4 text-slate-400" />
                                    {item.uniqueBarcode}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-medium text-slate-900 block">{book.title}</span>
                                <span className="text-xs text-slate-500">ISBN: {book.isbn}</span>
                            </td>
                            <td className="px-6 py-4">
                                {item.rfidTagId ? (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                                        <Tag className="w-3 h-3" /> Linked
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">No Tag</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => setSelectedItem(item)}
                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                >
                                    {item.rfidTagId ? 'Update Tag' : 'Link RFID'}
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>

        {/* RFID Linking Modal */}
        {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-lg text-slate-800">Link RFID Tag</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Scan a tag to link it to <span className="font-mono font-medium text-slate-700">{selectedItem.uniqueBarcode}</span>
                        </p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="relative">
                            <label className="block text-xs font-medium text-slate-700 mb-2">RFID Tag Value</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={rfidInput}
                                    onChange={(e) => setRfidInput(e.target.value)}
                                    placeholder="Place cursor here and scan..."
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button 
                                    onClick={handleSimulateScan}
                                    disabled={simulatingScan}
                                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                                    title="Simulate Hardware Scan"
                                >
                                    <Scan className={`w-4 h-4 ${simulatingScan ? 'animate-pulse' : ''}`} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                In a real deployment, the RFID reader acts as a keyboard input device.
                            </p>
                        </div>

                        {selectedItem.rfidTagId && (
                            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100 flex items-start gap-2">
                                <div className="mt-0.5"><CheckCircle className="w-4 h-4" /></div>
                                <div>
                                    Warning: This item is already linked to a tag. Proceeding will overwrite the existing link.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 flex justify-end gap-3">
                         <button onClick={() => setSelectedItem(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                         <button 
                            onClick={handleLinkRfid}
                            disabled={!rfidInput}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Link
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Items;
