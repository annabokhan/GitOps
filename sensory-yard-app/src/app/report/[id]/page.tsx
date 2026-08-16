import { notFound } from "next/navigation";
import { getReport } from "@/lib/store";
import ReportView from "@/components/ReportView";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = getReport(id);

  if (!report) return notFound();

  return <ReportView report={report} />;
}
