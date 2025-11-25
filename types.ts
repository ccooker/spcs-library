export enum UserRole {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  studentId?: string; // or staffId
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  genre: string;
  description: string;
}

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  ON_LOAN = 'ON_LOAN',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
}

export interface Item {
  id: string;
  bookId: string;
  uniqueBarcode: string;
  rfidTagId?: string; // ID of the linked tag
  status: ItemStatus;
  acquisitionDate: string;
}

export interface RFIDTag {
  id: string;
  tagValue: string; // The raw value read from the chip
  itemId?: string; // Linked item
  registeredAt: string;
}

export enum LoanStatus {
  CURRENT = 'CURRENT',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

export interface Loan {
  id: string;
  itemId: string;
  userId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
}

// DTOs for UI forms
export interface CreateBookDto extends Omit<Book, 'id'> {}
export interface CreateUserDto extends Omit<User, 'id'> { password?: string }
export interface CreateItemDto { bookId: string; uniqueBarcode: string; }
