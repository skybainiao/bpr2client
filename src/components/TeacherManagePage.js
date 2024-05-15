import React, { useState, useEffect } from 'react';
import '../componentsCss/TeacherManagePage.css'; // 引入样式文件

function TeacherManagePage() {
    const [examTitle, setExamTitle] = useState('');
    const [examPassword, setExamPassword] = useState('');
    const [examDate, setExamDate] = useState('');
    const [examDuration, setExamDuration] = useState('');
    const [examDescription, setExamDescription] = useState('');
    const [courses, setCourses] = useState([]); // 存储课程列表
    const [selectedCourseId, setSelectedCourseId] = useState(''); // 存储选中的课程ID

    useEffect(() => {
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
        fetchCourses();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload();
    };

    const handleSubmit = async (event) => {
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
                alert('Exam created successfully!');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create exam');
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            alert(error.message);
        }
    };

    return (
        <div>
            <h1>Create Exam</h1>
            <form onSubmit={handleSubmit}>
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
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default TeacherManagePage;
