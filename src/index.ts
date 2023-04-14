import parse from "parse-svg-path";

/**
 * Takes a list of SVG path strings and returns an object
 * that can be used to easily morph between them.
 *
 * To be used in combination with `morph()`, e.g.:
 * ```typescript
 * const paths = compile(['M0,0 L100,100', 'M5,5 L250,50'])
 *
 * // Get the path halfway between the two paths
 * const between = morph(paths, [0.5, 0.5])
 * document.getElementById('myPath').setAttribute('d', between)
 * ```
 *
 * @param paths SVG path strings. Each string must be
 * a variation of the same path, i.e. same number of commands in the same order.
 * The command parameters may vary as needed.
 * @returns A object containing:
 * 1. `commands`: An array of path commands,
 * 2. `average`: An array of command parameters as averaged between all passed paths, and
 * 3. `diffs`: An array of command parameters as relative to the average for each path provided in `paths`
 */
export const compile = (paths: string[]) => {
  const nPaths = paths.length;
  if (nPaths === 0) throw new Error("compile() must receive at least one path.");

  const parsedPaths = paths.map(parse) as (string | number)[][][]; // [Path] -> [Command] -> [Type, param1, param2, ...]
  const commands = parsedPaths[0].map(([type]) => type as string); // Array of command types, e.g. ['M', 'L', 'C', ...]

  if (parsedPaths.some(path => path.length !== commands.length)) throw new Error("All paths must have the same number of commands.");

  for (let i = 0; i < commands.length; i++) {
      if (parsedPaths.some(path => path[i][0] !== commands[i])) throw new Error("All paths must be variations of the same sequence of commands.");
  }

  const average: number[][] = Array.from({ length: commands.length }, () => []); // The average of all parameters for each command
  const diffs: number[][][] = Array.from({ length: commands.length }, () => []); // The difference between each path and the average for each command

  // Build an average path
  for (let c = 0; c < commands.length; c++) {
    const nValues = parsedPaths[0][c].length - 1;
    average[c] = Array.from({ length: nValues }, () => 0);
    diffs[c] = Array.from({ length: nValues }, () => []);

    for (let v = 0; v < nValues; v++) {
      let sum = 0, p = 0;
      while (p < nPaths) {
        const param = parsedPaths[p][c][v + 1] as number;
        sum += param;
        p++;
      }
      average[c][v] = sum / nPaths;

      // Adjust each path's command parameters to be relative to the average
      p = 0;
      while (p < nPaths) {
        const param = parsedPaths[p][c][v + 1] as number;
        diffs[c][v][p] = param - average[c][v];
        p++;
      }
    }
  }

  return {
    commands,
    average,
    diffs,
  };
};

/**
 * Takes a compiled paths object (see `compile()`) and a list of weights
 * and returns a morphed path as a weighted combination of the paths.
 *
 * ```typescript
 * // Provided two variations of the same path
 * const angryFace = 'M0,0 L100,100...'
 * const happyFace = 'M0,0 L100,100...'
 *
 * const paths = compile([angryFace, happyFace])
 *
 * // Get the path halfway between the two paths, i.e. 50% angry, 50% happy
 * const neutralFace = morph(paths, [0.5, 0.5])
 * ```
 * @param compiled The compiled paths object (see `compile()`)
 * @param weights An array of weights, one for each path in the compiled object.
 * @returns The weighted combination of the compiled paths as an SVG path string.
 */
export const morph = (compiled: ReturnType<typeof compile>, weights: number[]) => {
  const nPaths = compiled.diffs[0][0].length;
  const morphed = compiled.average.map((command) => command.slice());

  if (weights.length !== nPaths) throw new Error("Weights must have the same length as the number of paths.");

  let morphedPath = "";
  for (let c = 0; c < compiled.commands.length; c++) {
    morphedPath += compiled.commands[c];
    for (let v = 0; v < compiled.average[c].length; v++) {
      const weightedSum = compiled.diffs[c][v].reduce((sum, diff, p) => sum + diff * weights[p], 0);
      morphed[c][v] += weightedSum;
      morphedPath += morphed[c][v] + " ";
    }
  }

  return morphedPath.trimEnd();
};
