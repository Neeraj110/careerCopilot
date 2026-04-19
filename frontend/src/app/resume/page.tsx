import { redirect } from "next/navigation";

// Resume index page redirects to upload
export default function ResumePage() {
  redirect("/resume/upload");
}
