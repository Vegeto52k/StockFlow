export interface User {
  id: number;
  username: string;
  role: 'Admin' | 'User';
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: 'Admin' | 'User';
}

export interface UpdateUserRoleRequest {
  role: 'Admin' | 'User';
}