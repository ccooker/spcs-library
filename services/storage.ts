
import { User, Item, Circulation, Fine, Reservation, UserType, MediaType } from '../types';

// --- SEED DATA ---

const MEDIA_TYPES: MediaType[] = [
  { mediaTypeId: 1, typeName: 'Book' },
  { mediaTypeId: 2, typeName: 'DVD' },
  { mediaTypeId: 3, typeName: 'Periodical' },
  { mediaTypeId: 4, typeName: 'Digital Resource' },
];

const USER_TYPES: UserType[] = [
  { userTypeId: 1, typeName: 'Admin', description: 'Full access', permissionsJson: { canManageUsers: true, canManageItems: true, canManageCirculation: true, canViewReports: true } },
  { userTypeId: 2, typeName: 'Librarian', description: 'Manage library', permissionsJson: { canManageUsers: false, canManageItems: true, canManageCirculation: true, canViewReports: true } },
  { userTypeId: 3, typeName: 'Student', description: 'Borrow items', permissionsJson: { canManageUsers: false, canManageItems: false, canManageCirculation: false, canViewReports: false } },
  { userTypeId: 4, typeName: 'Teacher', description: 'Borrow items', permissionsJson: { canManageUsers: false, canManageItems: false, canManageCirculation: false, canViewReports: false } },
];

const USERS: User[] = [
  { userId: 1, username: 'admin', email: 'admin@school.edu', firstName: 'Sarah', lastName: 'Connor', userTypeId: 1, status: 'Active', dateRegistered: new Date().toISOString() },
  { userId: 2, username: 'lib', email: 'giles@school.edu', firstName: 'Rupert', lastName: 'Giles', userTypeId: 2, status: 'Active', dateRegistered: new Date().toISOString() },
  { userId: 3, username: 'student', email: 'harry@school.edu', firstName: 'Harry', lastName: 'Potter', userTypeId: 3, status: 'Active', dateRegistered: new Date().toISOString(), sisId: 'STU001' },
];

const ITEMS: Item[] = [
  { itemId: 1, rfidTagId: 'E2000019060C013715607996', isbn: '978-0451524935', title: '1984', author: 'George Orwell', mediaTypeId: 1, currentStatus: 'Available', location: 'Shelf A1', dateAdded: '2023-01-15T00:00:00Z', publicationYear: 1961, publisher: 'Signet' },
  { itemId: 2, rfidTagId: 'E2000019060C013715607997', isbn: '978-0061120084', title: 'To Kill a Mockingbird', author: 'Harper Lee', mediaTypeId: 1, currentStatus: 'Checked Out', location: 'Shelf A2', dateAdded: '2023-01-15T00:00:00Z', publicationYear: 1960, publisher: 'Harper' },
];

const CIRCULATIONS: Circulation[] = [
  { circulationId: 1, itemId: 2, userId: 3, checkoutDate: '2023-10-01T10:00:00Z', dueDate: '2023-10-15T10:00:00Z', fineAmount: 0, fineStatus: 'Pending', renewedCount: 0, status: 'Checked Out' },
];

const FINES: Fine[] = [];
const RESERVATIONS: Reservation[] = [];

