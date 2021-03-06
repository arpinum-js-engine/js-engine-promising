"use strict";

const { compose } = require("../build");

const count = 100000;

const funcs = createFunctions();

const start = new Date();
compose(funcs)(0).then(printStatistics);
// 100000 functions handled in 267 ms

function createFunctions() {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push((number) => Promise.resolve(number + 1));
  }
  return result;
}

function printStatistics() {
  const end = new Date();
  const duration = end - start;
  console.log(`${count} functions handled in ${duration} ms`);
}
