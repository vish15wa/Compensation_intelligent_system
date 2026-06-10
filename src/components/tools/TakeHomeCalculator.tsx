"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils/normalization";
import { IndianRupee, Calculator, Percent, Building2 } from "lucide-react";

function estimateIncomeTax(annualIncome: number): number {
  if (annualIncome <= 300000) return 0;
  let tax = 0;
  if (annualIncome > 300000) tax += Math.min(annualIncome - 300000, 300000) * 0.05;
  if (annualIncome > 600000) tax += Math.min(annualIncome - 600000, 300000) * 0.10;
  if (annualIncome > 900000) tax += Math.min(annualIncome - 900000, 300000) * 0.15;
  if (annualIncome > 1200000) tax += Math.min(annualIncome - 1200000, 300000) * 0.20;
  if (annualIncome > 1500000) tax += (annualIncome - 1500000) * 0.30;
  return Math.round(tax * 1.04); // 4% cess
}

export default function TakeHomeCalculator() {
  const [ctc, setCtc] = useState("");
  const [basicPct, setBasicPct] = useState("50");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const annualCtc = parseFloat(ctc);
    if (!annualCtc || annualCtc <= 0) return;

    const basicP = parseFloat(basicPct) / 100;
    const basic = annualCtc * basicP;
    const hra = basic * 0.5;
    const employerPf = Math.min(basic * 0.12, 216000);
    const employeePf = Math.min(basic * 0.12, 216000);
    const professionalTax = 2500;
    const gratuity = Math.round(basic * 0.0481);
    const taxable = annualCtc - employeePf - professionalTax - gratuity;
    const incomeTax = estimateIncomeTax(taxable);
    const totalDeductions = employeePf + professionalTax + incomeTax;
    const takeHomeAnnual = annualCtc - totalDeductions;
    const takeHomeMonthly = Math.round(takeHomeAnnual / 12);

    setResult({
      annualCtc,
      basic: Math.round(basic),
      hra: Math.round(hra),
      employerPf: Math.round(employerPf),
      employeePf: Math.round(employeePf),
      professionalTax,
      gratuity,
      taxable: Math.round(taxable),
      incomeTax,
      totalDeductions,
      takeHomeAnnual: Math.round(takeHomeAnnual),
      takeHomeMonthly,
      basicPct: parseFloat(basicPct),
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-white/80 border-olive">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-bronze">
              <Calculator className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Calculator</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Take-Home Salary Calculator</h3>
            <p className="text-sm text-muted-foreground">Estimate your monthly in-hand salary from your annual CTC.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Annual CTC (₹)
              </label>
              <Input
                type="number"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                placeholder="e.g. 1800000"
                className="bg-white border-olive h-10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Basic Salary % of CTC
              </label>
              <Input
                type="number"
                value={basicPct}
                onChange={(e) => setBasicPct(e.target.value)}
                placeholder="50"
                className="bg-white border-olive h-10"
              />
            </div>
            <Button onClick={calculate} className="w-full h-11 bg-bronze hover:bg-bronze gap-2">
              <Calculator className="h-4 w-4" />
              Calculate Take-Home
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 border-olive">
        <CardContent className="p-6">
          {!result ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-3">
              <IndianRupee className="h-12 w-12 text-foreground/60" />
              <p className="text-muted-foreground text-sm">Enter your CTC to see the breakdown</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center pb-4 border-b border-border">
                <p className="text-xs text-foreground uppercase tracking-wider">Estimated Monthly Take-Home</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground mt-1">
                  ₹{result.takeHomeMonthly.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Annual: {formatINR(result.takeHomeAnnual)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Annual Breakdown</p>
                <div className="space-y-1.5">
                  <Row label="Annual CTC" value={result.annualCtc} />
                  <Row label="Basic Salary" value={result.basic} sub={`${result.basicPct}% of CTC`} />
                  <Row label="HRA" value={result.hra} sub="50% of basic" />
                  <Row label="Employee PF" value={result.employeePf} valueClass="text-rose-400" />
                  <Row label="Professional Tax" value={result.professionalTax} valueClass="text-rose-400" />
                  <Row label="Income Tax (New Regime)" value={result.incomeTax} valueClass="text-rose-400" />
                  <Row label="Employer PF + Gratuity" value={result.employerPf + result.gratuity} sub="Not in take-home" />
                  <div className="border-t border-border pt-1.5 mt-1.5">
                    <Row label="Total Deductions" value={result.totalDeductions} valueClass="text-rose-400" bold />
                  </div>
                  <Row label="Take-Home Annual" value={result.takeHomeAnnual} valueClass="text-foreground" bold />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, sub, valueClass, bold }: { label: string; value: number; sub?: string; valueClass?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div>
        <span className={`${bold ? "font-semibold" : ""} text-foreground`}>{label}</span>
        {sub && <span className="text-[10px] text-muted-foreground ml-1">({sub})</span>}
      </div>
      <span className={`font-medium ${valueClass || "text-foreground"}`}>
        ₹{value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}
