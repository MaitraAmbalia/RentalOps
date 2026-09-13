const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/tokens");

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"].filter(Boolean),
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      return next();
    } catch (err) {
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.user?.id) {
      const userId = socket.user.id;
      socket.join(`user_${userId}`);

      if (socket.user.type === "VENDOR") {
        socket.join(`vendor_${userId}`);
      } else if (socket.user.vendorId) {
        socket.join(`vendor_${socket.user.vendorId}`);
      }
    }

    socket.on("subscribe", (room) => {
      if (room && typeof room === "string") {
        socket.join(room);
      }
    });

    socket.on("unsubscribe", (room) => {
      if (room && typeof room === "string") {
        socket.leave(room);
      }
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToVendor = (vendorId, event, data) => {
  if (io && vendorId) {
    io.to(`vendor_${vendorId}`).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToVendor,
  emitToAll,
};
