import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ticketsToCsv } from "@/lib/reports";

export async function GET() {
  await requireRole(["ADMIN"]);

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      code: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      slaDueAt: true,
      building: { select: { name: true } },
      category: { select: { name: true } },
      assignedJem: { select: { name: true } },
      assignedJop: { select: { name: true } },
      requester: { select: { name: true } },
    },
  });

  const csv = ticketsToCsv(tickets);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jop360-reporte-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