// Helper
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
    if (!localStorage.getItem('users')) this.set('users', USERS);
    if (!localStorage.getItem('items')) this.set('items', ITEMS);
    if (!localStorage.getItem('circulations')) this.set('circulations', CIRCULATIONS);
    if (!localStorage.getItem('fines')) this.set('fines', FINES);
    if (!localStorage.getItem('reservations')) this.set('reservations', RESERVATIONS);
    // Static data, no need to persist usually, but for consistency
    if (!localStorage.getItem('mediaTypes')) this.set('mediaTypes', MEDIA_TYPES);
    if (!localStorage.getItem('userTypes')) this.set('userTypes', USER_TYPES);
  }

  // --- GETTERS ---
  async getUserTypes(): Promise<UserType[]> { return this.get('userTypes'); }
  async getMediaTypes(): Promise<MediaType[]> { return this.get('mediaTypes'); }
  async getUsers(): Promise<User[]> { await delay(200); return this.get('users'); }
  async getItems(): Promise<Item[]> { await delay(200); return this.get('items'); }
  async getCirculations(): Promise<Circulation[]> { await delay(200); return this.get('circulations'); }
  async getFines(): Promise<Fine[]> { await delay(200); return this.get('fines'); }

  // --- ACTIONS ---

  // USERS
  async createUser(user: Partial<User>): Promise<User> {
    await delay(300);
    const users = this.get<User>('users');
    const newUser: User = {
      ...user as User,
      userId: users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1,
      dateRegistered: new Date().toISOString(),
      status: 'Active'
    };
    users.push(newUser);
    this.set('users', users);
    return newUser;
  }

  async importUsers(csvData: string): Promise<number> {
    // Stub for CSV import
    await delay(1000);
    console.log("Processing CSV...", csvData);
    // Create a fake user to simulate import
    const users = this.get<User>('users');
    const newUser: User = {
        userId: users.length + 1,
        username: `imported_user_${Date.now()}`,
        email: `imported${Date.now()}@school.edu`,
        firstName: 'Imported',
        lastName: 'User',
        userTypeId: 3,
        status: 'Active',
        dateRegistered: new Date().toISOString()
    };
    users.push(newUser);
    this.set('users', users);
    return 1; // Return count of imported
  }

  // ITEMS
  async createItem(item: Partial<Item>): Promise<Item> {
    await delay(300);
    const items = this.get<Item>('items');
    const newItem: Item = {
      ...item as Item,
      itemId: items.length > 0 ? Math.max(...items.map(i => i.itemId)) + 1 : 1,
      currentStatus: 'Available',
      dateAdded: new Date().toISOString()
    };
    items.push(newItem);
    this.set('items', items);
    return newItem;
  }

  async updateItem(item: Item): Promise<Item> {
    await delay(200);
    const items = this.get<Item>('items');
    const index = items.findIndex(i => i.itemId === item.itemId);
    if (index !== -1) {
        items[index] = item;
        this.set('items', items);
    }
    return item;
  }

  async lookupISBN(isbn: string): Promise<Partial<Item>> {
    await delay(800);
    // Stub Z39.50/External API
    if (isbn === '978-0743273565') {
        return {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            publisher: 'Scribner',
            publicationYear: 1925,
            description: 'The story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
            coverImageUrl: 'https://example.com/gatsby.jpg'
        };
    }
    return {};
  }

  // CIRCULATION
  async checkout(userId: number, rfidTagId: string): Promise<Circulation> {
    await delay(500);
    const items = this.get<Item>('items');
    const itemIdx = items.findIndex(i => i.rfidTagId === rfidTagId);
    
    if (itemIdx === -1) throw new Error('Item not found');
    if (items[itemIdx].currentStatus !== 'Available') throw new Error(`Item is ${items[itemIdx].currentStatus}`);

    const circulations = this.get<Circulation>('circulations');
    
    // Default 14 day loan
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const newCirc: Circulation = {
        circulationId: circulations.length + 1,
        itemId: items[itemIdx].itemId,
        userId: userId,
        checkoutDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        fineAmount: 0,
        fineStatus: 'Pending',
        renewedCount: 0,
        status: 'Checked Out'
    };

    items[itemIdx].currentStatus = 'Checked Out';
    
    circulations.push(newCirc);
    this.set('circulations', circulations);
    this.set('items', items);
    
    return newCirc;
  }

  async returnItem(rfidTagId: string): Promise<{ circulation: Circulation, fine?: Fine }> {
    await delay(500);
    const items = this.get<Item>('items');
    const itemIdx = items.findIndex(i => i.rfidTagId === rfidTagId);
    
    if (itemIdx === -1) throw new Error('Item not found');
    const item = items[itemIdx];

    const circulations = this.get<Circulation>('circulations');
    const circIdx = circulations.findIndex(c => c.itemId === item.itemId && c.status === 'Checked Out');

    if (circIdx === -1) throw new Error('Item is not checked out');
    
    const circ = circulations[circIdx];
    circ.returnDate = new Date().toISOString();
    circ.status = 'Returned';
    
    // Fine Calculation: $0.50 per day overdue
    const due = new Date(circ.dueDate);
    const now = new Date();
    let fineRecord: Fine | undefined;

    if (now > due) {
        const diffTime = Math.abs(now.getTime() - due.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const fineAmount = diffDays * 0.50;
        
        circ.fineAmount = fineAmount;
        circ.status = 'Overdue'; // Technically returned but with overdue record, logic varies. Keeping 'Returned' for item status flow, but flagging fine.
        
        // Create Fine Record
        const fines = this.get<Fine>('fines');
        fineRecord = {
            fineId: fines.length + 1,
            userId: circ.userId,
            itemId: circ.itemId,
            circulationId: circ.circulationId,
            fineDate: new Date().toISOString(),
            amount: fineAmount,
            reason: `Overdue by ${diffDays} days`,
            status: 'Unpaid'
        };
        fines.push(fineRecord);
        this.set('fines', fines);
    }

    item.currentStatus = 'Available';
    
    this.set('items', items);
    this.set('circulations', circulations);

    return { circulation: circ, fine: fineRecord };
  }

  async renewItem(rfidTagId: string): Promise<Circulation> {
    await delay(300);
    const items = this.get<Item>('items');
    const item = items.find(i => i.rfidTagId === rfidTagId);
    if (!item) throw new Error('Item not found');

    const circulations = this.get<Circulation>('circulations');
    const circIdx = circulations.findIndex(c => c.itemId === item.itemId && c.status === 'Checked Out');
    if (circIdx === -1) throw new Error('Item is not checked out');

    // Extend 7 days
    const currentDue = new Date(circulations[circIdx].dueDate);
    currentDue.setDate(currentDue.getDate() + 7);
    
    circulations[circIdx].dueDate = currentDue.toISOString();
    circulations[circIdx].renewedCount += 1;

    this.set('circulations', circulations);
    return circulations[circIdx];
  }

  // FINES
  async payFine(fineId: number): Promise<void> {
      const fines = this.get<Fine>('fines');
      const idx = fines.findIndex(f => f.fineId === fineId);
      if (idx !== -1) {
          fines[idx].status = 'Paid';
          fines[idx].paidDate = new Date().toISOString();
          this.set('fines', fines);
      }
  }

  // DASHBOARD / REPORTING
  async getStats() {
      const circulations = this.get<Circulation>('circulations');
      const items = this.get<Item>('items');
      const active = circulations.filter(c => c.status === 'Checked Out');
      const overdue = circulations.filter(c => {
          if (c.status !== 'Checked Out') return false;
          return new Date(c.dueDate) < new Date();
      });
      
      return {
          totalItems: items.length,
          activeLoans: active.length,
          overdueLoans: overdue.length,
          totalCheckouts: circulations.length
      };
  }
}

export const db = new MockDatabase();
db.init();
