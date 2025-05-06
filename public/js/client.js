// Firebase authentication functions
let currentUser = null;

// Check authentication status when page loads
function checkAuth() {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        currentUser = user;
        console.log('User authenticated:', user.displayName || user.email);
        resolve(user);
      } else {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'login.html';
        reject(new Error('Not authenticated'));
      }
    });
  });
}

// Get authentication token for API calls
async function getAuthToken() {
  if (!currentUser) {
    try {
      currentUser = await checkAuth();
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
  
  try {
    return await currentUser.getIdToken(true);
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
}

// Verify token with server
async function verifyTokenWithServer() {
  try {
    const token = await getAuthToken();
    
    const response = await fetch('/api/verify-token', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify token with server');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Server verification error:', error);
    throw error;
  }
}

// Logout function
function logout() {
  firebase.auth().signOut()
    .then(() => {
      window.location.href = 'login.html';
    })
    .catch((error) => {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    });
}

// Connect to Socket.IO with authentication
async function connectSocketWithAuth(roomId) {
  try {
    // Get authentication token
    const token = await getAuthToken();
    
    // Connect to Socket.IO
    const socket = io();
    
    // Join room with authentication
    socket.emit('joinRoom', {
      roomId: roomId,
      token: token,
      displayName: currentUser.displayName || currentUser.email
    });
    
    return socket;
  } catch (error) {
    console.error('Socket connection error:', error);
    alert('Failed to connect to room. Please try again.');
    window.location.href = 'join-room.html';
    throw error;
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkAuth,
    getAuthToken,
    verifyTokenWithServer,
    logout,
    connectSocketWithAuth
  };
}