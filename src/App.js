import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import Navbar from './components/Navbar';

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/add-student" element={<StudentForm />} />
                    <Route path="/" element={<StudentList />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
