-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_assignedJopId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "assignedJopId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedJopId_fkey" FOREIGN KEY ("assignedJopId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
