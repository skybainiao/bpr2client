import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // 确保路径正确
import { useNavigate } from 'react-router-dom';
import '../componentsCss/Login.css'; // 引入样式文件

function Login() {
    const [userType, setUserType] = useState('student');
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const path = user.type === 'teacher' ? '/manage' : '/exam';
            navigate(path, { replace: true });
        }
    }, [user, navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        const userId = event.target.elements.userId.value;
        const userName = event.target.elements.userName.value;

        const loginUrl = userType === 'student' ? 'students/login' : 'teachers/login';

        try {
            const response = await fetch(`http://localhost:8080/${loginUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, name: userName })
            });

            const data = await response.json();

            if (response.ok) {
                login({ ...data, type: userType });
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">{userType.toUpperCase()} LOGIN</h1>
                <div className="toggle-buttons">
                    <button className={`toggle-button ${userType === 'student' ? 'active' : ''}`} onClick={() => setUserType('student')}>Student Login</button>
                    <button className={`toggle-button ${userType === 'teacher' ? 'active' : ''}`} onClick={() => setUserType('teacher')}>Teacher Login</button>
                </div>
                <form onSubmit={handleLogin}>
                    <div>
                        <label>ID:<input type="text" name="userId" required /></label>
                    </div>
                    <div>
                        <label>Name:<input type="text" name="userName" required /></label>
                    </div>
                    <button type="submit" className="button">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
