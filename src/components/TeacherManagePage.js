import React, { useState, useEffect } from 'react';
import '../componentsCss/TeacherManagePage.css'; // 引入样式文件

function TeacherManagePage() {
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
    const [questionContent, setQuestionContent] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [questions, setQuestions] = useState([]); // 存储当前创建的问题列表

    // 获取课程列表
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

    // 获取考试列表
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

    const handleQuestionSubmit = async (event) => {
        event.preventDefault();
        const newQuestion = {
            content: questionContent,
            correctAnswer,
            exam: { id: examId }
        };

        setQuestions([...questions, newQuestion]); // 添加新问题到问题列表
        setQuestionContent(''); // 清空问题内容输入框
        setCorrectAnswer(''); // 清空正确答案输入框
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

    return (
        <div>
            <h1>Teacher Management Page</h1>
            <div className="button-container">
                <button onClick={() => setView('createExam')}>Create Exam</button>
                <button onClick={() => setView('createQuestion')}>Create Question</button>
                <button onClick={() => setView('gradeExam')}>Grade Exam</button>
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
                        <button type="submit">Add Question</button>
                    </form>
                    <div className="question-list">
                        <h3>Current Questions</h3>
                        <ul>
                            {questions.map((q, index) => (
                                <li key={index}>{q.content} - {q.correctAnswer}</li>
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
                    {/* 批改试卷的表单 */}
                </div>
            )}
        </div>
    );
}

export default TeacherManagePage;
