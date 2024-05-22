import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import '../componentsCss/TeacherManagePage.css';

function TeacherManagePage() {
    const [view, setView] = useState('');
    const [examTitle, setExamTitle] = useState('');
    const [examPassword, setExamPassword] = useState('');
    const [examDate, setExamDate] = useState('');
    const [examDuration, setExamDuration] = useState('');
    const [examDescription, setExamDescription] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [examId, setExamId] = useState('');
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [studentAnswers, setStudentAnswers] = useState([]);
    const [questionContent, setQuestionContent] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [questionWeight, setQuestionWeight] = useState('');
    const [questions, setQuestions] = useState([]);
    const [scores, setScores] = useState({});
    const [totalScore, setTotalScore] = useState(0);
    const [videoStreams, setVideoStreams] = useState([]);

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:8080/courses/');
            const data = await response.json();
            setCourses(data);
            if (data.length > 0) {
                setSelectedCourseId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchExams = async () => {
        try {
            const response = await fetch('http://localhost:8080/exams/');
            const data = await response.json();
            console.log("Fetched exams:", data);
            if (Array.isArray(data)) {
                setExams(data);
                if (data.length > 0) {
                    setExamId(data[0].id);
                }
            } else {
                console.error('Fetched exams is not an array', data);
                setExams([]);
            }
        } catch (error) {
            console.error('Failed to fetch exams', error);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchExams();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload();
    };

    const handleExamSubmit = async (event) => {
        event.preventDefault();
        const examDetails = {
            title: examTitle,
            examPassword: examPassword,
            examDate: new Date(examDate).toISOString(),
            duration: examDuration,
            description: examDescription,
            course: { id: selectedCourseId }
        };

        try {
            const response = await fetch('http://localhost:8080/exams/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examDetails)
            });
            if (response.ok) {
                const createdExam = await response.json();
                setExamId(createdExam.id);
                alert('Exam created successfully!');
                await fetchExams();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create exam');
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            alert(error.message);
        }
    };

    const handleQuestionSubmit = async (event) => {
        event.preventDefault();
        const newQuestion = {
            content: questionContent,
            correctAnswer,
            weight: questionWeight,
            exam: { id: examId }
        };

        setQuestions([...questions, newQuestion]);
        setQuestionContent('');
        setCorrectAnswer('');
        setQuestionWeight('');
    };

    const handleQuestionsSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8080/questions/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questions)
            });
            if (response.ok) {
                alert('Questions created successfully!');
                setQuestions([]);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create questions');
            }
        } catch (error) {
            console.error('Error creating questions:', error);
            alert(error.message);
        }
    };

    const handleSelectExam = async (examId) => {
        setExamId(examId);
        try {
            const response = await fetch(`http://localhost:8080/students/by-exam/${examId}`);
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Failed to fetch students', error);
        }
    };

    const handleSelectStudent = async (studentId) => {
        setSelectedStudentId(studentId);
        try {
            const response = await fetch(`http://localhost:8080/answers/by-student-and-exam?studentId=${studentId}&examId=${examId}`);
            const data = await response.json();
            setStudentAnswers(data);
        } catch (error) {
            console.error('Failed to fetch student answers', error);
        }
    };

    const handleScoreChange = (questionId, score) => {
        setScores({
            ...scores,
            [questionId]: parseFloat(score)
        });
    };

    const handleSubmitScores = async () => {
        const totalScore = Object.values(scores).reduce((acc, score) => acc + score, 0);
        setTotalScore(totalScore);
        const scoreDetails = {
            exam: { id: examId },
            student: { id: selectedStudentId },
            score: totalScore
        };
        try {
            const response = await fetch('http://localhost:8080/scores/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scoreDetails)
            });
            if (response.ok) {
                alert('Score submitted successfully!');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit score');
            }
        } catch (error) {
            console.error('Error submitting score:', error);
            alert(error.message);
        }
    };

    const handleStartVideoStream = async () => {
        try {
            const response = await fetch('http://localhost:8080/video-stream/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                alert('Video stream started successfully!');
                fetchVideoStreams();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to start video stream');
            }
        } catch (error) {
            console.error('Error starting video stream:', error);
            alert(error.message);
        }
    };

    const fetchVideoStreams = async () => {
        try {
            const socket = new SockJS('http://localhost:8080/video-stream');
            const stompClient = new Client({
                webSocketFactory: () => socket,
                debug: (str) => console.log(str),
                onConnect: (frame) => {
                    console.log('Connected: ' + frame);
                    stompClient.subscribe('/topic/video', message => {
                        const stream = JSON.parse(message.body);
                        setVideoStreams(prevStreams => [...prevStreams, stream]);
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                }
            });

            stompClient.activate();
        } catch (error) {
            console.error('Failed to fetch video streams', error);
        }
    };

    useEffect(() => {
        if (view === 'monitorStudents') {
            fetchVideoStreams();
        }
    }, [view]);

    return (
        <div className="container">
            <h1 className="header">Teacher Management Page</h1>
            <div className="button-grid">
                <button onClick={() => setView('createExam')}>Create Exam</button>
                <button onClick={() => setView('createQuestion')}>Create Question</button>
                <button onClick={() => setView('gradeExam')}>Grade Exam</button>
                <button onClick={() => setView('monitorStudents')}>Monitor Students</button>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {view === 'createExam' && (
                <div className="form-container">
                    <h2>Create Exam</h2>
                    <form onSubmit={handleExamSubmit}>
                        <label>
                            Exam Title:
                            <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)} required />
                        </label>
                        <label>
                            Exam Password:
                            <input type="password" value={examPassword} onChange={e => setExamPassword(e.target.value)} required />
                        </label>
                        <label>
                            Exam Date:
                            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} required />
                        </label>
                        <label>
                            Exam Duration (hours):
                            <input type="number" value={examDuration} onChange={e => setExamDuration(e.target.value)} required />
                        </label>
                        <label>
                            Exam Description:
                            <textarea value={examDescription} onChange={e => setExamDescription(e.target.value)} required />
                        </label>
                        <label>
                            Course:
                            <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="submit">Create Exam</button>
                    </form>
                </div>
            )}

            {view === 'createQuestion' && (
                <div className="form-container">
                    <h2>Create Question</h2>
                    <form onSubmit={handleQuestionSubmit}>
                        <label>
                            Exam:
                            <select value={examId} onChange={e => setExamId(e.target.value)} required>
                                {exams.map(exam => (
                                    <option key={exam.id} value={exam.id}>
                                        {exam.title} - {new Date(exam.examDate).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Question Content:
                            <input type="text" value={questionContent} onChange={e => setQuestionContent(e.target.value)} required />
                        </label>
                        <label>
                            Correct Answer:
                            <input type="text" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} required />
                        </label>
                        <label>
                            Weight:
                            <input type="number" value={questionWeight} onChange={e => setQuestionWeight(e.target.value)} required />
                        </label>
                        <button type="submit">Add Question</button>
                    </form>
                    <div className="question-list">
                        <h3>Current Questions</h3>
                        <ul>
                            {questions.map((q, index) => (
                                <li key={index}>{q.content} - {q.correctAnswer} - {q.weight}</li>
                            ))}
                        </ul>
                        {questions.length > 0 && (
                            <button onClick={handleQuestionsSubmit}>Submit All Questions</button>
                        )}
                    </div>
                </div>
            )}

            {view === 'gradeExam' && (
                <div className="form-container">
                    <h2>Grade Exam</h2>
                    <label>
                        Select Exam:
                        <select value={examId} onChange={e => handleSelectExam(e.target.value)}>
                            <option value="">Select an exam</option>
                            {exams.map(exam => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.title}
                                </option>
                            ))}
                        </select>
                    </label>
                    {students.length > 0 && (
                        <div>
                            <h3>Students who submitted answers</h3>
                            <ul>
                                {students.map(student => (
                                    <li key={student.id} onClick={() => handleSelectStudent(student.id)}>
                                        {student.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {studentAnswers.length > 0 && (
                        <div>
                            <h3>Answers</h3>
                            {studentAnswers.map(answer => (
                                <div key={answer.id}>
                                    <p>Question: {answer.question.content}</p>
                                    <p>Student's Answer: {answer.studentAnswer}</p>
                                    <label>
                                        Score:
                                        <input
                                            type="number"
                                            onChange={e => handleScoreChange(answer.question.id, e.target.value)}
                                        />
                                    </label>
                                </div>
                            ))}
                            <button onClick={handleSubmitScores}>Submit Total Score</button>
                        </div>
                    )}
                </div>
            )}

            {view === 'monitorStudents' && (
                <div className="form-container">
                    <h2>Monitor Students</h2>
                    <button onClick={handleStartVideoStream}>Start Video Stream</button>
                    <div className="video-grid">
                        {videoStreams.map((stream, index) => (
                            <video key={index} src={stream} autoPlay className="student-video"></video>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherManagePage;
