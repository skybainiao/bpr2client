import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StudentList() {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('http://localhost:8080/students/');
                setStudents(response.data);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchStudents();
    }, []);

    return (
        <div>
            <h2>Student List</h2>
            {students.length > 0 ? (
                <ul>
                    {students.map(student => (
                        <li key={student.id}>{student.name} - Age: {student.age} - Email: {student.email}</li>
                    ))}
                </ul>
            ) : (
                <p>No students found.</p>
            )}
        </div>
    );
}

export default StudentList;
