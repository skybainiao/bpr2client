import React from 'react';
import { useAuth } from "../context/AuthContext"; // 确保路径正确
import '../componentsCss/StudentExamPage.css'; // 引入样式文件

function StudentExamPage() {
    const { logout } = useAuth();

    return (
        <div className="student-exam-container">
            <h1 className="exam-header">Student Exam Page</h1>
            <div className="exam-content">
                <p>Welcome to your exam. Your questions will appear here.</p>
            </div>
            <button onClick={logout} className="logout-button">Logout</button>
        </div>
    );
}

export default StudentExamPage;
