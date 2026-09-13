require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const { connectDB } = require("./src/config/db");
const { initSocket } = require("./src/config/socket");
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

async function startServer() {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    }
    catch (err) {
        console.error("Server Initialization Failed");
        console.error(err);
        process.exit(1);

    }

}
startServer();