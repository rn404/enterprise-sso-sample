declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URL?: string;
      BOOTSTRAP_MODE?: "true" | "false";
      SUPER_USER_EMAIL?: string;
      SESSION_SECRET?: string;
      DATABASE_PATH?: string;
      PORT?: string;
    }
  }
}

export {};
