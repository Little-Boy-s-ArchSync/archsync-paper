import { readFile } from "node:fs/promises";

const [main, anonymous] = await Promise.all([
  readFile(new URL("../main.tex", import.meta.url), "utf8"),
  readFile(new URL("../main-anonymous.tex", import.meta.url), "utf8"),
]);

const checks = [
  [main.includes("\\documentclass[sigconf,nonacm]{acmart}"), "main.tex ACM class"],
  [anonymous.includes("\\PassOptionsToClass{anonymous}{acmart}"), "anonymous option"],
  [anonymous.includes("\\input{main.tex}"), "anonymous wrapper input"],
  [(main.match(/^\\author\{/gm) ?? []).length === 4, "four author records"],
  [(main.match(/^\\email\{/gm) ?? []).length === 4, "four email records"],
  [!main.includes("Anonymous Author"), "named source has no anonymous placeholder"],
  [!main.includes("Anonymous Institution"), "named source has no anonymous institution"],
];

for (const [ok, label] of checks) {
  console.log(`[${ok ? "PASS" : "FAIL"}] ${label}`);
}
if (checks.some(([ok]) => !ok)) process.exitCode = 1;
