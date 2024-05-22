import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import '../componentsCss/StudentExamPage.css';

function StudentExamPage() {
    const [examPassword, setExamPassword] = useState('');
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [studentId, setStudentId] = useState(null);
    const [remainingTime, setRemainingTime] = useState(null);
    const videoRef = useRef(null);
    const stompClient = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setStudentId(storedUser.id);
        }
    }, []);

    useEffect(() => {
        if (isPasswordVerified && remainingTime !== null) {
            const timer = setInterval(() => {
                setRemainingTime(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        handleSubmitAnswers(answers);
                        exitFullscreen();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isPasswordVerified, remainingTime]);

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
                    setRemainingTime(data.duration * 60);
                    enterFullscreen();
                    preventCheating();
                    startVideoStream();
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
                exitFullscreen();
                allowNormalKeyboardShortcuts();
                exitSEB();
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
        window.location.reload();
    };

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    };

    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
            enterFullscreen();
        }
    };

    const preventCheating = () => {
        document.addEventListener('keydown', preventKeyEvents);
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
    };

    const allowNormalKeyboardShortcuts = () => {
        document.removeEventListener('keydown', preventKeyEvents);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };

    const preventKeyEvents = (e) => {
        const forbiddenKeys = ['Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Control', 'Alt', 'Meta', 'Shift', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (forbiddenKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
    };

    const exitSEB = () => {
        const sebCommand = {
            "exit": true
        };
        window.location.href = `sebs://command/${btoa(JSON.stringify(sebCommand))}`;
    };

    const startVideoStream = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                const socket = new SockJS('http://localhost:8080/video-stream');
                stompClient.current = Stomp.over(socket);
                stompClient.current.connect({}, () => {
                    console.log('WebSocket connected');
                    stompClient.current.send(`/app/video`, {}, JSON.stringify({ studentId, stream }));
                }, error => {
                    console.error('WebSocket connection error', error);
                });
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
            });
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
            {remainingTime !== null && (
                <div className="timer">
                    Time Remaining: {Math.floor(remainingTime / 60)}:{remainingTime % 60 < 10 ? '0' : ''}{remainingTime % 60}
                </div>
            )}
            <video ref={videoRef} autoPlay className="student-video"></video>
        </div>
    );
}

export default StudentExamPage;
