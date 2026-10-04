import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { facilityPerformances } from "@/lib/tb-data";

export const Route = createFileRoute("/district-officer/reports")({
  head: () => ({
    meta: [{ title: "Reports — District & Zone Portal" }],
  }),
  component: DistrictOfficerReports,
});

type ReportType = "adherence" | "missed_dose" | "facility" | "district";

export function DistrictOfficerReports() {
  const [reportType, setReportType] = useState<ReportType>("adherence");
  const [district, setDistrict] = useState<string>("lilongwe");
  const [period, setPeriod] = useState<string>("1–31 October 2026");
  const [generated, setGenerated] = useState<boolean>(true);

  const handleGenerate = () => {
    setGenerated(true);
    toast.success("Report generated successfully");
  };

  const handleExportCSV = () => {
    toast.success("CSV file exported", {
      description: "TB_Adherence_Report_Lilongwe.csv downloaded.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Programme Reporting
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional summary reports and district performance exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-8 border-border"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-8 border-border"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Report
          </Button>
        </div>
      </div>

      {/* Report Generator Controls */}
      <section className="border border-border bg-card p-4 rounded-md space-y-4">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Configure Report Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Report Type</label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger className="text-xs h-9 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adherence" className="text-xs">
                  Adherence Summary Report
                </SelectItem>
                <SelectItem value="missed_dose" className="text-xs">
                  Missed-Dose Summary Report
                </SelectItem>
                <SelectItem value="facility" className="text-xs">
                  Facility Performance Report
                </SelectItem>
                <SelectItem value="district" className="text-xs">
                  District Comparison Report
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">District Scope</label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="text-xs h-9 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lilongwe" className="text-xs">
                  Lilongwe District
                </SelectItem>
                <SelectItem value="kasungu" className="text-xs">
                  Kasungu District
                </SelectItem>
                <SelectItem value="mchinji" className="text-xs">
                  Mchinji District
                </SelectItem>
                <SelectItem value="zomba" className="text-xs">
                  Zomba District
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Reporting Period</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="text-xs h-9 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1–31 October 2026" className="text-xs">
                  1–31 October 2026
                </SelectItem>
                <SelectItem value="1–30 September 2026" className="text-xs">
                  1–30 September 2026
                </SelectItem>
                <SelectItem value="Q3 2026" className="text-xs">
                  Q3 2026 (Jul–Sep)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleGenerate} size="sm" className="text-xs font-semibold h-8">
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Generate Report
          </Button>
        </div>
      </section>

      {/* Formatted Institutional Report Preview */}
      {generated && (
        <section className="border border-border bg-card p-6 sm:p-8 rounded-md space-y-6 text-xs print:p-0 print:border-none">
          {/* Institutional Document Header */}
          <div className="border-b-2 border-foreground pb-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-widest text-[11px] text-muted-foreground">
                Ministry of Health · Republic of Malawi
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Official Report Document
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              DIGITAL TB ADHERENCE SYSTEM
            </h2>
            <p className="font-bold text-sm text-foreground">
              {reportType === "adherence" && "TB Treatment Adherence Summary Report"}
              {reportType === "missed_dose" && "Missed-Dose Patterns Summary Report"}
              {reportType === "facility" && "Health Facility Performance Report"}
              {reportType === "district" && "Regional District Comparison Report"}
            </p>
            <div className="pt-2 text-muted-foreground flex flex-wrap gap-4 text-[11px] font-medium">
              <span>Scope: {district.charAt(0).toUpperCase() + district.slice(1)} District</span>
              <span>•</span>
              <span>Reporting Period: {period}</span>
              <span>•</span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Programme Summary Grid */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              1. Programme Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border border-border p-4 rounded-md bg-muted/20">
              <div>
                <span className="text-muted-foreground block font-medium">Patients Monitored</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">1,284</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Overall Adherence</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">95.6%</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Missed-Dose Rate</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">4.4%</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">
                  Facilities Reporting
                </span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">18 / 19</span>
              </div>
            </div>
          </div>

          {/* Facility Performance Table */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              2. Facility Performance Breakdown
            </h3>
            <div className="border border-border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-foreground">
                      Facility
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">
                      Patients
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">
                      Scheduled Doses
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">
                      Adherence Rate
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">
                      Missed Rate
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilityPerformances.map((f) => (
                    <TableRow key={f.id} className="text-xs">
                      <TableCell className="font-bold text-foreground">{f.name}</TableCell>
                      <TableCell className="text-right">{f.patientCount}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {f.scheduledDoses.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold">{f.adherenceRate}%</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {f.missedRate}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Calculated Institutional Observations */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              3. Summary Observations
            </h3>
            <div className="border border-border p-3.5 rounded-md bg-muted/10 space-y-1.5 text-muted-foreground leading-relaxed">
              <p>
                • Overall district treatment adherence increased by{" "}
                <strong>1.4 percentage points</strong> compared with the previous 30-day reporting
                period.
              </p>
              <p>
                • Area 18 Health Centre recorded the highest missed-dose rate (13.0%); HSA follow-up
                capacity and smart box battery swaps have been requested.
              </p>
              <p>
                • Area 25 Health Centre achieved optimal compliance (97.0% adherence) across 142
                enrolled patients.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
