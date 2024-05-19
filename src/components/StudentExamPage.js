import React, { useState, useEffect } from 'react';
import '../componentsCss/StudentExamPage.css';

function StudentExamPage() {
    const [examPassword, setExamPassword] = useState('');
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [studentId, setStudentId] = useState(null); // 存储学生ID

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setStudentId(storedUser.id);
        }
    }, []);

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/exams/validate-password/${examPassword}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: examPassword })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                    setIsPasswordVerified(true);
                    setCurrentQuestionIndex(0);
                } else {
                    alert('No questions found for this exam.');
                }
            } else {
                const error = await response.json();
                alert(error.message || "Incorrect exam password");
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
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = {
            question: { id: questions[currentQuestionIndex].id },
            student: { id: studentId },
            studentAnswer: currentAnswer
        };
        setAnswers(updatedAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentAnswer(answers[currentQuestionIndex + 1]?.studentAnswer || '');
        } else {
            alert('You have reached the end of the exam.');
            handleSubmitAnswers(updatedAnswers);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setCurrentAnswer(answers[currentQuestionIndex - 1]?.studentAnswer || '');
        }
    };

    const handleSubmitAnswers = async (answers) => {
        try {
            const response = await fetch('http://localhost:8080/answers/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers)
            });
            if (response.ok) {
                alert('Answers submitted successfully!');
                setIsPasswordVerified(false);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setCurrentAnswer('');
                setAnswers([]);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to submit answers');
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
            <div className="exam-container">
                <h1>Student Exam Page</h1>
                <form onSubmit={handlePasswordSubmit} className="exam-form">
                    <label>
                        Exam Password:
                        <input
                            type="password"
                            value={examPassword}
                            onChange={(e) => setExamPassword(e.target.value)}
                            required
                        />
                    </label>
                    <div className="button-group">
                        <button type="submit" className="button-primary">Enter Exam</button>
                        <button type="button" className="button-secondary" onClick={handleLogout}>Logout</button>
                    </div>
                </form>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex] || {};

    return (
        <div className="exam-container">
            <h1>Student Exam Page</h1>
            <div className="question-display">
                <h2>Question {currentQuestionIndex + 1}:</h2>
                <textarea
                    readOnly
                    value={currentQuestion.content}
                    className="question-text"
                />
                <textarea
                    placeholder="Write your answer here"
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                    className="answer-text"
                />
            </div>
            <div className="exam-navigation">
                <button className="button-secondary" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                    Previous
                </button>
                <button className="button-primary" onClick={handleNextQuestion}>
                    {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Submit'}
                </button>
            </div>
            <button type="button" className="button-logout" onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default StudentExamPage;
