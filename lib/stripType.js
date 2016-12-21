module.exports = function stripType(type) {
  return type.replace(/[^a-z]/g, '')
}
