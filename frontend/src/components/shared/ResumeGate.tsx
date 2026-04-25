"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { getResumeStatus } from "@/lib/api";
import dynamic from "next/dynamic";

const ResumeUploadModal = dynamic(() => import("./ResumeUploadModal"), {
  ssr: false,
});

/**
 * After auth hydration, checks if the user has uploaded a resume.
 * If not, renders the ResumeUploadModal prompt.
 */
export default function ResumeGate() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isLoading || checked) return;

    getResumeStatus()
      .then((status) => {
        if (!status.hasResume) setShowModal(true);
      })
      .catch(() => {
        /* silently skip — don't block the app */
      })
      .finally(() => setChecked(true));
  }, [isAuthenticated, isLoading, checked]);

  if (!showModal) return null;

  return <ResumeUploadModal onClose={() => setShowModal(false)} />;
}
