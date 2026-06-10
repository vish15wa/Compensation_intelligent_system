import type { Metadata } from "next";
import ReviewsPage from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Company Reviews | PayLens",
  description: "Read and write anonymous company reviews. See what employees really think.",
};

export default function ReviewsRoute() {
  return <ReviewsPage />;
}
