import { redirect } from "next/navigation";

export default function LegacyTrajectoryPage() {
  redirect("/lesson/1/summarize");
}
