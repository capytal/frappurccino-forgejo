#!/usr/bin/env -S deno run -A

import path from "node:path";
import fs from "node:fs";
import url from "node:url";
import * as sass from "sass";
import * as ctp from "@catppuccin/palette";

/** @type (flavor: string, accent: string) => string */
const builder = (flavor, accent) => `
@import "@catppuccin/palette/scss/${flavor}";
$accent: $${accent};
$isDark: ${flavor !== "latte"};

$overlay2: #202020;
$overlay1: #191919;
$overlay0: #181818;
$surface2: #141414;
$surface1: #131313;
$surface0: #121212;
$base: #111111;
$mantle: #101010;
$crust: #000000;

@import "theme";
`;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const accents = [
  "rosewater",
  "flamingo",
  "pink",
  "mauve",
  "red",
  "maroon",
  "peach",
  "yellow",
  "green",
  "teal",
  "sky",
  "sapphire",
  "blue",
  "lavender",
];

if (!fs.existsSync(path.join(__dirname, "dist"))) {
  fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
}

const flavors = Object.keys(ctp.flavors);
for (const flavor of flavors) {
  for (const accent of accents) {
    const input = builder(flavor, accent);
    const result = sass.compileString(input, {
      loadPaths: [
        path.join(__dirname, "src"),
        path.join(__dirname, "node_modules"),
      ],
    });

    fs.writeFileSync(
      path.join(__dirname, "dist", `theme-frappurccino-${flavor}-${accent}.css`),
      result.css,
    );
  }
}

// TODO:
// refactor this part out to a common import, since ctp/ctp & ctp/userstyles
// are both using the same base function
/** @type ({readme: string, section: string, newContent: string}) => string */
const updateReadme = ({ readme, section, newContent }) => {
  const preamble =
    "<!-- the following section is auto-generated, do not edit -->";
  const startMarker = `<!-- AUTOGEN:${section.toUpperCase()} START -->`;
  const endMarker = `<!-- AUTOGEN:${section.toUpperCase()} END -->`;
  const wrapped = `${startMarker}\n${preamble}\n${newContent}\n${endMarker}`;

  if (!(readme.includes(startMarker) && readme.includes(endMarker))) {
    throw new Error("Markers not found in README.md");
  }

  const pre = readme.split(startMarker)[0];
  const end = readme.split(endMarker)[1];
  return pre + wrapped + end;
};

const readme = fs.readFileSync(path.join(__dirname, "README.md")).toString();
const newcontent = updateReadme({
  readme,
  section: "ini",
  newContent: `
\`\`\`
[ui]
THEMES = ${flavors
    .map((f) => accents.map((a) => `catppuccin-${f}-${a}`).join(","))
    .join(",")}
\`\`\`
`,
});

fs.writeFileSync(path.join(__dirname, "README.md"), newcontent);
