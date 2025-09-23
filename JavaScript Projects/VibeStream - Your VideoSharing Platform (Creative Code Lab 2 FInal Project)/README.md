Welcome to VibeStream, your go-to platform for discovering and sharing your favorite video experiences! This README will guide you through the setup and usage of the VibeStream application, which consists of a backend built with Node.js and Express, and a frontend developed using React.

CRUD Project, where you can add and remove users, videos, comments, feedback, 1 to 1 messages and more. If you'd like to test the project, I can provide the URL of the hosted Website, which you can freely access. For security reasons, the database connection details could NOT be provided.

First, ensure you have the necessary tools installed on your machine:
- Node.js (version 14 or higher)
- npm (Node Package Manager) - gets installed with Node.js
- Git (for cloning the repository)
- An IDE or text editor of your choice (e.g., Visual Studio Code, WebStorm etc.)
# Here are the download links for the required tools:
URL for downloading Node.js: https://nodejs.org/en

URL for downloading Git: https://git-scm.com/downloads

Secondly, let's get started with the setup process:
1. **Clone the Repository**: Open your terminal and run the following command to clone the repository:
```bash'
git clone https://git.nwt.fhstp.ac.at/ssc-ss20252/ss2025_ccl_cc241003.git
```

2. **Navigate to the Backend Directory**: Change into the backend directory:
cd backend
Here, make sure to create a `.env` file in the backend directory. The content of the `.env` file should look like the one presented within the Instructions_for_Teacher.md file.
3. **Install Backend Dependencies**: Run the following command to install the necessary backend dependencies:
```bash
npm install
```
4. **Start the Backend Server**: After the installation is complete, start the backend server with:
```bash
node app.js
```
5. **Navigate to the Frontend Directory**: Change into the frontend directory:
```bash
cd ../frontend
```
6. **Install Frontend Dependencies**: Run the following command to install the necessary frontend dependencies:
```bash
npm install
```
7. **Start the Frontend Development Server**: After the installation is complete, start the frontend development server with:
```bash
npm run dev
```

Now, you're good to go! Open your web browser and navigate to `http://localhost:3000` to access the VibeStream application or open the development server URL provided in the terminal.

# Project Description:
VibeStream is a video streaming platform that allows users to discover, share, and enjoy videos from various sources. The application features user authentication, video management, and a user-friendly interface for browsing and watching videos.
## Features:
- User Authentication: Sign up, log in, and manage user accounts.
- Video Management: Upload and delete videos.
- Video Browsing: Browse and search for videos.
- Responsive Design: Works seamlessly on both desktop and mobile devices.
- Admin Dashboard: Manage users and video reports from a dedicated admin interface.
- Video Reporting: Users can report inappropriate content, which can be managed by the admin.
- User Profiles: View and edit user profiles.
- Video Comments: Users can comment on videos, fostering community interaction.
- User Chat: Real-time chat functionality for users to communicate.
- 

   
