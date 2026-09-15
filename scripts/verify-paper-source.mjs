import { verifyBibliographyStyleFromDisk } from "./verify-bibliography-style.mjs";
import { readFile } from "node:fs/promises";

const [main, anonymous] = await Promise.all([
  readFile(new URL("../main.tex", import.meta.url), "utf8"),
  readFile(new URL("../main-anonymous.tex", import.meta.url), "utf8"),
]);

const ieee = main.includes("\\documentclass[conference]{IEEEtran}");
const acm = main.includes("\\documentclass[sigconf,nonacm]{acmart}");

const checks = [
  [ieee || acm, "supported IEEE conference or ACM working-draft class"],
  [main.includes(ieee ? "\\bibliographystyle{archsync-ieee}" : "\\bibliographystyle{ACM-Reference-Format}"), "bibliography style matches document class"],
  [anonymous.includes("\\input{main.tex}"), "anonymous wrapper input"],
  [["Vo Duc Hieu", "Tran Minh Hoang", "Ha Hoang Bach", "Le Van Kiet", "Hoang Nguyen The", "Minh Tam Phan"].every((value) => main.includes(value)), "six named authors"],
  [["voduchieu@littleboys.biz", "an1dee@littleboys.biz", "bachcp6@littleboys.biz", "levankiet1212.2004@littleboys.biz", "hoangnt20@fe.edu.vn", "tampm@fe.edu.vn"].every((value) => main.includes(value)), "six email records"],
  [main.includes("Corresponding author: Vo Duc Hieu (voduchieu@littleboys.biz)."), "supplied corresponding-author designation"],
  [!main.includes("Anonymous Author"), "named source has no anonymous placeholder"],
  [!main.includes("Anonymous Institution"), "named source has no anonymous institution"],
];

for (const [ok, label] of checks) {
  console.log(`[${ok ? "PASS" : "FAIL"}] ${label}`);
}
if (checks.some(([ok]) => !ok)) process.exitCode = 1;
if (ieee) await verifyBibliographyStyleFromDisk();
