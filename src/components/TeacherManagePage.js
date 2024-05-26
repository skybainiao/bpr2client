import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import '../componentsCss/TeacherManagePage.css';

const TeacherManagePage = () => {
    const [view, setView] = useState(''); // 用于切换视图
    const [examTitle, setExamTitle] = useState('');
    const [examPassword, setExamPassword] = useState('');
    const [examDate, setExamDate] = useState('');
    const [examDuration, setExamDuration] = useState('');
    const [examDescription, setExamDescription] = useState('');
    const [courses, setCourses] = useState([]); // 存储课程列表
    const [selectedCourseId, setSelectedCourseId] = useState(''); // 存储选中的课程ID
    const [examId, setExamId] = useState(''); // 存储选择的考试ID
    const [exams, setExams] = useState([]); // 存储考试列表
    const [students, setStudents] = useState([]); // 存储学生列表
    const [selectedStudentId, setSelectedStudentId] = useState(''); // 存储选择的学生ID
    const [studentAnswers, setStudentAnswers] = useState([]); // 存储学生答案列表
    const [questionContent, setQuestionContent] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [questionWeight, setQuestionWeight] = useState('');
    const [questions, setQuestions] = useState([]); // 存储当前创建的问题列表
    const [allQuestions, setAllQuestions] = useState([]); // 存储所有问题列表
    const [selectedQuestionId, setSelectedQuestionId] = useState(''); // 存储选择的问题ID
    const [scores, setScores] = useState({}); // 存储各问题分数
    const [totalScore, setTotalScore] = useState(0); // 存储总分
    const [videoStreams, setVideoStreams] = useState([]); // 存储所有学生的视频流
    const peerConnections = useRef({}); // 存储所有的RTCPeerConnections

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:8080/courses/');
            const data = await response.json();
            setCourses(data);
            if (data.length > 0) {
                setSelectedCourseId(data[0].id); // 默认选择第一个课程
            }
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchExams = async () => {
        try {
            const response = await fetch('http://localhost:8080/exams/');
            const data = await response.json();
            console.log("Fetched exams:", data); // 添加日志
            if (Array.isArray(data)) {
                setExams(data);
                if (data.length > 0) {
                    setExamId(data[0].id); // 默认选择第一个考试
                }
            } else {
                console.error('Fetched exams is not an array', data);
                setExams([]);
            }
        } catch (error) {
            console.error('Failed to fetch exams', error);
        }
    };

    const fetchQuestions = async (examId) => {
        try {
            const response = await fetch(`http://localhost:8080/questions/by-exam/${examId}`);
            const data = await response.json();
            setAllQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch questions', error);
            setAllQuestions([]); // 确保 allQuestions 始终是数组
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
                setExamId(createdExam.id); // 设置新创建考试的ID
                alert('Exam created successfully!');
                await fetchExams(); // 重新获取考试列表
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create exam');
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            alert(error.message);
        }
    };

    const handleUpdateExam = async (event) => {
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
            const response = await fetch(`http://localhost:8080/exams/${examId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examDetails)
            });
            if (response.ok) {
                alert('Exam updated successfully!');
                await fetchExams(); // 重新获取考试列表
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update exam');
            }
        } catch (error) {
            console.error('Error updating exam:', error);
            alert(error.message);
        }
    };

    const handleDeleteExam = async (examId) => {
        try {
            const response = await fetch(`http://localhost:8080/exams/${examId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Exam deleted successfully!');
                await fetchExams(); // 重新获取考试列表
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete exam');
            }
        } catch (error) {
            console.error('Error deleting exam:', error);
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

        setQuestions([...questions, newQuestion]); // 添加新问题到问题列表
        setQuestionContent(''); // 清空问题内容输入框
        setCorrectAnswer(''); // 清空正确答案输入框
        setQuestionWeight(''); // 清空问题权重输入框
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
                setQuestions([]); // 清空问题列表
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create questions');
            }
        } catch (error) {
            console.error('Error creating questions:', error);
            alert(error.message);
        }
    };

    const handleUpdateQuestion = async (questionId) => {
        const updatedQuestion = {
            content: questionContent,
            correctAnswer,
            weight: questionWeight
        };

        try {
            const response = await fetch(`http://localhost:8080/questions/${questionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedQuestion)
            });
            if (response.ok) {
                alert('Question updated successfully!');
                fetchQuestions(examId); // 重新获取问题列表
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update question');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            alert(error.message);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            const response = await fetch(`http://localhost:8080/questions/${questionId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Question deleted successfully!');
                fetchQuestions(examId); // 重新获取问题列表
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete question');
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            alert(error.message);
        }
    };

    const handleSelectExam = async (examId) => {
        setExamId(examId);
        try {
            const response = await fetch(`http://localhost:8080/students/by-exam/${examId}`);
            const data = await response.json();
            setStudents(data);
            fetchQuestions(examId);
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

    const fetchVideoStreams = async () => {
        try {
            const socket = new SockJS('http://localhost:8080/video-stream');
            const stompClient = Stomp.over(socket);

            stompClient.connect({}, (frame) => {
                console.log('Connected to WebSocket server:', frame);

                stompClient.subscribe('/topic/video-streams', async (message) => {
                    const data = JSON.parse(message.body);
                    console.log('Received message:', data);

                    if (data.type === "offer") {
                        const peerConnection = new RTCPeerConnection();
                        peerConnections.current[data.studentId] = peerConnection;

                        peerConnection.ontrack = (event) => {
                            const stream = event.streams[0];
                            console.log('Received remote stream:', stream);
                            setVideoStreams((prevStreams) => {
                                const updatedStreams = [...prevStreams];
                                const existingStream = updatedStreams.find(s => s.studentId === data.studentId);
                                if (existingStream) {
                                    existingStream.stream = stream;
                                } else {
                                    updatedStreams.push({ studentId: data.studentId, stream: stream });
                                }
                                return updatedStreams;
                            });
                        };

                        peerConnection.onicecandidate = (event) => {
                            if (event.candidate) {
                                console.log('Sending ICE candidate:', event.candidate);
                                stompClient.send("/app/video-stream", {}, JSON.stringify({
                                    type: "candidate",
                                    candidate: event.candidate,
                                    studentId: data.studentId
                                }));
                            }
                        };

                        peerConnection.oniceconnectionstatechange = () => {
                            if (peerConnection) {
                                console.log('ICE connection state changed:', peerConnection.iceConnectionState);
                            }
                        };

                        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                        console.log('Set remote description:', data.offer);

                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        console.log('Sending answer:', answer);

                        stompClient.send("/app/video-stream", {}, JSON.stringify({
                            type: "answer",
                            answer: peerConnection.localDescription,
                            studentId: data.studentId
                        }));
                    } else if (data.type === "candidate") {
                        const peerConnection = peerConnections.current[data.studentId];
                        if (peerConnection) {
                            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                            console.log('Added ICE candidate:', data.candidate);
                        }
                    }
                });
            });

            stompClient.onclose = () => {
                console.log('WebSocket connection closed');
            };

            stompClient.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Error fetching video streams:', error);
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
                <button onClick={() => setView('manageExam')}>Manage Exam</button>
                <button onClick={() => setView('manageQuestion')}>Manage Question</button>
                <button onClick={() => setView('gradeExam')}>Grade Exam</button>
                <button onClick={() => setView('monitorStudents')}>Monitor Students</button>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {view === 'manageExam' && (
                <div className="form-container">
                    <h2>Manage Exam</h2>
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
                    {examId && (
                        <div>
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
                            <div className="exam-list">
                                <h3>Existing Exams</h3>
                                <ul>
                                    {exams.map(exam => (
                                        <li key={exam.id}>
                                            <span>{exam.title}</span>
                                            <div>
                                                <button onClick={() => {
                                                    setExamId(exam.id);
                                                    setExamTitle(exam.title);
                                                    setExamPassword(exam.examPassword);
                                                    setExamDate(new Date(exam.examDate).toISOString().substr(0, 10));
                                                    setExamDuration(exam.duration);
                                                    setExamDescription(exam.description);
                                                    setSelectedCourseId(exam.course.id);
                                                }}>Update</button>
                                                <button onClick={() => handleDeleteExam(exam.id)}>Delete</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {examId && (
                                    <form onSubmit={handleUpdateExam}>
                                        <h3>Update Exam</h3>
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
                                        <button type="submit">Update Exam</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {view === 'manageQuestion' && (
                <div className="form-container">
                    <h2>Manage Questions</h2>
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
                    {examId && (
                        <div>
                            <form onSubmit={handleQuestionSubmit}>
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
                                <h3>Existing Questions</h3>
                                <ul>
                                    {Array.isArray(allQuestions) && allQuestions.map(question => (
                                        <li key={question.id}>
                                            <span>{question.content}</span>
                                            <div>
                                                <button onClick={() => {
                                                    setSelectedQuestionId(question.id);
                                                    setQuestionContent(question.content);
                                                    setCorrectAnswer(question.correctAnswer);
                                                    setQuestionWeight(question.weight);
                                                }}>Update</button>
                                                <button onClick={() => handleDeleteQuestion(question.id)}>Delete</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {selectedQuestionId && (
                                    <form onSubmit={() => handleUpdateQuestion(selectedQuestionId)}>
                                        <h3>Update Question</h3>
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
                                        <button type="submit">Update Question</button>
                                    </form>
                                )}
                            </div>
                            <div className="question-list">
                                <h3>New Questions to be Submitted</h3>
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
                    <div className="video-grid">
                        {videoStreams.map((streamData, index) => (
                            <video key={index} ref={video => {
                                if (video) {
                                    video.srcObject = streamData.stream;
                                    video.play();
                                }
                            }} autoPlay className="student-video"></video>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherManagePage;
