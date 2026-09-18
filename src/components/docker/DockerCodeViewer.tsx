"use client";

import { Check, Clipboard, Download } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type DockerCodeViewerProps = {
  code: string;
  filename?: string;
  className?: string;
};

function getLanguage(filename: string) {
  return filename.toLowerCase().endsWith("dockerfile") ? "docker" : "yaml";
}

export function DockerCodeViewer({
  code,
  filename = "docker-compose.yml",
  className = "",
}: DockerCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadCode() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={`overflow-hidden rounded-2xl border border-white/10 bg-[#101318] shadow-panel ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="rounded-md border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 font-mono text-xs text-sky-200">
          {filename}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copiato!" : "Copia codice"}
          </button>
          <button
            type="button"
            onClick={downloadCode}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-400/15 px-3 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-400/25"
          >
            <Download className="h-3.5 w-3.5" />
            Scarica .yml
          </button>
        </div>
      </div>
      <div className="max-h-[min(70vh,680px)] overflow-auto text-sm">
        <SyntaxHighlighter
          language={getLanguage(filename)}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: "1.25rem", background: "transparent", minWidth: "max-content" }}
          wrapLongLines={false}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </section>
  );
}
