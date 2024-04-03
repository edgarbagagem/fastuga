const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    // The origin is the same as the Vue app domain. Change if necessary
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
httpServer.listen(8080, () => {
  console.log("listening on *:8080");
});
io.on("connection", (socket) => {
  //notificar chefs que alguma order item foi alterado
  socket.on("updatedOrderItem", (orderItem) => {
    socket.broadcast.emit("updatedOrderItem", orderItem);
  });

  //notificar employee delivery que alguma order foi alterada
  socket.on("updatedOrder", (order) => {
    socket.broadcast.emit("updatedOrder", order);
  });

  //user logs in
  socket.on("loggedIn", function (user) {
    socket.join(user.id);
    if (user.type == "EM") {
      socket.join("manager");
    }

    if (user.type == "EC") {
      socket.join("chef");
    }

    if (user.type == "ED") {
      socket.join("delivery");
    }
  });
  //user logs out
  socket.on("loggedOut", function (user) {
    socket.leave(user.id);
    socket.leave("manager");
  });

  //update user
  socket.on("updateUser", function (user) {
    socket.in("manager").except(user.id).emit("updateUser", user);
    socket.in(user.id).emit("updateUser", user);
  });

  //notificar chef que um novo hot dish foi pedido
  socket.on("newHotDish", (product) => {
    socket.in("chef").emit("newHotDish", product);
  });

  //notificar customer que a sua order foi cancelada
  socket.on("orderCanceled", (order) => {
    socket.broadcast.emit("orderCanceled", order);
  });

  //notificar delivery employee que hot dish esta pronto
  socket.on("hotDishReady", (order) => {
    socket.in("delivery").emit("hotDishReady", order);
  });

  //order ready for pickup
  socket.on("orderReady", (order) => {
    socket.broadcast.emit("orderReady", order);
  });

  socket.on("deleteUser", function (user) {
    socket.in("manager").emit("deleteUser", user);
  });

  socket.on("newUser", function (user) {
    socket.in("manager").emit("newUser", user);
  });

  socket.on("updateMenu", function () {
    socket.in("manager").emit("updateMenu");
  });

  socket.on("newOrder", function () {
    socket.in("manager").emit("newOrder");
  });
});
