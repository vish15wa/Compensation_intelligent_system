import type { Metadata } from "next";
import TakeHomeCalculator from "@/components/tools/TakeHomeCalculator";

export const metadata: Metadata = {
  title: "Take-Home Salary Calculator | PayLens",
  description: "Calculate your monthly in-hand salary from your annual CTC. Estimate PF, income tax, and other deductions.",
};

export default function TakeHomePage() {
  return (
    <div className="space-y-6 pb-16">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Take-Home Salary Calculator
        </h1>
        <p className="text-sm sm:text-base text-charcoal max-w-2xl">
          Understand your actual in-hand salary. Enter your CTC and see a detailed breakdown of deductions.
        </p>
      </div>
      <TakeHomeCalculator />
    </div>
  );
}
