function emitUserEvent(channel, event, payload) {
  const io = global.io;
  if (io) {
    io.to(String(channel)).emit(event, payload);
  }
}

function emitToAdmins(event, payload) {
  const io = global.io;
  if (io) io.to('admins').emit(event, payload);
}

module.exports = { emitUserEvent, emitToAdmins };