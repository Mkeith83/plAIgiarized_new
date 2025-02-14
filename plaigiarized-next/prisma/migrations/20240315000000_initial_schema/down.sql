-- DropForeignKeys
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_userId_fkey";
-- Continue dropping all foreign keys...

-- DropIndexes
DROP INDEX "users_email_key";
DROP INDEX "users_email_idx";
-- Continue dropping all indexes...

-- DropTables
DROP TABLE "users";
DROP TABLE "student_profiles";
-- Continue dropping all tables...

-- DropEnums
DROP TYPE "UserRole";
DROP TYPE "EnrollmentStatus";
DROP TYPE "SubmissionStatus";
DROP TYPE "RiskLevel";
DROP TYPE "ReportStatus";
DROP TYPE "SourceType"; 