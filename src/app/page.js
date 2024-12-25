'use client';

import React, { useState } from 'react';
import './App.css';  // Import CSS để tạo kiểu dáng cho giao diện

// Hàm tính nghịch đảo ma trận 2x2 modulo 26
function modInverse(a, m) {
    a = a % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) {
            return x;
        }
    }
    return -1;
}

// Hàm tính nghịch đảo ma trận 2x2
function inverseMatrix2x2(matrix) {
    const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    const inverseDet = modInverse(determinant, 26);
    
    if (inverseDet === -1) {
        throw new Error("Ma trận không khả nghịch");
    }

    return [
        [(matrix[1][1] * inverseDet) % 26, (-matrix[0][1] * inverseDet) % 26],
        [(-matrix[1][0] * inverseDet) % 26, (matrix[0][0] * inverseDet) % 26]
    ];
}

// Hàm tính nghịch đảo ma trận 3x3
function inverseMatrix3x3(matrix) {
    const determinant = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                        matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                        matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
    const inverseDet = modInverse(determinant, 26);

    if (inverseDet === -1) {
        throw new Error("Ma trận không khả nghịch");
    }

    const adjugate = [
        [
            (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) % 26,
            -(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]) % 26,
            (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) % 26
        ],
        [
            -(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) % 26,
            (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) % 26,
            -(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]) % 26
        ],
        [
            (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]) % 26,
            -(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0]) % 26,
            (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % 26
        ]
    ];

    const inverseMatrix = adjugate.map(row => row.map(value => (value * inverseDet) % 26));

    return inverseMatrix;
}


// Chuyển đổi văn bản thành mảng các số tương ứng
function stringToMatrix(str, size) {
    let result = [];
    let letters = str.toUpperCase().replace(/[^A-Z]/g, ''); // Lọc bỏ các ký tự không phải chữ cái
    while (letters.length % size !== 0) {
        letters += 'X';  // Thêm 'X' nếu chiều dài không chia hết cho size
    }

    for (let i = 0; i < letters.length; i += size) {
        const matrixRow = [];
        for (let j = 0; j < size; j++) {
            matrixRow.push(letters.charCodeAt(i + j) - 65);
        }
        result.push(matrixRow);
    }

    return result;
}

// Nhân ma trận với vector
function multiplyMatrixAndVector(matrix, vector) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
        result.push(matrix[i].reduce((sum, value, index) => (sum + value * vector[index]) % 26, 0));
    }
    return result;
}

// Hàm mã hóa Hill Cipher
function hillEncrypt(text, keyMatrix, size) {
    const messageMatrix = stringToMatrix(text, size);
    const encryptedMessage = [];
    for (let i = 0; i < messageMatrix.length; i++) {
        const encryptedRow = multiplyMatrixAndVector(keyMatrix, messageMatrix[i]);
        encryptedMessage.push(encryptedRow);
    }

    return encryptedMessage
        .flat()
        .map(num => String.fromCharCode(num + 65))
        .join('');
}

// Hàm giải mã Hill Cipher
function hillDecrypt(text, keyMatrix, size) {
    const inverseKey = size === 2 ? inverseMatrix2x2(keyMatrix) : inverseMatrix3x3(keyMatrix);
    const messageMatrix = stringToMatrix(text, size);
    const decryptedMessage = [];
    for (let i = 0; i < messageMatrix.length; i++) {
        const decryptedRow = multiplyMatrixAndVector(inverseKey, messageMatrix[i]);
        decryptedMessage.push(decryptedRow);
    }

    return decryptedMessage
        .flat()
        .map(num => String.fromCharCode(num + 65))
        .join('');
}


//GIAODIENUNGDUNG
function App() {
    const [inputText, setInputText] = useState('');
    const [keyMatrix, setKeyMatrix] = useState('');  // Ma trận khóa 2x2
    const [encryptedText, setEncryptedText] = useState('');
    const [decryptedText, setDecryptedText] = useState('');
    const [size, setSize] = useState(2);  // Mặc định là ma trận 2x2

    const handleEncrypt = () => {
        const matrix = parseKeyMatrix(keyMatrix, size);
        const encrypted = hillEncrypt(inputText, matrix, size);
        setEncryptedText(encrypted);
    };

    const handleDecrypt = () => {
        const matrix = parseKeyMatrix(keyMatrix, size);
        const decrypted = hillDecrypt(encryptedText, matrix, size);
        setDecryptedText(decrypted);
    };

    const parseKeyMatrix = (keyStr, size) => {
        const numbers = keyStr.split(',').map(Number);
        const matrix = [];
        let index = 0;
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                row.push(numbers[index++]);
            }
            matrix.push(row);
        }
        return matrix;
    };

    return (
        <div className="App">
            <h1>Ứng Dụng Mật Mã Hill</h1>

            <div>
                <label>Nhập văn bản:</label>
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập văn bản để mã hóa"
                />
            </div>

            <div>
                <label>Ma trận khóa:</label>
                <input 
                    type="text" 
                    value={keyMatrix}
                    onChange={(e) => setKeyMatrix(e.target.value)}
                    placeholder="Nhập từ trái sang phải theo chiều ngang"
                />
            </div>

            <div>
                <label>Chọn kích thước ma trận:</label>
                <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                    <option value={2}>2x2</option>
                    <option value={3}>3x3</option>
                    <option value={4}>4x4</option>
                </select>
            </div>

            <div>
                <button onClick={handleEncrypt}>Mã hóa</button>
                <button onClick={handleDecrypt}>Giải mã</button>
            </div>

            <div>
                <p><strong>Văn bản mã hóa:</strong> {encryptedText}</p>
                <p><strong>Văn bản giải mã:</strong> {decryptedText}</p>
            </div>
            
        </div>
        
        
    );
}

export default App;