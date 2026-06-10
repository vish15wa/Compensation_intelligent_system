import type { Metadata } from "next";
import OfferAnalyzer from "@/components/tools/OfferAnalyzer";

export const metadata: Metadata = {
  title: "Offer Letter Analysis | PayLens",
  description: "Analyze job offers against market data. See how your offer compares by company, role, and level.",
};

export default function OfferAnalysisPage() {
  return (
    <div className="space-y-6 pb-16">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Offer Letter Analysis
        </h1>
        <p className="text-sm sm:text-base text-charcoal max-w-2xl">
          Paste your offer details and see how it compares against real market data — percentile, market average, and a score.
        </p>
      </div>
      <OfferAnalyzer />
    </div>
  );
}
