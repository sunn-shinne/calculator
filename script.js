const outputText =  document.querySelector('textarea')
let flag = false
let start = false
let wait = true
let actual = 0
let pendingOp = ''
let elem = ''
let oldElem
let countClick = 0

// пункт истории
function Expression(a ='', sign = '', b ='', c ='') {
    this.first = a;
    this.operation = sign;
    this.second = b;
    this.result = c;
}

// вывод пункта истории
function print(obj) {
    if (obj.result == '') return ('')
    else if (obj.operation != ('1/x') && obj.operation != ('radic') && obj.operation != ('')) {
        return (obj.first + ' ' + obj.operation + ' ' + obj.second + '\n= ' + obj.result)
    }
    else if (obj.operation == '1/x') {
        return (obj.first + '^(-1)' + '\n= ' + obj.result)
    }
    else if (obj.operation == 'radic') {
        return ('&radic;' + obj.first + '\n= ' + obj.result)
    }
};

let temp = new Expression() 

// создаение истории
cache = JSON.parse((localStorage.getItem('lastHist')))
if (cache == undefined) {
    cache = []
    for (let i = 0; i <= 6; i++) {
        cache[i] = new Expression
    }
    document.querySelector('.clearHistory').setAttribute('disabled', 'true')
}
else printHistory()


// обновление истории
function printHistory() {
    cache.forEach((item, i, arr) => {
        let str = print(cache[i])
        document.querySelectorAll('.historyPoint')[i].innerHTML = str
    })
    if (start) localStorage.setItem('lastHist', JSON.stringify(cache))
    document.querySelector('.clearHistory').removeAttribute('disabled')
}

// очистка истории
function clearHistory() {
    cache = []
    for (let i = 0; i <= 6; i++) {
        cache[i] = new Expression
    }
    localStorage.removeItem('lastHist')
    printHistory()
    document.querySelector('.clearHistory').setAttribute('disabled', 'true')
}

// выбор значения из истории
function choosePastValue(str) {
    start = true
    let index = str.indexOf('=')
    outputText.value = str.slice( index + 1 )
    countClick = str.slice( index + 1 ).length
    if (pendingOp == '=') actual = str.slice( index + 1 )
}

///  ввод чисел
function numPressed(num) {
    start = true
	if (flag) {
		outputText.value = num
        flag = false
        countClick++
	}	
	else {
		if (outputText.value === '0') {
            outputText.value = num
            countClick++
        }
		else {
            outputText.value += num
            countClick++
        }
	}
}

// ввод чисел с клавиатуры
document.addEventListener('keyup', function(event) {
    start = true
    let num = '01234567890'
    let binSign = '/%+'
    if (num.includes(event.key)) {
        numPressed(event.key)
    } 
    else if (event.key == '-') {
        operationBin('–')
    }
    else if (event.key == '*') {
        operationBin('×')
    }
    else if (event.key == 'Enter') {
        operationBin('=')
    }
    else if (binSign.includes(event.key)) {
        operationBin(event.key)
    }
    else if (event.key == '.') {
        point()
    }
    else if (event.key == 'Backspace') {
        backspase()
    }
  })

/// бинарные действия
function operationBin(op) {
    if (start) {
        oldElem = elem
        elem = document.getElementById(op) 
    }

    let readout = outputText.value
    if (temp.result != '') {
        temp = new Expression
    }

	if (flag && pendingOp === "=") {
        outputText.value = rounding(actual)
        pendingOp = ''
    }
	else {
        if (countClick == 0){
            pendingOp = ''
        } 
		flag = true;
		if ( '+' === pendingOp ) {
            calculation()
        }
		else if ( '–' === pendingOp ) {
            calculation()
        }
        else if ( '×' === pendingOp ) {
            calculation()
        }
        else if ( '%' === pendingOp ) {
            calculation()
        }  
        else if ( '/' === pendingOp ) {
            if (readout != '0') {
                calculation()
            }  
            else error()
        }
        else actual = parseFloat(readout)

        // вывод ответа
        if (countClick == 0) {
            changeButton(oldElem, false)
        }
        else if (wait) {
            outputText.value = rounding(actual)
            countClick = 0
            //обновление истории
            if (temp.result != '') {
                cache.push(temp)
                cache.shift()    
                printHistory()
            } 
        }   
    }

// бинарный счет
function calculation () {
    actual = rounding(actual)
    temp.first = actual
    temp.second = readout
    switch (pendingOp) {
        case '+':
            actual += parseFloat(readout)
            break;
        case '-':
            actual -= parseFloat(readout)
            break;
        case '×':
            actual *= parseFloat(readout)
            break;
        case '%':
            actual = (actual/100)*parseFloat(readout)
            break;
        case '/':
            actual /= parseFloat(readout)
            break;
        default:
            break;
        }
        temp.result = rounding(actual)
    }


    // Изменение цвета кнопок
    if ( op != '=') {
        changeButton(elem, true)
        temp.operation = op
    }   
    else {
        changeButton(oldElem, false)
    }
    pendingOp = op
}

