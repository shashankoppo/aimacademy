import "express";

declare module "express-serve-static-core" {
  interface Request {
    authUser?: {
      id: string;
      role: string;
      permissions: Set<string>;
    };
  }
}

