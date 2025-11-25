import { User, Book, Item, Loan, RFIDTag, UserRole, ItemStatus, LoanStatus } from '../types';

// Initial Seed Data
const SEED_USERS: User[] = [
  { id: 'u1', username: 'admin', firstName: 'Sarah', lastName: 'Connor', email: 'admin@school.edu', role: UserRole.ADMIN, studentId: 'ADM001' },
  { id: 'u2', username: 'lib', firstName: 'Rupert', lastName: 'Giles', email: 'giles@school.edu', role: UserRole.LIBRARIAN, studentId: 'LIB001' },
  { id: 'u3', username: 'student', firstName: 'Harry', lastName: 'Potter', email: 'harry@school.edu', role: UserRole.STUDENT, studentId: 'STU001' },
];

const SEED_BOOKS: Book[] = [
  { id: 'b1', isbn: '978-0451524935', title: '1984', author: 'George Orwell', publisher: 'Signet Classic', year: 1961, genre: 'Dystopian', description: 'A startilingly original and haunting novel that creates an imaginary world that is completely convincing.' },
  { id: 'b2', isbn: '978-0061120084', title: 'To Kill a Mockingbird', author: 'Harper Lee', publisher: 'Harper Perennial', year: 1960, genre: 'Fiction', description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.' },
];

const SEED_ITEMS: Item[] = [
  { id: 'i1', bookId: 'b1', uniqueBarcode: 'LIB-1001', status: ItemStatus.AVAILABLE, acquisitionDate: '2023-01-15' },
  { id: 'i2', bookId: 'b1', uniqueBarcode: 'LIB-1002', status: ItemStatus.ON_LOAN, acquisitionDate: '2023-01-15' },
  { id: 'i3', bookId: 'b2', uniqueBarcode: 'LIB-2001', status: ItemStatus.AVAILABLE, acquisitionDate: '2023-02-20' },
];

const SEED_LOANS: Loan[] = [
  { id: 'l1', itemId: 'i2', userId: 'u3', loanDate: '2023-10-01', dueDate: '2023-10-15', status: LoanStatus.CURRENT },
];

const SEED_TAGS: RFIDTag[] = [
    { id: 't1', tagValue: 'E2000019060C013715607996', itemId: 'i1', registeredAt: '2023-01-16' }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  init() {
    if (!localStorage.getItem('users')) this.set('users', SEED_USERS);
    if (!localStorage.getItem('books')) this.set('books', SEED_BOOKS);
    if (!localStorage.getItem('items')) this.set('items', SEED_ITEMS);
    if (!localStorage.getItem('loans')) this.set('loans', SEED_LOANS);
    if (!localStorage.getItem('rfidTags')) this.set('rfidTags', SEED_TAGS);
  }

  // Users
  async getUsers(): Promise<User[]> {
    await delay(300);
    return this.get<User>('users');
  }

  async createUser(user: User): Promise<User> {
    await delay(300);
    const users = this.get<User>('users');
    users.push(user);
    this.set('users', users);
    return user;
  }

  // Books
  async getBooks(): Promise<Book[]> {
    await delay(200);
    return this.get<Book>('books');
  }

  async createBook(book: Book): Promise<Book> {
    await delay(300);
    const books = this.get<Book>('books');
    books.push(book);
    this.set('books', books);
    return book;
  }

  // Items
  async getItems(): Promise<Item[]> {
    await delay(200);
    return this.get<Item>('items');
  }

  async createItem(item: Item): Promise<Item> {
    await delay(300);
    const items = this.get<Item>('items');
    items.push(item);
    this.set('items', items);
    return item;
  }

  async updateItemStatus(itemId: string, status: ItemStatus): Promise<void> {
    const items = this.get<Item>('items');
    const idx = items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      items[idx].status = status;
      this.set('items', items);
    }
  }

  async getRFIDTags(): Promise<RFIDTag[]> {
    await delay(200);
    return this.get<RFIDTag>('rfidTags');
  }

  async linkRfidToItem(itemId: string, rfidValue: string): Promise<RFIDTag> {
      await delay(400);
      const items = this.get<Item>('items');
      const tags = this.get<RFIDTag>('rfidTags');
      
      const itemIdx = items.findIndex(i => i.id === itemId);
      if (itemIdx === -1) throw new Error('Item not found');

      // Create or update tag
      const newTag: RFIDTag = {
          id: `t${Date.now()}`,
          tagValue: rfidValue,
          itemId: itemId,
          registeredAt: new Date().toISOString()
      };
      
      tags.push(newTag);
      items[itemIdx].rfidTagId = newTag.id;
      
      this.set('items', items);
      this.set('rfidTags', tags);
      return newTag;
  }

  // Loans
  async getLoans(): Promise<Loan[]> {
    await delay(300);
    return this.get<Loan>('loans');
  }

  async createLoan(loan: Loan): Promise<Loan> {
    await delay(500);
    const loans = this.get<Loan>('loans');
    loans.push(loan);
    this.set('loans', loans);
    await this.updateItemStatus(loan.itemId, ItemStatus.ON_LOAN);
    return loan;
  }

  async returnLoan(loanId: string): Promise<void> {
    await delay(500);
    const loans = this.get<Loan>('loans');
    const idx = loans.findIndex(l => l.id === loanId);
    if (idx !== -1) {
      loans[idx].status = LoanStatus.RETURNED;
      loans[idx].returnDate = new Date().toISOString();
      await this.updateItemStatus(loans[idx].itemId, ItemStatus.AVAILABLE);
      this.set('loans', loans);
    }
  }
}

export const db = new MockDatabase();
db.init(); // Initialize on load