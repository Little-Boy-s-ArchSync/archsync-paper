import { verifyBibliographyStyleFromDisk } from "./verify-bibliography-style.mjs";
import { readFile } from "node:fs/promises";

const [main, anonymous] = await Promise.all([
  readFile(new URL("../main.tex", import.meta.url), "utf8"),
  readFile(new URL("../main-anonymous.tex", import.meta.url), "utf8"),
]);

const ieee = main.includes("\\documentclass[conference]{IEEEtran}");
const acm = main.includes("\\documentclass[sigconf,nonacm]{acmart}");
const authorOrder = ["Vo Duc Hieu", "Tran Minh Hoang", "Le Van Kiet", "Ha Hoang Bach", "Hoang Nguyen-The", "Minh Tam Phan"];
const namedBlock = main.split("\\IEEEauthorblockN{").at(-1)?.split("\\IEEEauthorblockA{")[0] ?? "";
let authorPosition = -1;
const namedAuthorsInOrder = authorOrder.every((name) => {
  const position = namedBlock.indexOf(name);
  if (position <= authorPosition) return false;
  authorPosition = position;
  return true;
});

const checks = [
  [ieee || acm, "supported IEEE conference or ACM working-draft class"],
  [main.includes(ieee ? "\\bibliographystyle{archsync-ieee}" : "\\bibliographystyle{ACM-Reference-Format}"), "bibliography style matches document class"],
  [anonymous.includes("\\input{main.tex}"), "anonymous wrapper input"],
  [namedAuthorsInOrder, "six named authors in the latest owner-supplied order"],
  [["voduchieu42@gmail.com", "andyjobs2023@gmail.com", "hahoangbach2005@gmail.com", "levankiet1212.2004@gmail.com", "hoangnt20@fe.edu.vn", "tampm@fe.edu.vn"].every((value) => main.includes(value)), "six email records"],
  [main.includes("Corresponding author: Vo Duc Hieu (voduchieu42@gmail.com)."), "supplied corresponding-author designation"],
  [["0009-0007-5389-5177", "0009-0000-0302-1841", "0009-0000-5118-0660", "0009-0007-8434-882X"].every((value) => main.includes(`ORCID: ${value}`)), "four supplied ORCID records"],
  [!main.includes("Anonymous Author"), "named source has no anonymous placeholder"],
  [!main.includes("Anonymous Institution"), "named source has no anonymous institution"],
];

for (const [ok, label] of checks) {
  console.log(`[${ok ? "PASS" : "FAIL"}] ${label}`);
}
if (checks.some(([ok]) => !ok)) process.exitCode = 1;
if (ieee) await verifyBibliographyStyleFromDisk();