/// унарные действия
function operationUn(op) {
    if (temp.result != '') {
        temp = new Expression
    }

    if (op === 'radic') {
        if (parseFloat(outputText.value) >= 0) {
            temp.first = outputText.value
            outputText.value = rounding(Math.sqrt(outputText.value))
            temp.operation = op
            temp.result = outputText.value
            if (temp.result != '') {
                cache.push(temp)
                cache.shift()
                printHistory()
            } 
            actual = outputText.value
            changeButton(elem, false)
            pendingOp = ''
        }
        else if (outputText.value === ''){
            outputText.style.fontSize = '37px'
            outputText.value = 'введите значение'
            setTimeout(() => {
                outputText.value = ''
                outputText.style.fontSize = '50px'
            }, 1500)
        }
        else error()
    }

    else if (op === '1/x'){
        if ((outputText.value != '0') && (outputText.value != '')){
            temp.first = outputText.value
            outputText.value = rounding(1/outputText.value)
            temp.operation = op
            temp.result = outputText.value
            if (temp.result != '') {
                cache.push(temp)
                cache.shift()
                printHistory()
            } 
            actual = outputText.value
            pendingOp = ''
            changeButton(elem, false)
        }
        else if (outputText.value === ''){
            outputText.style.fontSize = '37px'
            outputText.value = 'введите значение'
            setTimeout(() => {
                outputText.value = ''
                outputText.style.fontSize = '50px'
            }, 1500)
        }
        else if (outputText.value === '0') error()
    }

    else if (op === '+/-') {
        actual *= -1
        outputText.value *= -1
    }
}

// округление
function rounding(actual){
    let afterPoint = ( (actual.toString().includes('.')) ? (actual.toString().split('.').pop().length) : (0) )
    if (afterPoint <= 5)
        return actual.toFixed(afterPoint)
    let temp = actual.toFixed(5)
    let i = 5
    while (temp == 0) {
        i++
        temp = actual.toFixed(i)
    }
    temp = parseFloat(temp)
    return actual = temp
}

/// добавление точки
function point() {
    let actReadOut = outputText.value
    if (flag) {
        actReadOut = '0.'
        flag = false
    }
    else {
        if (actReadOut.indexOf('.') == -1)
            actReadOut += '.'
    }
    outputText.value = actReadOut
}

/// ошибка
function error() {
    wait = false
    let oldValue = outputText.value
    outputText.style.fontSize = '35px'
    let newValue = 'недопустимое выражение'
    outputText.value = newValue
    setTimeout(() => {
        outputText.value = oldValue
        outputText.style.fontSize = '50px'
        wait = true
    }, 1500)
}

/// backspase
function backspase(){
    outputText.value = outputText.value.substring(0, outputText.value.length - 1)
    if (countClick > 0) countClick--
    if (pendingOp == '=') actual = outputText.value
}

/// очистка поля  CE 
function textClear() {
    outputText.value = '0'
    flag = true
}

// очистка всех даннных  C
function allTextClear() {
    actual = 0
    changeButton(elem, false)
    pendingOp = ''
    textClear()
}

// выделение пунктов истории
function choosePoint(point, key = true) {
    if (key && document.querySelectorAll('.historyPoint')[point].innerHTML != '') {
        document.querySelectorAll('.historyPoint')[point].style.border = '1px solid rgba(13, 16, 17, .5)'
        document.querySelectorAll('.historyPoint')[point].style.backgroundColor = 'rgba(231, 228, 227, .1)'
    }
    else if (document.querySelectorAll('.historyPoint')[point].innerHTML != '') {
        document.querySelectorAll('.historyPoint')[point].style.borderWidth = '0px'
        document.querySelectorAll('.historyPoint')[point].style.backgroundColor = '#5F787B'
    }
}

// выделение кнопки
function changeButton(button, key) {
    if (button != undefined) {
        if (key) {
            button.style.backgroundColor = '#EAB354'
            button.style.border = '1px solid #0D1011'
            button.style.color = '#262B2B'
            button.style.fontSize = '24px'
        }
        else {
            button.style.backgroundColor = 'rgba(38, 43, 43, .6)'
            button.style.border = '1px solid rgba(13, 16, 17, .5)'
            button.style.color = '#E7E4E3'
            button.style.fontSize = '30px' 
        }
    }
}