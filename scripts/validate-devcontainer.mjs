import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

export const expectedPostCreateCommand =
  "node scripts/run-devcontainer-smoke.mjs";

export const expectedContainerImages = [
  "docker.io/library/node:22.16.0-bookworm-slim@sha256:048ed02c5fd52e86fda6fbd2f6a76cf0d4492fd6c6fee9e2c463ed5108da0e34",
  "ghcr.io/xu-cheng/texlive-historic-debian:2024@sha256:608a158f476de2fc7f49969298f194afe634ed0eae51d8fd1f8cc41cb94c7a12",
];

const expectedActionPins = new Map([
  ["actions/checkout", "3d3c42e5aac5ba805825da76410c181273ba90b1"],
  ["actions/setup-node", "249970729cb0ef3589644e2896645e5dc5ba9c38"],
  ["actions/upload-artifact", "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a"],
  ["xu-cheng/latex-action", "6549dc21effb2730855a1281407ecfcececc6c1b"],
]);

const expectedCliVersion = "0.88.0";

function parseJson(source, name) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${name} must be strict JSON: ${error.message}`);
  }
}

function dockerfileImages(dockerfile) {
  return [...dockerfile.matchAll(/^\s*FROM\s+(?:--platform=\S+\s+)?([^\s]+)(?:\s+AS\s+\S+)?\s*$/gim)].map(
    (match) => match[1],
  );
}

function workflowActions(workflow) {
  return [...workflow.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)].map(
    (match) => match[1],
  );
}

export function validateDevcontainerContract({
  devcontainerSource,
  dockerfileSource,
  workflowSource,
  packageSource,
  packageLockSource,
  devcontainerLockSource,
}) {
  const devcontainer = parseJson(devcontainerSource, "devcontainer.json");
  const packageManifest = parseJson(packageSource, "package.json");
  const packageLock = parseJson(packageLockSource, "package-lock.json");
  const devcontainerLock = parseJson(
    devcontainerLockSource,
    "devcontainer-lock.json",
  );

  assert.deepEqual(
    devcontainer.build,
    { dockerfile: "Dockerfile", context: ".." },
    "devcontainer must build the repository Dockerfile with repository context",
  );
  assert.equal(
    devcontainer.postCreateCommand,
    expectedPostCreateCommand,
    "postCreateCommand must run the governed smoke entry point",
  );
  assert.equal(devcontainer.remoteUser, "root");
  assert.equal(devcontainer.updateRemoteUserUID, false);
  assert.equal(
    Object.hasOwn(devcontainer, "features"),
    false,
    "remote Features are forbidden; install runtime tools from digest-pinned images",
  );
  assert.deepEqual(
    devcontainerLock,
    { features: {} },
    "the frozen Feature lock must remain explicitly empty",
  );

  const images = dockerfileImages(dockerfileSource);
  assert.deepEqual(
    images,
    expectedContainerImages,
    "every Docker stage must use the reviewed tag plus immutable manifest digest",
  );
  for (const image of images) {
    assert.match(
      image,
      /:[^/@\s]+@sha256:[0-9a-f]{64}$/,
      `tag-only or digest-only container reference is forbidden: ${image}`,
    );
  }
  assert.match(
    dockerfileSource,
    /test "\$\(node --version\)" = "v22\.16\.0"/,
    "the image build must verify the pinned Node runtime",
  );

  assert.equal(packageManifest.private, true);
  assert.deepEqual(packageManifest.devDependencies, {
    "@devcontainers/cli": expectedCliVersion,
  });
  assert.equal(packageLock.lockfileVersion, 3);
  assert.equal(
    packageLock.packages?.[""]?.devDependencies?.["@devcontainers/cli"],
    expectedCliVersion,
  );
  const lockedCli = packageLock.packages?.["node_modules/@devcontainers/cli"];
  assert.equal(lockedCli?.version, expectedCliVersion);
  assert.match(
    lockedCli?.resolved ?? "",
    /^https:\/\/registry\.npmjs\.org\/@devcontainers\/cli\/-\/cli-0\.88\.0\.tgz$/,
  );
  assert.match(
    lockedCli?.integrity ?? "",
    /^sha512-[A-Za-z0-9+/]+={0,2}$/,
    "the devcontainer CLI package must have an npm integrity digest",
  );

  const actions = workflowActions(workflowSource);
  assert.ok(actions.length >= 7, "workflow must include every expected action use");
  for (const action of actions) {
    const match = /^([^@]+)@([0-9a-f]{40})$/.exec(action);
    assert.ok(match, `GitHub Action must use a full commit SHA: ${action}`);
    const [, name, sha] = match;
    assert.equal(
      expectedActionPins.get(name),
      sha,
      `unexpected or unreviewed Action pin: ${action}`,
    );
  }
  for (const [name, sha] of expectedActionPins) {
    assert.ok(
      actions.includes(`${name}@${sha}`),
      `workflow is missing the reviewed ${name} pin`,
    );
  }

  assert.match(workflowSource, /^\s*devcontainer-smoke:\s*$/m);
  assert.match(
    workflowSource,
    /^\s*run: npm ci --ignore-scripts --no-audit --no-fund\s*$/m,
  );
  assert.match(
    workflowSource,
    /^\s*run: node scripts\/prepare-devcontainer-smoke\.mjs\s*$/m,
    "CI must clear stale evidence and issue a fresh challenge before startup",
  );
  assert.match(
    workflowSource,
    /^\s*run: \.\/node_modules\/\.bin\/devcontainer up --workspace-folder \. --remove-existing-container --frozen-lockfile\s*$/m,
    "CI must start the declared devcontainer with its lifecycle commands enabled",
  );
  assert.doesNotMatch(
    workflowSource,
    /--skip-post-create/,
    "CI must never bypass postCreateCommand",
  );
  assert.match(
    workflowSource,
    /^\s*run: \.\/node_modules\/\.bin\/devcontainer exec --workspace-folder \. node scripts\/verify-devcontainer-smoke\.mjs\s*$/m,
    "CI must verify fresh smoke evidence from inside the running container",
  );
  const installIndex = workflowSource.indexOf(
    "run: npm ci --ignore-scripts --no-audit --no-fund",
  );
  const prepareIndex = workflowSource.indexOf(
    "run: node scripts/prepare-devcontainer-smoke.mjs",
  );
  const upIndex = workflowSource.indexOf(
    "run: ./node_modules/.bin/devcontainer up --workspace-folder . --remove-existing-container --frozen-lockfile",
  );
  const verifyIndex = workflowSource.indexOf(
    "run: ./node_modules/.bin/devcontainer exec --workspace-folder . node scripts/verify-devcontainer-smoke.mjs",
  );
  assert.ok(
    installIndex < prepareIndex && prepareIndex < upIndex && upIndex < verifyIndex,
    "CI smoke steps must install, challenge, start, then verify in that order",
  );

  return {
    actionUses: actions.length,
    cliVersion: expectedCliVersion,
    imageStages: images.length,
    postCreateCommand: expectedPostCreateCommand,
  };
}

export async function validateDevcontainerContractFromDisk() {
  const [
    devcontainerSource,
    dockerfileSource,
    workflowSource,
    packageSource,
    packageLockSource,
    devcontainerLockSource,
  ] = await Promise.all([
    readFile(join(root, ".devcontainer/devcontainer.json"), "utf8"),
    readFile(join(root, ".devcontainer/Dockerfile"), "utf8"),
    readFile(join(root, ".github/workflows/build-paper.yml"), "utf8"),
    readFile(join(root, "package.json"), "utf8"),
    readFile(join(root, "package-lock.json"), "utf8"),
    readFile(join(root, ".devcontainer/devcontainer-lock.json"), "utf8"),
  ]);
  return validateDevcontainerContract({
    devcontainerSource,
    dockerfileSource,
    workflowSource,
    packageSource,
    packageLockSource,
    devcontainerLockSource,
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const summary = await validateDevcontainerContractFromDisk();
  console.log(
    `VALID DEVCONTAINER CONTRACT (${summary.imageStages} digest-pinned stages, ${summary.actionUses} action uses, CLI ${summary.cliVersion})`,
  );
}
