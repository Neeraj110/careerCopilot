// All @react-pdf/renderer code lives here.
// This file is loaded with dynamic(() => ..., { ssr: false }) so it NEVER
// runs on the server — no need for "use client".
import { useState } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeDocument } from "./resume-document";

// ─── Download button ──────────────────────────────────────────────────────────
// Uses pdf() + URL.createObjectURL instead of PDFDownloadLink to avoid the
// render-prop issue when the component is loaded via dynamic().

interface DownloadButtonProps {
  user: any;
  version: any;
  title: string;
  fileName: string;
}

export function PdfDownloadButton({ user, version, title, fileName }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const blob = await pdf(
        <ResumeDocument user={user} version={version} title={title} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || "PDF generation failed");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <Button variant="outline" size="md" onClick={handleDownload} className="text-danger">
        <AlertCircle size={14} /> Retry download
      </Button>
    );
  }

  return (
    <Button variant="accent" size="md" onClick={handleDownload} disabled={loading}>
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" /> Generating…
        </>
      ) : (
        <>
          <Download size={14} /> Download PDF
        </>
      )}
    </Button>
  );
}

// ─── Preview viewer ───────────────────────────────────────────────────────────

interface PreviewProps {
  user: any;
  version: any;
  title: string;
}

export function PdfPreview({ user, version, title }: PreviewProps) {
  return (
    <PDFViewer
      style={{
        width: "100%",
        height: "min(85vh, 1000px)",
        border: "none",
        borderRadius: 20,
      }}
      showToolbar={false}
    >
      <ResumeDocument user={user} version={version} title={title} />
    </PDFViewer>
  );
}
