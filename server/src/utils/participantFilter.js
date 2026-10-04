// Inquiries and appointments belong to two people: the buyer who created them
// and the agent who owns the property. This filter matches records where the
// logged-in user is either one, so nobody else can ever see them.
function participantFilter(user) {
  return { $or: [{ buyer: user._id }, { agent: user._id }] };
}

module.exports = participantFilter;
