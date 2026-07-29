-- Adds email + password sign-in alongside OAuth.
-- Nullable: OAuth-only accounts never have a password.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
