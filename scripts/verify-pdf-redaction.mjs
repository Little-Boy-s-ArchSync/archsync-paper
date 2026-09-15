import { extractPdfText } from "./pdf-text.mjs";
import { fileURLToPath } from "node:url";

const text = extractPdfText(fileURLToPath(new URL("../main-anonymous.pdf", import.meta.url)));

const forbidden = [
  "Vo Duc Hieu",
  "Tran Minh Hoang",
  "Ha Hoang Bach",
  "Le Van Kiet",
  "littleboys.biz",
  "FPT University",
  "VNUK Institute",
];
const findings = forbidden.filter((value) => text.includes(value));
if (findings.length > 0) {
  console.error(`PDF REDACTION FAIL: ${findings.join(", ")}`);
  process.exit(1);
}
console.log(`PDF REDACTION PASS (${forbidden.length} identifying markers absent)`);
