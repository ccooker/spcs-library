
import React, { useEffect, useState } from 'react';
import { db } from '../services/storage';
import { Item, MediaType } from '../types';
import { Plus, Search, BookOpen, Tag, Barcode, Globe, Image as ImageIcon } from 'lucide-react';

const Catalog: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const initialFormState: Partial<Item> = {
    rfidTagId: '', isbn: '', title: '', author: '', publisher: '', publicationYear: new Date().getFullYear(), description: '', mediaTypeId: 1, location: '', coverImageUrl: '', marc21Data: '{}'
  };
  const [formData, setFormData] = useState<Partial<Item>>(initialFormState);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [fetchedItems, fetchedMedia] = await Promise.all([db.getItems(), db.getMediaTypes()]);
    setItems(fetchedItems);
    setMediaTypes(fetchedMedia);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.createItem(formData);
    setIsModalOpen(false);
    setFormData(initialFormState);
    loadData();
  };

  const handleIsbnLookup = async () => {
    if (!formData.isbn) return;
    setLookupLoading(true);
    const result = await db.lookupISBN(formData.isbn);
    setFormData(prev => ({ ...prev, ...result }));
    setLookupLoading(false);
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.isbn?.includes(searchTerm) ||
    i.rfidTagId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Item Catalog</h2>
           <p className="text-slate-500 text-sm">Manage bibliographic records and physical items</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search title, ISBN, RFID..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Title & Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Identifiers</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Location</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.itemId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.author} • {item.publicationYear}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Barcode className="w-3 h-3" /> {item.isbn || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Tag className="w-3 h-3" /> {item.rfidTagId}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.location || '-'}</td>
                <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${item.currentStatus === 'Available' ? 'bg-green-100 text-green-800' : 
                          item.currentStatus === 'Checked Out' ? 'bg-blue-100 text-blue-800' : 
                          'bg-amber-100 text-amber-800'}`}>
                        {item.currentStatus}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm">
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
                <h3 className="font-bold text-lg text-slate-800">Add New Item</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">RFID Tag ID <span className="text-red-500">*</span></label>
                        <input required className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 font-mono" placeholder="Scan Tag..." value={formData.rfidTagId} onChange={e => setFormData({...formData, rfidTagId: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">ISBN</label>
                        <div className="flex gap-2">
                            <input className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
                            <button type="button" onClick={handleIsbnLookup} disabled={lookupLoading} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200">
                                {lookupLoading ? '...' : <Globe className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                            <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Author</label>
                            <input className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Publisher</label>
                        <input className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Year</label>
                        <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.publicationYear} onChange={e => setFormData({...formData, publicationYear: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Media Type</label>
                        <select className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.mediaTypeId} onChange={e => setFormData({...formData, mediaTypeId: parseInt(e.target.value)})}>
                            {mediaTypes.map(m => <option key={m.mediaTypeId} value={m.mediaTypeId}>{m.typeName}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Location / Shelf</label>
                        <input className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Cover Image URL</label>
                        <div className="flex gap-2">
                            <input className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.coverImageUrl} onChange={e => setFormData({...formData, coverImageUrl: e.target.value})} />
                            {formData.coverImageUrl && <ImageIcon className="w-8 h-8 text-slate-300 p-1 border rounded" />}
                        </div>
                    </div>
                </div>

                <div>
                     <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                     <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div>
                     <label className="block text-xs font-medium text-slate-700 mb-1">MARC21 Data (JSON)</label>
                     <textarea className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-xs" rows={3} value={typeof formData.marc21Data === 'string' ? formData.marc21Data : JSON.stringify(formData.marc21Data)} onChange={e => setFormData({...formData, marc21Data: e.target.value})} />
                </div>

                <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Item</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
