import React from 'react';

function QuestionDisplay({ question }) {
    return (
        <div>
            <h2>{question.text}</h2>
            {question.type === 'multiple-choice' && (
                <div>
                    {question.options.map((option, index) => (
                        <label key={index}>
                            <input type="radio" name="answer" value={option} /> {option}
                        </label>
                    ))}
                </div>
            )}
            {question.type === 'fill-in-the-blank' && (
                <input type="text" placeholder="Enter your answer" />
            )}
            <button>Next</button>
        </div>
    );
}

export default QuestionDisplay;
