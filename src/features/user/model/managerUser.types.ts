export type ManagerStatus = "Active" | "Suspended";

export interface ManagerUser {
  id: string;
  fullName: string;
  email: string;
  status: ManagerStatus;
}

export interface CreateManagerInput {
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateManagerInput {
  id: string;
  fullName: string;
  email: string;
  status: ManagerStatus;
}