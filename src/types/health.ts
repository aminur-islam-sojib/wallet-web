export type HealthUserDetails = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type DbHealthResponse = {
  ok: boolean;
  db: {
    connected: boolean;
  };
  error?: string;
  details?: {
    name: string;
    message: string;
    code?: string | number | null;
  };
  user?: {
    exists: boolean;
    details: HealthUserDetails | null;
  };
};
