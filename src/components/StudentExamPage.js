import React, { useState } from 'react';
import QuestionDisplay from './QuestionDisplay'; // 假设你已经有了这个组件

function StudentExamPage() {
    const [examPassword, setExamPassword] = useState('');
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/exams/validate-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: examPassword })
            });
            if (response.ok) {
                const data = await response.json();
                setIsPasswordVerified(true);
                setQuestions(data.questions); // 假设服务器返回的问题列表
            } else {
                alert("Incorrect exam password");
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            alert('Failed to verify password');
        }
    };

    const handleAnswerChange = (event) => {
        setCurrentAnswer(event.target.value);
    };

    const handleNextQuestion = () => {
        setAnswers([...answers, { questionId: questions[currentQuestionIndex].id, answer: currentAnswer }]);
        setCurrentAnswer('');
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmitAnswers();
        }
    };

    const handleSubmitAnswers = async () => {
        try {
            const response = await fetch('http://localhost:8080/answers/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            if (response.ok) {
                alert('Answers submitted successfully!');
                setIsPasswordVerified(false);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setAnswers([]);
            } else {
                alert('Failed to submit answers');
            }
        } catch (error) {
            console.error('Error submitting answers:', error);
            alert('Failed to submit answers');
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
            <QuestionDisplay
                question={questions[currentQuestionIndex]}
                answer={currentAnswer}
                onAnswerChange={handleAnswerChange}
            />
            <button onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Submit'}
            </button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default StudentExamPage;
