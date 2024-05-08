import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import StudentExamPage from './components/StudentExamPage';
import TeacherManagePage from './components/TeacherManagePage';

function App() {
    const { user } = useAuth();

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Login />} />
                    {user ? (
                        <>
                            {user.type === 'teacher' && (
                                <Route path="/manage" element={<TeacherManagePage />} />
                            )}
                            {user.type === 'student' && (
                                <Route path="/exam" element={<StudentExamPage />} />
                            )}
                        </>
                    ) : (
                        <Route path="*" element={<Navigate to="/" replace />} />
                    )}
                </Routes>
            </div>
        </Router>
    );
}

function WrappedApp() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

export default WrappedApp;
