import { keccak256 } from "js-sha3";

export const sortCharacters = (data) =>
  JSON.stringify(data).split("").sort().join("");

export const keccakHash = (data) => {
  const hash = keccak256.create();
  hash.update(sortCharacters(data));
  return hash.hex();
};
