import type { Server as IOServer } from "socket.io";

declare global {
  var sheeaseIO: IOServer | undefined;
}

export function setIO(io: IOServer) {
  global.sheeaseIO = io;
}

export function getIO() {
  return global.sheeaseIO;
}

export function emitBookingUpdate(bookingId: string, payload: unknown) {
  const io = getIO();
  if (!io) return;
  io.to(`booking:${bookingId}`).emit("booking:update", payload);
  io.emit("booking:update", payload);
}
