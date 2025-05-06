const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const admin = require('firebase-admin');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Firebase Admin initialization
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware to verify Firebase token
async function verifyToken(req, res, next) {
  const idToken = req.headers.authorization;
  
  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// API endpoint to verify user authentication (used by client.js)
app.post('/api/verify-token', verifyToken, (req, res) => {
  res.json({ 
    authenticated: true, 
    uid: req.user.uid,
    email: req.user.email,
    displayName: req.user.name || req.user.email 
  });
});

// Store room information
const rooms = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // User joining a room
  socket.on('joinRoom', async (data) => {
    try {
      const { roomId, token, displayName } = data;
      
      if (!token) {
        socket.emit('joinRoomError', { message: 'Authentication required' });
        return;
      }
      
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (error) {
        console.error('Token verification failed:', error);
        socket.emit('joinRoomError', { message: 'Invalid authentication' });
        return;
      }
      
      const userId = decodedToken.uid;
      
      if (!rooms[roomId]) {
        rooms[roomId] = {
          users: {},
          canvasData: null,
          createdBy: userId,
          createdAt: new Date().toISOString()
        };
        
        try {
          await admin.firestore().collection('rooms').doc(roomId).set({
            roomId: roomId,
            createdBy: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            active: true
          });
        } catch (firestoreError) {
          console.error('Firestore error during room creation:', firestoreError);
        }
      }
      
      socket.join(roomId);
      
      rooms[roomId].users[socket.id] = {
        id: socket.id,
        userId: userId,
        displayName: displayName || decodedToken.email,
        joinedAt: new Date().toISOString()
      };
      
      socket.emit('roomJoined', {
        roomId,
        users: Object.values(rooms[roomId].users),
        canvasData: rooms[roomId].canvasData
      });
      
      socket.to(roomId).emit('userJoined', rooms[roomId].users[socket.id]);
      
      socket.currentRoom = roomId;
      
      console.log(`User ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error('Error in joinRoom:', error);
      socket.emit('joinRoomError', { message: 'Server error' });
    }
  });
  
  // Drawing event
  socket.on('draw', (data) => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit('draw', data);
    }
  });
  
  // Clear canvas event
  socket.on('clearCanvas', () => {
    if (socket.currentRoom) {
      if (rooms[socket.currentRoom]) {
        rooms[socket.currentRoom].canvasData = null;
      }
      socket.to(socket.currentRoom).emit('clearCanvas');
    }
  });
  
  // Save canvas event
  socket.on('saveCanvas', async ({ roomId, canvasData }) => {
    try {
      if (socket.currentRoom && socket.currentRoom === roomId) {
        if (rooms[roomId]) {
          rooms[roomId].canvasData = canvasData;
        }
        
        const canvasDataSize = Buffer.byteLength(canvasData, 'utf8');
        console.log(`Canvas data size for room ${roomId}: ${canvasDataSize} bytes`);

        const saveTimestamp = admin.firestore.FieldValue.serverTimestamp();
        await admin.firestore()
          .collection('rooms')
          .doc(roomId)
          .collection('savedCanvases')
          .add({
            canvasData: canvasData,
            savedAt: saveTimestamp
          });
        
        console.log(`Canvas data saved for room ${roomId} at ${new Date()}`);
        socket.emit('saveCanvasSuccess');
      } else {
        socket.emit('saveError', { message: 'Not authorized to save this room' });
      }
    } catch (error) {
      console.error('Error saving canvas data:', error);
      socket.emit('saveError', { message: `Failed to save canvas data: ${error.message}` });
    }
  });

  // Fetch all saved canvases for a room
  socket.on('fetchSavedCanvases', async (roomId) => {
    try {
      if (socket.currentRoom && socket.currentRoom === roomId) {
        const snapshot = await admin.firestore()
          .collection('rooms')
          .doc(roomId)
          .collection('savedCanvases')
          .orderBy('savedAt', 'asc')
          .get();
        
        const savedCanvases = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          savedCanvases.push({
            canvasData: data.canvasData,
            savedAt: data.savedAt.toDate().toISOString()
          });
        });

        socket.emit('savedCanvases', savedCanvases);
      } else {
        socket.emit('fetchError', { message: 'Not authorized to fetch data for this room' });
      }
    } catch (error) {
      console.error('Error fetching saved canvases:', error);
      socket.emit('fetchError', { message: `Failed to fetch saved canvases: ${error.message}` });
    }
  });
  
  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.currentRoom && rooms[socket.currentRoom]) {
      delete rooms[socket.currentRoom].users[socket.id];
      io.to(socket.currentRoom).emit('userLeft', { id: socket.id });
      
      if (Object.keys(rooms[socket.currentRoom].users).length === 0) {
        try {
          admin.firestore().collection('rooms').doc(socket.currentRoom).update({
            active: false,
            closedAt: admin.firestore.FieldValue.serverTimestamp()
          }).catch(err => console.error('Error updating room status:', err));
        } catch (error) {
          console.error('Error updating Firestore room:', error);
        }
        
        delete rooms[socket.currentRoom];
        console.log(`Room ${socket.currentRoom} removed`);
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});