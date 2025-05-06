# Real-Time Collaborative Whiteboard

## Overview
This project is a real-time collaborative whiteboard application that allows multiple users to join a room and draw together. Users can draw with a pen, erase, clear the canvas, save their work, and download saved canvases as a ZIP file. The application uses Firebase for user authentication and Firestore for storing canvas data, with Socket.IO enabling real-time collaboration.

### Features
- **Real-Time Drawing**: Draw on a shared canvas with other users in the same room.
- **Pen and Eraser Tools**: Choose between a pen (with customizable color and width) and an eraser.
- **Clear Canvas**: Clear the entire canvas for all users in the room.
- **Save Canvas**: Save the current canvas state to the server.
- **Download Saved Canvases**: Download all saved canvases for a room as a ZIP file.
- **User Authentication**: Secure login using Firebase Authentication.
- **Room-Based Collaboration**: Join or create rooms using a Room ID.

## Project Structure

collaborative-whiteboard/
├── public/
│   ├── css/
│   │   └── style.css         # Styles for the whiteboard UI
│   ├── whiteboard.html       # Main whiteboard page
│   ├── login.html            # Login page for Firebase authentication
│   ├── join-room.html        # Page to join or create a room
│   └── client.js             # Client-side script for token verification
├── server.js                 # Server-side logic
├── serviceAccountKey.json    # Firebase service account key (not included)
├── package.json              # Project dependencies
└── README.md                 # Project documentation


## Prerequisites
- **Node.js** (v14.x or higher recommended)
- **npm** (Node package manager, comes with Node.js)
- A **Firebase project** with:
  - Firebase Authentication enabled (Email/Password provider)
  - Firestore database set up
  - A service account key (`serviceAccountKey.json`) for server-side Firebase Admin SDK

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd collaborative-whiteboard

2. Install Dependencies
Install the required Node.js packages:

bash
npm install
The package.json includes dependencies like:

express
socket.io
firebase-admin

3. Configure Firebase
 i. Create a Firebase project at console.firebase.google.com.
 ii. Enable Email/Password authentication in the Authentication section.
 iii. Set up a Firestore database in the Firebase console.
 iv. Download your Firebase service account key:
      -> Go to Project Settings > Service Accounts.
      -> Generate a new private key and download the JSON file.
      -> Rename it to serviceAccountKey.json and place it in the project root directory.
 v. Update the Firebase configuration in whiteboard.html, login.html, and join-room.html:
      -> Replace the firebaseConfig object with your Firebase project’s configuration (found in Project Settings > General > Your Apps).

4. Run the Application
Start the server:

bash
npm start
The application will run on http://localhost:3000 by default (or the port specified in server.js).

Usage:

 1. Access the Application:
  -> Open your browser and navigate to http://localhost:3000/login.html.

 2. Login:
   ->Sign in using your Firebase credentials (or register a new account if Email/Password authentication allows sign-ups).

 3. Join or Create a Room:
   -> After logging in, you’ll be redirected to join-room.html.
   -> Enter a Room ID to join an existing room, or create a new room by entering a unique Room ID.

 4. Collaborate on the Whiteboard:
   -> You’ll be redirected to whiteboard.html?room=<RoomID>.
   -> Use the toolbar to select the pen or eraser, choose a color, and adjust the line width.
   ->Draw on the canvas—other users in the same room will see your changes in real-time.
   -> Click Clear Canvas to clear the canvas for all users.
   -> Click Save to save the current canvas state.
   -> Click Download All to download all saved canvases for the room as a ZIP file.
 5. Leave or Logout:
   -> Click Leave Room to return to the room selection page.
   -> Click Logout to sign out and return to the login page.


Dependencies
 -> Firebase: For user authentication and Firestore database.
 -> Socket.IO: For real-time communication between clients and the server.
 -> Express: For serving static files and handling API routes.
 -> JSZip and FileSaver.js: For downloading saved canvases as a ZIP file (loaded via CDN).

 Development Notes
 -> The project uses Firebase Authentication for secure user access.
 -> Firestore is used to store room metadata and saved canvases.
 -> Socket.IO enables real-time drawing and collaboration.
 ->The debug panel (draggable on the whiteboard page) shows connection status, user ID, room ID, and the number of users in the room.

Future Improvements
 -> Add an Undo/Redo feature for drawing actions.
 -> Implement Shape Tools (e.g., rectangles, circles) for more versatile drawing.
 -> Add a Chat Feature for users to communicate within a room.
 -> Improve performance for large rooms with many users.

License
This project is for educational purposes and does not include a specific license. Feel free to modify and use it as needed.

---

### Explanation of Sections
1. **Overview**: A brief description of the project and its core features.
2. **Project Structure**: A clear layout of the files and their purposes.
3. **Prerequisites**: Lists the tools and services needed to run the project.
4. **Setup Instructions**: Step-by-step guide to set up and run the project, including Firebase configuration.
5. **Usage**: Instructions on how to use the application as an end user.
6. **Dependencies**: Highlights key libraries and their purposes.
7. **Development Notes**: Additional context about the project’s implementation.
8. **Future Improvements**: Suggestions for enhancing the project (e.g., features you might want to add next).
9. **License**: A placeholder for licensing information (you can update this based on your preferences).

---

### How to Add to Your Project
1. Create a file named `README.md` in the root directory of your project (`collaborative-whiteboard/`).
2. Copy the content above into `README.md`.
3. Adjust any details (e.g., Firebase configuration instructions, port numbers, or future improvements) to match your specific setup or plans.

This `README.md` provides a comprehensive guide for anyone interacting with your project, whether they’re running it for the first time or contributing to its development. Let me know if you’d like to adjust or add anything to this documentation!