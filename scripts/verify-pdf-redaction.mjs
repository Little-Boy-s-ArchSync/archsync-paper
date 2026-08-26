import { spawnSync } from "node:child_process";

const result = spawnSync("pdftotext", ["main-anonymous.pdf", "-"], {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
  shell: false,
});
if (result.status !== 0) {
  process.stderr.write(result.stderr ?? "pdftotext failed\n");
  process.exit(1);
}

const forbidden = [
  "Vo Duc Hieu",
  "Tran Minh Hoang",
  "Ha Hoang Bach",
  "Le Van Kiet",
  "littleboys.biz",
  "FPT University",
  "VNUK Institute",
];
const findings = forbidden.filter((value) => result.stdout.includes(value));
if (findings.length > 0) {
  console.error(`PDF REDACTION FAIL: ${findings.join(", ")}`);
  process.exit(1);
}
console.log(`PDF REDACTION PASS (${forbidden.length} identifying markers absent)`);
