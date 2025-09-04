import './App.css'
import { Route, Routes } from 'react-router-dom'
import UserLoginPage from './pages/Login'
import UserRegistrationPage from './pages/Register'
import { BrowserRouter as Router } from 'react-router-dom'
import NotesApp from './pages/Notes'

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<UserLoginPage/>} />
          <Route path="/register" element={<UserRegistrationPage/>} />
          <Route path="/note" element={<NotesApp/>} />
        </Routes>
      </Router>
  ); 
}      
export default App;
