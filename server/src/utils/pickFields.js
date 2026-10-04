// Copies only the allowed keys from the request body. This stops a client from
// sneaking in fields it must never control, such as owner, buyer or agent.
function pickFields(source = {}, allowedKeys) {
  const result = {};

  for (const key of allowedKeys) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }

  return result;
}

module.exports = pickFields;
