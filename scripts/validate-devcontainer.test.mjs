import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateDevcontainerContract } from "./validate-devcontainer.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixture = Object.fromEntries(
  await Promise.all(
    Object.entries({
      devcontainerSource: ".devcontainer/devcontainer.json",
      dockerfileSource: ".devcontainer/Dockerfile",
      workflowSource: ".github/workflows/build-paper.yml",
      packageSource: "package.json",
      packageLockSource: "package-lock.json",
      devcontainerLockSource: ".devcontainer/devcontainer-lock.json",
    }).map(async ([key, path]) => [key, await readFile(join(root, path), "utf8")]),
  ),
);

test("accepts the repository's pinned devcontainer contract", () => {
  const summary = validateDevcontainerContract(fixture);
  assert.equal(summary.cliVersion, "0.88.0");
  assert.equal(summary.imageStages, 2);
});

test("rejects a tag-only container stage", () => {
  assert.throws(
    () =>
      validateDevcontainerContract({
        ...fixture,
        dockerfileSource: fixture.dockerfileSource.replace(
          /@sha256:048ed02c5fd52e86fda6fbd2f6a76cf0d4492fd6c6fee9e2c463ed5108da0e34/,
          "",
        ),
      }),
    /immutable manifest digest/,
  );
});

test("rejects a changed postCreate command", () => {
  assert.throws(
    () =>
      validateDevcontainerContract({
        ...fixture,
        devcontainerSource: fixture.devcontainerSource.replace(
          "node scripts/run-devcontainer-smoke.mjs",
          "true",
        ),
      }),
    /postCreateCommand/,
  );
});

test("rejects a tag-pinned GitHub Action", () => {
  assert.throws(
    () =>
      validateDevcontainerContract({
        ...fixture,
        workflowSource: fixture.workflowSource.replace(
          "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
          "actions/checkout@v7",
        ),
      }),
    /full commit SHA/,
  );
});

test("rejects CI that skips postCreate", () => {
  assert.throws(
    () =>
      validateDevcontainerContract({
        ...fixture,
        workflowSource: fixture.workflowSource.replace(
          "--frozen-lockfile",
          "--frozen-lockfile --skip-post-create",
        ),
      }),
    /lifecycle commands enabled|bypass postCreateCommand/,
  );
});

test("rejects an unpinned devcontainer CLI", () => {
  assert.throws(
    () =>
      validateDevcontainerContract({
        ...fixture,
        packageSource: fixture.packageSource.replace('"0.88.0"', '"^0.88.0"'),
      }),
    /deep-equal|Expected values/,
  );
});

test("rejects a missing current-run challenge", () => {
  assert.throws(
    () =>
      validateDevcontainerContract({
        ...fixture,
        workflowSource: fixture.workflowSource.replace(
          "run: node scripts/prepare-devcontainer-smoke.mjs",
          "run: true",
        ),
      }),
    /fresh challenge/,
  );
});
