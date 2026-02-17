const { Server } = require('socket.io');
const http = require('http');

function startWebSocketServer(port) {
    const server = http.createServer();
    const io = new Server(server, {
        cors: {
            origin: "*", // Allow all terminals in the local network
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('📱 New terminal connected:', socket.id);

        // Join organization-specific room
        socket.on('join-org', (orgId) => {
            socket.join(orgId);
            console.log(`Terminal ${socket.id} joined org: ${orgId}`);
        });

        // Broadcast changes to other terminals in the same organization
        socket.on('entity-updated', (data) => {
            const { orgId, table, localId, action } = data;
            console.log(`Entity ${action} in ${table}: ${localId}`);

            // Emit to all except sender in the same org
            socket.to(orgId).emit('sync-remote-change', {
                table,
                localId,
                action,
                timestamp: Date.now()
            });
        });

        socket.on('disconnect', () => {
            console.log('Terminal disconnected:', socket.id);
        });
    });

    server.listen(port, () => {
        console.log(`🔌 WebSocket server listening on port ${port}`);
    });

    return io;
}

module.exports = { startWebSocketServer };
