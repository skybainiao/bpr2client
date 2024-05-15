import React, { useState } from 'react';
import QuestionDisplay from './QuestionDisplay'; // 假设你已经有了这个组件

function StudentExamPage() {
    const [examPassword, setExamPassword] = useState('');
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    const verifyExamPassword = (password) => {
        // 假设密码为 "exam2024"，在实际应用中应从服务器验证
        return password === "exam2024";
    };

    const handlePasswordSubmit = (event) => {
        event.preventDefault();
        if (verifyExamPassword(examPassword)) {
            setIsPasswordVerified(true);
            setCurrentQuestion({
                type: 'multiple-choice',
                text: 'What is the capital of France?',
                options: ['Paris', 'London', 'Berlin', 'Madrid']
            });
        } else {
            alert("Incorrect exam password");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload(); // 刷新页面以返回登录页面
    };

    if (!isPasswordVerified) {
        return (
            <div>
                <h1>Student Exam Page</h1>
                <form onSubmit={handlePasswordSubmit}>
                    <label>
                        Exam Password:
                        <input
                            type="password"
                            value={examPassword}
                            onChange={(e) => setExamPassword(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit">Enter Exam</button>
                </form>
            </div>
        );
    }

    return (
        <div>
            <h1>Student Exam Page</h1>
            <QuestionDisplay question={currentQuestion} />
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default StudentExamPage;
