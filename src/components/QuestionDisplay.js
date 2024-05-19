import React from 'react';
import '../componentsCss/QuestionDisplay.css';

function QuestionDisplay({ question, answer, onAnswerChange }) {
    return (
        <div className="question-container">
            <h2>{question.content}</h2>
            {question.type === 'multiple-choice' && (
                <div className="options-container">
                    {question.options && question.options.map((option, index) => (
                        <label key={index} className="option-label">
                            <input
                                type="radio"
                                name="answer"
                                value={option}
                                checked={answer === option}
                                onChange={onAnswerChange}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
            {question.type === 'fill-in-the-blank' && (
                <input
                    type="text"
                    placeholder="Enter your answer"
                    value={answer}
                    onChange={onAnswerChange}
                />
            )}
            {question.type === 'text' && (
                <textarea
                    placeholder="Write your answer here"
                    value={answer}
                    onChange={onAnswerChange}
                    rows={4}
                />
            )}
        </div>
    );
}

export default QuestionDisplay;
