setImmediate((arg) => {
  console.log(`setImmediate`);
});
setTimeout((arg) => {
  console.log(`setTimeout`);
}, 0);
