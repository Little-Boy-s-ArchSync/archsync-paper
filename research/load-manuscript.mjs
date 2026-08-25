import { readFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";

function isInside(parent, target) {
  const path = relative(resolve(parent), resolve(target));
  return path === "" || (!path.startsWith(`..${sep}`) && !isAbsolute(path));
}

export async function loadExpandedManuscript(
  repositoryDirectory,
  { readText = (path) => readFile(path, "utf8") } = {},
) {
  const repositoryRoot = resolve(repositoryDirectory);
  const rootPath = join(repositoryRoot, "main.tex");

  async function expand(path, stack = []) {
    const absolutePath = resolve(path);
    if (!isInside(repositoryRoot, absolutePath)) {
      throw new Error(`manuscript input escapes repository: ${absolutePath}`);
    }
    if (stack.includes(absolutePath)) {
      throw new Error(
        `cyclic manuscript input: ${[...stack, absolutePath]
          .map((entry) => relative(repositoryRoot, entry))
          .join(" -> ")}`,
      );
    }

    const source = await readText(absolutePath);
    const matches = [...source.matchAll(/\\input\{([^}]+)\}/g)];
    if (matches.length === 0) return source;

    let expanded = "";
    let cursor = 0;
    for (const match of matches) {
      expanded += source.slice(cursor, match.index);
      const input = extname(match[1]) ? match[1] : `${match[1]}.tex`;
      const inputPath = resolve(dirname(absolutePath), input);
      expanded += await expand(inputPath, [...stack, absolutePath]);
      cursor = match.index + match[0].length;
    }
    return expanded + source.slice(cursor);
  }

  return expand(rootPath);
}
