export interface JWTPayload {
  id: string;
  org_id: string;
  role: string;
  manager_id?: string;
  first_name?: string;
  username?: string;
}