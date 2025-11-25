import React, { useEffect, useState } from 'react';
import { db } from '../services/storage';
import { Book, CreateBookDto } from '../types';
import { Plus, Search, Book as BookIcon } from 'lucide-react';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newBook, setNewBook] = useState<CreateBookDto>({
    isbn: '', title: '', author: '', publisher: '', year: new Date().getFullYear(), genre: '', description: ''
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const data = await db.getBooks();
    setBooks(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.createBook({ ...newBook, id: `b${Date.now()}` });
    setIsModalOpen(false);
    setNewBook({ isbn: '', title: '', author: '', publisher: '', year: new Date().getFullYear(), genre: '', description: '' });
    loadBooks();
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Book Catalog</h2>
           <p className="text-slate-500 text-sm">Manage master data for book titles</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search title, author, ISBN..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Book
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Title & ISBN</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Author</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Publisher</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Year</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Genre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBooks.map((book) => (
              <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                        <BookIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{book.title}</p>
                        <p className="text-xs text-slate-500 font-mono">{book.isbn}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{book.author}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{book.publisher}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{book.year}</td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {book.genre}
                    </span>
                </td>
              </tr>
            ))}
            {filteredBooks.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No books found matching your search.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Add New Book</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">ISBN</label>
                        <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Publication Year</label>
                        <input type="number" required className="w-full px-3 py-2 border rounded-lg text-sm" value={newBook.year} onChange={e => setNewBook({...newBook, year: parseInt(e.target.value)})} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
                    <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Author</label>
                        <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Publisher</label>
                        <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newBook.publisher} onChange={e => setNewBook({...newBook, publisher: e.target.value})} />
                    </div>
                </div>
                <div>
                     <label className="block text-xs font-medium text-slate-700 mb-1">Genre</label>
                     <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newBook.genre} onChange={e => setNewBook({...newBook, genre: e.target.value})} />
                </div>
                <div>
                     <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                     <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Create Book</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
