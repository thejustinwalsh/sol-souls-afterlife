/** @noSelfInFile **/

/** @noResolution */
declare module 'lib.rxi-json' {
  export function encode(value: unknown): string;
  export function decode(value: string): unknown;
}