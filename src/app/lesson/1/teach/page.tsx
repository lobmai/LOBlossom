import { redirect } from "next/navigation";

export default function LegacyTeachPage() {
  redirect("/lesson/1/summarize");
}
