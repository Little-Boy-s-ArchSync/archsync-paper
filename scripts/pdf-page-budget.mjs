const DEFAULT_PAGE_BUDGET = Object.freeze({
  mainPageLimit: 10,
  referencePageLimit: 2,
});

export function splitExtractedPdfPages(rawText) {
  if (typeof rawText !== "string" || rawText.length === 0) {
    throw new TypeError("PDF text must be a non-empty string");
  }

  const pages = rawText.replaceAll("\r\n", "\n").split("\f");
  if (pages.at(-1)?.trim() === "") {
    pages.pop();
  }
  if (pages.length === 0 || pages.every((page) => page.trim() === "")) {
    throw new Error("PDF text contains no non-empty pages");
  }
  return pages;
}

function normalizedHeading(line) {
  return line.replace(/\s+/gu, "").toUpperCase();
}

export function analyzePdfPageBudget(
  rawText,
  { mainPageLimit, referencePageLimit } = DEFAULT_PAGE_BUDGET,
) {
  if (!Number.isInteger(mainPageLimit) || mainPageLimit <= 0) {
    throw new TypeError("mainPageLimit must be a positive integer");
  }
  if (!Number.isInteger(referencePageLimit) || referencePageLimit <= 0) {
    throw new TypeError("referencePageLimit must be a positive integer");
  }

  const pages = splitExtractedPdfPages(rawText);
  let referencePageIndex = -1;
  let referenceLineIndex = -1;

  for (const [pageIndex, page] of pages.entries()) {
    const lines = page.split("\n");
    const lineIndex = lines.findIndex(
      (line) => normalizedHeading(line) === "REFERENCES",
    );
    if (lineIndex >= 0) {
      referencePageIndex = pageIndex;
      referenceLineIndex = lineIndex;
      break;
    }
  }

  if (referencePageIndex < 0) {
    throw new Error("PDF is missing a standalone References heading");
  }

  const referencePageLines = pages[referencePageIndex].split("\n");
  const contentBeforeReferences = referencePageLines
    .slice(0, referenceLineIndex)
    .join("\n")
    .trim();
  const mainPageCount =
    referencePageIndex + (contentBeforeReferences.length > 0 ? 1 : 0);
  const referencePageCount = pages.length - referencePageIndex;

  return {
    totalPageCount: pages.length,
    referencesStartPage: referencePageIndex + 1,
    contentBeforeReferencesOnStartPage: contentBeforeReferences.length > 0,
    mainPageCount,
    mainPageLimit,
    referencePageCount,
    referencePageLimit,
    valid:
      mainPageCount <= mainPageLimit &&
      referencePageCount <= referencePageLimit,
  };
}

export function assertPdfPageBudget(rawText, budget = DEFAULT_PAGE_BUDGET) {
  const result = analyzePdfPageBudget(rawText, budget);
  if (result.mainPageCount > result.mainPageLimit) {
    throw new Error(
      `PDF main text uses ${result.mainPageCount} pages; limit is ${result.mainPageLimit}`,
    );
  }
  if (result.referencePageCount > result.referencePageLimit) {
    throw new Error(
      `PDF references use ${result.referencePageCount} pages; limit is ${result.referencePageLimit}`,
    );
  }
  return result;
}

export { DEFAULT_PAGE_BUDGET };
