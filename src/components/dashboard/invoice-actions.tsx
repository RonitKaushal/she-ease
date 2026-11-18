"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export function InvoiceActions({
  bookingId,
  serviceName,
  total,
  date,
}: {
  bookingId: string;
  serviceName: string;
  total: number;
  date: string;
}) {
  async function downloadPdf() {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("SheEase Invoice", 20, 20);
      doc.setFontSize(11);
      doc.text(`Booking: ${bookingId}`, 20, 35);
      doc.text(`Service: ${serviceName}`, 20, 45);
      doc.text(`Date: ${date}`, 20, 55);
      doc.text(`Total: ${formatINR(total)}`, 20, 65);
      doc.text("Thank you for booking with SheEase.", 20, 80);
      doc.save(`${bookingId}-invoice.pdf`);
      toast.success("Invoice downloaded");
    } catch {
      window.print();
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        Print
      </Button>
      <Button size="sm" onClick={downloadPdf}>
        Download PDF
      </Button>
    </div>
  );
}
