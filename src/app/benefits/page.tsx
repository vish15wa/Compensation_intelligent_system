import type { Metadata } from "next";
import BenefitsClient from "./benefits-client";

export const metadata: Metadata = {
  title: "Benefits Comparison | PayLens",
  description: "Compare company benefits across top tech companies in India.",
};

export default function BenefitsPage() {
  return <BenefitsClient />;
}
