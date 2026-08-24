import { readFile } from "node:fs/promises";

const lock = JSON.parse(await readFile(new URL("../sources/t3code.lock.json", import.meta.url), "utf8"));

if (!/^[0-9a-f]{40}$/.test(lock.commit)) {
  throw new Error("The source lock does not contain a valid immutable commit");
}

process.stdout.write(`commit=${lock.commit}\n`);
