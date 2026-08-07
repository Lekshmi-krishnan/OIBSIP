document.addEventListener('DOMContentLoaded', function () {
    const previousDisplay = document.getElementById('previous-display');
    const currentDisplay = document.getElementById('current-display');

    let currentOperand = '0';
    let previousOperand = '';
    let operation = null;
    let resetNextInput = false;

    function updateDisplay() {
        currentDisplay.textContent = currentOperand;
        if (operation != null) {
            previousDisplay.textContent = `${previousOperand} ${operation}`;
        } else {
            previousDisplay.textContent = '';
        }
    }

    function clear() {
        currentOperand = '0';
        previousOperand = '';
        operation = null;
        resetNextInput = false;
        updateDisplay();
    }

    function deleteLast() {
        if (currentOperand === 'Error: Division by 0') {
            clear();
            return;
        }
        if (resetNextInput) {
            currentOperand = '0';
            resetNextInput = false;
            updateDisplay();
            return;
        }
        if (currentOperand.length === 1 || currentOperand === '0') {
            currentOperand = '0';
        } else {
            currentOperand = currentOperand.slice(0, -1);
        }
        updateDisplay();
    }

    function appendNumber(number) {
        if (currentOperand === 'Error: Division by 0') {
            currentOperand = '';
            resetNextInput = false;
        }
        if (resetNextInput) {
            currentOperand = '';
            resetNextInput = false;
        }
        if (number === '.' && currentOperand.includes('.')) return;
        if (currentOperand === '0' && number !== '.') {
            currentOperand = number;
        } else {
            currentOperand += number;
        }
        updateDisplay();
    }

    function compute() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    currentOperand = 'Error: Division by 0';
                    previousOperand = '';
                    operation = null;
                    resetNextInput = true;
                    updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        computation = Math.round(computation * 1e10) / 1e10;
        currentOperand = computation.toString();
        operation = null;
        previousOperand = '';
        resetNextInput = true;
        updateDisplay();
    }

    function chooseOperation(op) {
        if (currentOperand === 'Error: Division by 0') return;
        if (currentOperand === '' && previousOperand === '') return;

        if (previousOperand !== '' && currentOperand !== '' && !resetNextInput) {
            compute();
        }

        if (currentOperand === 'Error: Division by 0') return;

        operation = op;
        previousOperand = currentOperand;
        resetNextInput = true;
        updateDisplay();
    }

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            const number = button.getAttribute('data-number');
            const operator = button.getAttribute('data-operator');
            const action = button.getAttribute('data-action');

            if (number !== null) {
                appendNumber(number);
            } else if (operator !== null) {
                chooseOperation(operator);
            } else if (action === 'clear') {
                clear();
            } else if (action === 'delete') {
                deleteLast();
            } else if (action === 'equals') {
                compute();
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
            appendNumber(e.key);
        } else if (e.key === '+' || e.key === '-') {
            chooseOperation(e.key === '-' ? '−' : '+');
        } else if (e.key === '*') {
            chooseOperation('×');
        } else if (e.key === '/') {
            e.preventDefault();
            chooseOperation('÷');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            compute();
        } else if (e.key === 'Backspace') {
            deleteLast();
        } else if (e.key === 'Escape') {
            clear();
        }
    });
});
