#!/usr/bin/env bun
/**
 * Citation Extractor - Deterministic citation extraction via regex
 *
 * Input: List of markdown file paths as arguments
 * Output: JSON to stdout with normalized citations
 *
 * Usage: bun run citation-extractor.ts <file1.md> [file2.md] ...
 */

interface Citation {
  id: number;
  authors: string;
  title?: string;
  year?: string;
  venue?: string;
  url?: string;
  sourceFiles: string[]; // Which input files referenced this
  rawText: string; // Original citation text
}

interface ExtractionResult {
  citations: Citation[];
  totalFound: number;
  bySourceFile: Record<string, number>;
}

// Regex patterns for different citation formats
const PATTERNS = {
  // "Author et al. (Year)" or "Author & Author (Year)"
  academicInline:
    /([A-Z][a-z]+(?:\s+(?:et\s+al\.|&|and)\s+[A-Z][a-z]+)?)\s*\((\d{4})\)/g,

  // "Author et al. (Venue Year)" like "Truong et al. (EMNLP 2025)"
  academicWithVenue:
    /([A-Z][a-z]+(?:\s+(?:et\s+al\.|&|and)\s+[A-Z][a-z]+)?)\s*\(([A-Z]+\s+\d{4})\)/g,

  // Numbered Works Cited: "1. Title - Source, accessed DATE, [URL](url)"
  numberedWithUrl:
    /^\d+\.\s+(.+?)\s*[-–]\s*(.+?),\s*accessed.+?\[([^\]]+)\]\(([^)]+)\)/gm,

  // Markdown links that look like citations: [Title](url)
  markdownLinks: /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,

  // Superscript-style references: text.4 or text[4]
  superscriptRefs: /[\.\s]\[?(\d{1,2})\]?(?=\s|$|\.)/g,
};

async function extractFromFile(filePath: string): Promise<Map<string, Partial<Citation>>> {
  const content = await Bun.file(filePath).text();
  const citations = new Map<string, Partial<Citation>>();
  const fileName = filePath.split("/").pop() || filePath;

  // Extract academic inline citations
  let match: RegExpExecArray | null;
  while ((match = PATTERNS.academicInline.exec(content)) !== null) {
    const key = `${match[1]}-${match[2]}`.toLowerCase();
    if (!citations.has(key)) {
      citations.set(key, {
        authors: match[1],
        year: match[2],
        rawText: match[0],
        sourceFiles: [fileName],
      });
    } else {
      const existing = citations.get(key)!;
      if (!existing.sourceFiles!.includes(fileName)) {
        existing.sourceFiles!.push(fileName);
      }
    }
  }

  // Reset regex lastIndex for reuse
  PATTERNS.academicInline.lastIndex = 0;

  // Extract academic with venue
  while ((match = PATTERNS.academicWithVenue.exec(content)) !== null) {
    const venueParts = match[2].split(" ");
    const venue = venueParts[0];
    const year = venueParts[1];
    const key = `${match[1]}-${year}`.toLowerCase();

    if (!citations.has(key)) {
      citations.set(key, {
        authors: match[1],
        year: year,
        venue: venue,
        rawText: match[0],
        sourceFiles: [fileName],
      });
    } else {
      const existing = citations.get(key)!;
      if (!existing.venue) existing.venue = venue;
      if (!existing.sourceFiles!.includes(fileName)) {
        existing.sourceFiles!.push(fileName);
      }
    }
  }

  // Reset regex lastIndex for reuse
  PATTERNS.academicWithVenue.lastIndex = 0;

  // Extract numbered citations with URLs (Works Cited sections)
  while ((match = PATTERNS.numberedWithUrl.exec(content)) !== null) {
    const url = match[4];
    const key = url.toLowerCase();

    if (!citations.has(key)) {
      citations.set(key, {
        title: match[1].trim(),
        venue: match[2].trim(),
        url: url,
        rawText: match[0],
        sourceFiles: [fileName],
      });
    } else {
      if (!citations.get(key)!.sourceFiles!.includes(fileName)) {
        citations.get(key)!.sourceFiles!.push(fileName);
      }
    }
  }

  // Reset regex lastIndex for reuse
  PATTERNS.numberedWithUrl.lastIndex = 0;

  // Extract standalone markdown links (potential citations)
  while ((match = PATTERNS.markdownLinks.exec(content)) !== null) {
    const url = match[2];
    // Skip if already captured or if it's a generic link
    if (citations.has(url.toLowerCase())) continue;
    if (url.includes("github.com") && !url.includes("/paper")) continue;

    citations.set(url.toLowerCase(), {
      title: match[1].trim(),
      url: url,
      rawText: match[0],
      sourceFiles: [fileName],
    });
  }

  // Reset regex lastIndex for reuse
  PATTERNS.markdownLinks.lastIndex = 0;

  return citations;
}

function deduplicateCitations(
  allCitations: Map<string, Partial<Citation>>[]
): Citation[] {
  const merged = new Map<string, Partial<Citation>>();

  for (const fileCitations of allCitations) {
    for (const [key, citation] of fileCitations) {
      if (merged.has(key)) {
        // Merge source files
        const existing = merged.get(key)!;
        for (const src of citation.sourceFiles || []) {
          if (!existing.sourceFiles!.includes(src)) {
            existing.sourceFiles!.push(src);
          }
        }
        // Fill in missing fields
        if (!existing.title && citation.title) existing.title = citation.title;
        if (!existing.url && citation.url) existing.url = citation.url;
        if (!existing.venue && citation.venue) existing.venue = citation.venue;
      } else {
        merged.set(key, { ...citation });
      }
    }
  }

  // Convert to array with IDs
  return Array.from(merged.values()).map((c, i) => ({
    id: i + 1,
    authors: c.authors || "",
    title: c.title,
    year: c.year,
    venue: c.venue,
    url: c.url,
    sourceFiles: c.sourceFiles || [],
    rawText: c.rawText || "",
  }));
}

async function main() {
  const files = Bun.argv.slice(2);

  if (files.length === 0) {
    console.error("Usage: citation-extractor.ts <file1.md> [file2.md] ...");
    Bun.exit(1);
  }

  const allCitations: Map<string, Partial<Citation>>[] = [];
  const bySourceFile: Record<string, number> = {};

  for (const file of files) {
    try {
      const citations = await extractFromFile(file);
      allCitations.push(citations);
      bySourceFile[file.split("/").pop() || file] = citations.size;
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  const deduplicated = deduplicateCitations(allCitations);

  const result: ExtractionResult = {
    citations: deduplicated,
    totalFound: deduplicated.length,
    bySourceFile,
  };

  // Output JSON to stdout
  console.log(JSON.stringify(result, null, 2));
}

main();
