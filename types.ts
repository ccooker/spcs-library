
export interface MediaType {
  mediaTypeId: number;
  typeName: string;
}

export interface UserType {
  userTypeId: number;
  typeName: string;
  description: string;
  permissionsJson: {
    canManageUsers: boolean;
    canManageItems: boolean;
    canManageCirculation: boolean;
    canViewReports: boolean;
  };
}

export interface User {
  userId: number;
  sisId?: string;
  username: string;
  passwordHash?: string; // in real app, don't send to frontend
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userTypeId: number;
  department?: string;
  dateRegistered: string;
  lastLogin?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface Item {
  itemId: number;
  rfidTagId: string;
  isbn?: string;
  title: string;
  author?: string;
  publisher?: string;
  publicationYear?: number;
  description?: string;
  mediaTypeId: number;
  marc21Data?: any; // JSONB
  currentStatus: 'Available' | 'Checked Out' | 'Reserved' | 'Lost' | 'Damaged';
  location?: string;
  coverImageUrl?: string;
  dateAdded: string;
}

export interface Circulation {
  circulationId: number;
  itemId: number;
  userId: number;
  checkoutDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  fineStatus: 'Pending' | 'Paid' | 'Waived';
  renewedCount: number;
  status: 'Checked Out' | 'Returned' | 'Overdue';
}

export interface Fine {
  fineId: number;
  userId: number;
  itemId?: number;
  circulationId?: number;
  fineDate: string;
  amount: number;
  reason?: string;
  paidDate?: string;
  status: 'Unpaid' | 'Paid' | 'Waived';
}

export interface Reservation {
  reservationId: number;
  itemId: number;
  userId: number;
  reservationDate: string;
  expiryDate?: string;
  status: 'Pending' | 'Ready for Pickup' | 'Cancelled' | 'Fulfilled';
}
