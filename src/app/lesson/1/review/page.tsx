import { redirect } from "next/navigation";

export default function LegacyReviewPage() {
  redirect("/lesson/1/evaluate");
}
