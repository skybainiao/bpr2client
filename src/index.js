import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import WrappedApp from './App'; // 确保这里正确引用 WrappedApp，如果 WrappedApp 定义在 App.js 中
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <WrappedApp /> {/* 确保这里使用 WrappedApp */}
    </React.StrictMode>
);

reportWebVitals();
