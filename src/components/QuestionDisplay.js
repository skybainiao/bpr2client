import React from 'react';

function QuestionDisplay({ question, answer, onAnswerChange }) {
    return (
        <div>
            <h2>{question.text}</h2>
            {question.type === 'multiple-choice' && (
                <div>
                    {question.options.map((option, index) => (
                        <label key={index}>
                            <input
                                type="radio"
                                name="answer"
                                value={option}
                                checked={answer === option}
                                onChange={onAnswerChange}
                            /> {option}
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
        </div>
    );
}

export default QuestionDisplay;
