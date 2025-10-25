# Real-time Polling Application

A full-stack real-time polling application built with FastAPI backend and Next.js frontend, featuring WebSocket support for live updates.

## 🚀 Features

- **Real-time Updates**: WebSocket connections provide instant vote and like updates
- **Beautiful UI**: Modern, responsive design with shadcn/ui components
- **Optimistic Updates**: Instant UI feedback with server-side validation
- **Poll Management**: Create polls with 2-4 options
- **Vote Tracking**: Prevent duplicate votes using IP-based tracking
- **Like System**: Users can like polls they find interesting
- **Live Statistics**: Real-time vote counts and percentages

## 🏗️ Architecture

### Backend (FastAPI)
- **REST API**: CRUD operations for polls, votes, and likes
- **WebSocket**: Real-time broadcasting of updates
- **SQLite Database**: Data persistence with SQLModel
- **CORS Support**: Configured for frontend integration

### Frontend (Next.js)
- **React Components**: Modular, reusable UI components
- **TypeScript**: Type-safe development
- **WebSocket Client**: Automatic reconnection and error handling
- **Form Validation**: Client-side validation with Zod
- **Responsive Design**: Mobile-first approach

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + WebSocket
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── database.py          # DB connection
│   │   ├── crud.py              # Database operations
│   │   ├── websocket_manager.py # WebSocket handler
│   │   └── routes/
│   │       ├── polls.py         # Poll endpoints
│   │       └── votes.py         # Vote/Like endpoints
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx         # Main page
    │   │   └── layout.tsx       # App layout
    │   ├── components/
    │   │   ├── ui/              # shadcn/ui components
    │   │   ├── PollCard.tsx     # Poll display
    │   │   ├── PollForm.tsx    # Create poll form
    │   │   ├── VoteButton.tsx   # Voting interface
    │   │   └── LikeButton.tsx   # Like functionality
    │   └── lib/
    │       ├── api.ts           # API client
    │       ├── websocket.ts     # WebSocket client
    │       └── utils.ts         # Utilities
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Activate virtual environment**:
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - WebSocket endpoint: `ws://localhost:8000/ws`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 🔄 Data Flow

```
User Action (Vote/Like)
    ↓
Frontend sends API request
    ↓
Backend updates database
    ↓
Backend broadcasts via WebSocket
    ↓
All connected clients receive update
    ↓
Frontend updates UI in real-time
```

## 📡 API Endpoints

### Polls
- `GET /polls/` - Get all polls
- `GET /polls/{id}` - Get specific poll
- `POST /polls/` - Create new poll

### Votes & Likes
- `POST /polls/{id}/vote` - Vote on a poll
- `POST /polls/{id}/like` - Like a poll

### WebSocket
- `WS /ws` - Real-time updates connection

## 🎨 UI Components

- **PollCard**: Displays poll with voting options and live results
- **PollForm**: Create new polls with validation
- **VoteButton**: Individual voting buttons for each option
- **LikeButton**: Like/unlike functionality with visual feedback

## 🔧 Configuration

### Environment Variables

**Backend**:
- `DATABASE_URL`: Database connection string (default: SQLite)

**Frontend**:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

### Database

The application uses SQLite by default for simplicity. To use PostgreSQL:

1. Update `DATABASE_URL` in `backend/app/database.py`
2. Install PostgreSQL adapter: `pip install psycopg2-binary`

## 🚀 Deployment

### Backend (FastAPI)
- Deploy to platforms like Railway, Render, or Heroku
- Set environment variables for production database
- Configure CORS origins for your frontend domain

### Frontend (Next.js)
- Deploy to Vercel, Netlify, or similar platforms
- Update `NEXT_PUBLIC_API_URL` to point to your backend
- Configure WebSocket URL for production

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Features in Detail

### Real-time Updates
- WebSocket connections automatically reconnect on failure
- Optimistic UI updates provide instant feedback
- Server-side validation ensures data integrity

### Vote Management
- IP-based duplicate vote prevention
- Support for 2-4 poll options
- Real-time vote count and percentage display

### Like System
- One like per IP address per poll
- Visual feedback with heart icon animation
- Live like count updates

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure backend is running on port 8000
   - Check CORS configuration
   - Verify WebSocket URL in frontend

2. **Database Errors**
   - Check database file permissions
   - Ensure SQLite is properly installed
   - Verify database schema creation

3. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all dependencies are installed

### Getting Help

- Check the API documentation at `/docs` when backend is running
- Review browser console for frontend errors
- Check backend logs for server-side issues

---

**Happy Polling! 🗳️**
