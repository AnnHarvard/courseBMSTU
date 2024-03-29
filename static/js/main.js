// просьба сильно не редачить эту красоту :)

// функция смены шаблона страницы ввода алгоритма
var route = {
    dm: '/topological_sort/demukron',
    dfs: '/topological_sort/depth_first_search',
    ml: '/strong_connectivity/malgrange',
    ks: '/strong_connectivity/kosaraju',
    pr: '/minimal_spanning_tree/prim',
    kr: '/minimal_spanning_tree/kraskal',
    ds: '/shortest_path/dijkstra',
    bf: '/shortest_path/bellman–ford',
    fl: '/shortest_path/floyd_warshall',
};


function setDbdata(id)
{
    dataToSend = {
        alg_code: id
    };
    
    // отправляем информацию на сервер
    fetch('/set_dbdata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // заголовок для корректного распознавания даннных на сервере
        },
        body: JSON.stringify(dataToSend) // отправляем данные
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Произошла ошибка при получении данных');
        }
        return response.json();
    })
    .then(data => {
        // Действия с полученными данными data
        console.log('Данные успешно получены:', data);
        // Перенаправление на другую страницу
        window.location.href = route[id];
    })
    .catch(error => {
        console.error('Произошла ошибка:', error);
    });
}

    // .then(response => response.json())
    // .then(data => {
    //     var desc = document.getElementById('alg_desc');
    //     desc.textContent = data.db_alg // обновление содержимого элемента с id 'alg_desc'
    // })
    // .catch(error => {
    //     console.error('Произошла ошибка при получении данных:', error);
    // });

function changeTemplate(id, id_desc, text)
{
    var title = document.querySelector('.algorithmTitle'); // получени элемента по имени класса
    if (title) {
        title.textContent = text; // смена заголовка
        title.id = id;
    }

    var link = document.getElementById('getResult');
    if (link) {
        link.href = route[id]
    }

    // Получить все элементы <p> внутри <div> с классом algorithmDesc
    var desc = document.querySelectorAll('.algorithmDesc');

    // Перебрать полученные элементы и скрыть их
    if (desc.length > 0) {
        // Перебрать полученные элементы и добавить класс 'hidden', чтобы скрыть их
        desc.forEach(function(element) {+
            element.classList.add('hidden'); // Добавить класс 'hidden' для скрытия элементов <p>
        });
    } else {
        console.log('Элементы не найдены'); // Вывести сообщение об отсутствии элементов
    }
    document.getElementById(id_desc).classList.remove('hidden')
}

// считывание матрицы для обработки
function get_matrix()
{
    // отключение ввода
    var inputs = document.querySelectorAll('#matrix-table input[type="text"], #matrix-table input[type="checkbox"]');
    inputs.forEach(function(input) {
        input.disabled = true; // отключить возможность ввода
    });

    var matrixSize = document.getElementById('range_size_of_matrix').value // размер матрицы

    var matrixData = [] // пустая матрица

    // Получаем значения из полей ввода и добавляем их в двумерный массив matrixData
    for (var i = 1; i <= matrixSize; i++) {
        var row = [] // пустой одномерный массив

        for (var j = 1; j <= matrixSize; j++) {
            var input = document.getElementsByName('matrixCell' + i + '_' + j)[0];
            var type = input.type
            if (type == 'text')
                row.push(Number(input.value)) // добавляем значения в одномерный массив
            else if (type == 'checkbox') 
                row.push(Number(input.checked))              
        }
        matrixData.push(row) // добавляем одномерный массив в матрицу
    }

    var dataToSend = {
        size: matrixSize,
        matrix: matrixData
    };

    // отправляем данные на сервер
    fetch('/set_data_to_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // заголовок для корректного распознавания даннных на сервере
        },
        body: JSON.stringify(dataToSend) // отправляем данные
    })

    document.getElementById('send-btnContainer').classList.add('hidden') // прячем кнопки ввода матрицы

    var buttonContainer = document.getElementById('change-btnContainer');
    buttonContainer.classList.remove('hidden')

}

// изменение матрицы
function edit_matrix(clear = true) 
{
    var inputs = document.querySelectorAll('#matrix-table input[type="text"], #matrix-table input[type="checkbox"]');
    if (clear) {
        inputs.forEach(function(input) {
            input.value = ''; // очистить содержимое input
            input.checked = false; // снять галочку, если это checkbox
        });   
    } else {
        inputs.forEach(function(input) {
            if (!input.classList.contains('blocked'))
                input.disabled = false; // включить возможность ввода
        });
        document.getElementById('send-btnContainer').classList.remove('hidden') // возвращаем кнопки ввода матрицы
        document.getElementById('change-btnContainer').classList.add('hidden') // прячем кнопки получения результата
    }
}

function back_to_size() 
{
    document.getElementById('changeMatrixSizeLink').classList.add('hidden')
    document.getElementById('matrix_input').classList.add('hidden')
    document.getElementById('matrix_size_div').classList.remove('hidden')
}

// формирование таблицы
// diag = false/true - разблокирована/диагональ заблокирована
// bin = false/true - обычная с весами/бинарная
function show_matrix(blockDiag = false, bin = false)
{
    sizeButton = document.getElementById('changeMatrixSizeLink')
    sizeButton.classList.remove('hidden')
    sizeButton.addEventListener('click', function() {
        back_to_size(); // добавление функции get_matrix()
    });

    var size = document.getElementById('range_size_of_matrix').value // размер матрицы
    document.getElementById('matrix_size_div').classList.add('hidden') // прячем блок ввода размера матрицы

    var matrixContainer = document.getElementById('matrix_input'); // блок для вставки матрицы
    matrixContainer.innerHTML = ''
    matrixContainer.classList.remove('hidden')
    matrixContainer.classList.add('flex', 'flex-col', 'justify-center', 'items-center', 'mb-5');
    matrixContainer.style.width = '100px';


    // создаем таблицу для матрицы смежности
    var table = document.createElement('table');
    table.id = 'matrix-table'

    // заголовок таблицы
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var emptyHeaderCell = document.createElement('th');
    headerRow.appendChild(emptyHeaderCell); //пустая ячейка в верхнем левом углу

    // Заголовки столбцов (вершины)
    for (var i = 1; i <= size; i++) {
        var vertexHeaderCell = document.createElement('td');
        index = i - 1;
        vertexHeaderCell.textContent = 'x' + index;
        vertexHeaderCell.classList.add('dark:text-gray-400')
        headerRow.appendChild(vertexHeaderCell);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    var tbody = document.createElement('tbody');
    for (var i = 1; i <= size; i++) {
        var row = document.createElement('tr');
        var vertexCell = document.createElement('td');
        index = i - 1;
        vertexCell.textContent = 'x' + index; // подписи вершин (строки)
        vertexCell.classList.add('dark:text-gray-400')
        row.appendChild(vertexCell);

        // Ячейки матрицы для ввода данных (input)
        for (var j = 1; j <= size; j++) {
            var cell = document.createElement('td');
            var input = document.createElement('input');
            if (!bin)
                input.type = 'text';
            else
                input.type = 'checkbox';
            input.name = 'matrixCell' + i + '_' + j;
            input.classList.add('dark:bg-gray-800')
            if (blockDiag && i == j) { // блокировка диагонали
                input.disabled = true;
                input.value = 0;
                input.className = "blocked"
                input.classList.add('bg-gray-500')
            } 
            cell.appendChild(input);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    matrixContainer.appendChild(table);

    // разрешения на ввод только чисел
    matrixContainer.addEventListener('input', function(event) {
        var target = event.target;
    
        if (target.tagName === 'INPUT') {
            var inputValue = target.value;
            // Разрешаем только цифры и числа до 999
            if (!/^\d{1,3}$/.test(inputValue)) {
                // Очищаем поле ввода от некорректных символов
                target.value = inputValue.replace(/\D/g, '').slice(0, 3); // Ограничиваем ввод до 3 символов
            }
        }
    });

    var buttonContainer = document.createElement('div');
    buttonContainer.id = "send-btnContainer"
    buttonContainer.className = 'flex items-center justify-between'; // используем flex для размещения кнопок

    // создание кнопки ввода
    var button = document.createElement('button');
    button.id = 'sendMatrixBtn';
    button.type = 'button';
    button.className = 'text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 mt-2 text-center' ;
    button.textContent = 'Ввести';
    button.addEventListener('click', function() {
        get_matrix(); // добавление функции get_matrix()
    });

    // создание кнопки очитски
    var clearButton = document.createElement('button');
    clearButton.id = 'clearMatrixBtn';
    clearButton.type = 'button';
    clearButton.className = "text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" ;
    clearButton.textContent = 'Очистить';
    clearButton.addEventListener('click', function() {
        edit_matrix(); // добавление функции edit_matrix()
    });

    buttonContainer.appendChild(clearButton); // Добавление кнопки "Ввести" в контейнер
    buttonContainer.appendChild(button); // Добавление кнопки "Очистить" в контейнер
    matrixContainer.appendChild(buttonContainer); // Добавление контейнера с кнопками на страницу

    var buttonContainer = document.createElement('div');
    buttonContainer.id = "change-btnContainer"
    buttonContainer.className = 'flex items-center justify-between'; // используем flex для размещения кнопок

    // создание ссылки на результат
    var link = document.createElement('a');
    link.id = 'getResult';
    link.className = 'block text-center font-medium text-blue-600 dark:text-blue-500 hover:underline';
    link.textContent = 'Посмотреть результат';

    var title = document.querySelector('.algorithmTitle'); // получени элемента по имени класса
    link.href = route[title.id]

    // кнопка изменения матрицы
    var changeButton = document.createElement('button');
    changeButton.id = 'changeMatrixBtn';
    changeButton.type = 'button';
    changeButton.className = "text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" ;
    changeButton.textContent = 'Изменить';
    changeButton.addEventListener('click', function() {
        edit_matrix(false); // добавление функции edit_matrix()
    });

    buttonContainer.appendChild(changeButton); // Добавление кнопки "Ввести" в контейнер
    buttonContainer.appendChild(link); // добавление ссылки на страницу
    buttonContainer.classList.add('hidden')
    matrixContainer.appendChild(buttonContainer); // Добавление контейнера с кнопками на страницу
}


function change_Size(element)
{
    var size = element.value
    document.getElementById('label_size_of_matrix').textContent = `Размер матрицы: ${size}`
}

function set_theme()
{
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-toggle-light-icon').classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-toggle-dark-icon').classList.remove('hidden');
    }
}

function change_theme()
{
    var themeToggleBtn = document.getElementById('theme-toggle');
    var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
            localStorage.theme = 'light';
        }

    // if NOT set via local storage previously
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
            localStorage.theme = 'dark';
        }
    }
}








// Binary Tree
function traverseTree(traversalType,highlightColor) {
    fetch(`/traversal/traversal_selected?traversal_type=${traversalType}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    })
        .then(response => response.json())
        .then(data => {
            console.log(`Traversal order (${traversalType}):`, data.traversal_order);
            var traversalOrder = data.traversal_order;
            //console.log("Массив узлов для обхода в ширину:", traversalOrder);
            highlightNodes(network, traversalOrder,highlightColor)        })
        .catch(error => console.error('Ошибка:', error));
}

var isHighlighting = false; // Переменная для отслеживания состояния подсветки
var currentHighlightIndex; // Текущий индекс подсвечиваемой вершины
var timeout; // Переменная для хранения таймаута
var selectedSpeed = 200;  // Значение по умолчанию



function highlightNodes(network, traversalOrder, highlightColor) {
    // Если подсветка уже идет, прервать текущий процесс и начать новый
    var originalColor = options.nodes.color.background;
    network.unselectAll();

    if (isHighlighting) {
        console.log(traversalOrder[currentHighlightIndex])
        //network.body.data.nodes.update({ id: traversalOrder[currentHighlightIndex], color: { background: originalColor     } });
        traversalOrder.forEach(function(nodeId){
            network.body.data.nodes.update({ id: nodeId, color: { background: originalColor } });

        })

        stopHighlighting();
    }

    // Установить флаг, что начата подсветка
    isHighlighting = true;
    currentHighlightIndex = 0;

    // Инициализация цвета подсветки
    var highlightColor = highlightColor; // оранжевый
    // Функция для изменения цвета вершины и возврата к исходному
    function highlightNode(nodeId) {
        

        // Изменение цвета на подсветку
        network.body.data.nodes.update({ id: nodeId, color: { background: highlightColor } });

        // Ждем 3 секунды, затем возвращаем исходный цвет
        timeout = setTimeout(function() {
            network.body.data.nodes.update({ id: nodeId, color: { background: originalColor } });

            // Переходим к следующей вершине
            currentHighlightIndex++;
            if (currentHighlightIndex < traversalOrder.length) {
                highlightNode(traversalOrder[currentHighlightIndex]);
            } else {
                // Если достигнут конец массива, завершаем подсветку
                stopHighlighting();
            }
        }, selectedSpeed);
    }

    // Запуск подсветки для текущей вершины
    highlightNode(traversalOrder[currentHighlightIndex]);
}

function stopHighlighting() {
    // Очистить таймаут, чтобы прервать текущую подсветку
    clearTimeout(timeout);
    // Сбросить флаг и текущий индекс
    isHighlighting = false;
    currentHighlightIndex = undefined;
}

// document.addEventListener('DOMContentLoaded', function () {
//     // Находим элемент слайдера по идентификатору
//     var speedSlider = document.getElementById('speedSlider');

//     // Добавляем слушатель событий для отслеживания изменений значения слайдера
//     speedSlider.addEventListener('input', function () {
//         // Получаем текущее значение слайдера
//         var speedValue = parseInt(speedSlider.value);
//         selectedSpeed=speedValue

//         // Выводим значение в консоль (вы можете использовать его в вашей логике обхода)
//         console.log('Selected speed:', speedValue);
//     });
// });

function buildTree(nodeData, nodes, edges, parentID){
    // Проверка, является ли узел пустым
    if (nodeData === null) {
        return [];
    }

    // Создание нового узла
    if (nodeData.color==''){
      var node = { id: parentID, label: String(nodeData.value)};
    }
    else {
      var node = { id: parentID, label: String(nodeData.value),color:nodeData.color};
    }

    

    // Добавление узла в набор данных nodes
    nodes.add(node);

    // Рекурсивный вызов для левого потомка
    var leftChildNodes = buildTree(nodeData.left, nodes, edges, 2*parentID);

    // Если есть левый потомок, добавить ребро
    if (leftChildNodes.length > 0) {
        edges.add({ from: node.id, to: leftChildNodes[0].id });
        if (nodeData.right===null){
            nodes.add({id:node.id*2+1, color: {
                background: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет фона
                highlight: 'rgba(0,0,0,0)'  ,
                hover: 'rgba(0,0,0,0)',
              },
                font: {
                    color: 'rgba(0, 0, 0, 0)'  // Прозрачный цвет текста
                },
                borderWidth: 0 , // Устанавливаем толщину обводки в 0, чтобы сделать ее прозрачной
                highlight: 'rgba(0, 0, 0, 0)',});
            edges.add({ from: node.id, to: node.id*2+1, 
                    color: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет ребра
                    highlight: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет при выделении (если нужно)
            })

        }
    }

    // Рекурсивный вызов для правого потомка
    var rightChildNodes = buildTree(nodeData.right, nodes, edges, 2*parentID+1);

    // Если есть правый потомок, добавить ребро
    if (rightChildNodes.length > 0) {
        
        if (nodeData.left===null){
            nodes.add({id:node.id*2, color: {
                background: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет фона
                highlight: 'rgba(0,0,0,0)',
                hover: 'rgba(0,0,0,0)'
                },
                font: {
                    color: 'rgba(0, 0, 0, 0)'  // Прозрачный цвет текста
                },
                borderWidth: 0 , // Устанавливаем толщину обводки в 0, чтобы сделать ее прозрачной
                highlight: 'rgba(0, 0, 0, 0)',});
            edges.add({ from: node.id, to: node.id*2, 
                    color: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет ребра
                    highlight: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет при выделении (если нужно)
            })
        }
        edges.add({ from: node.id, to: rightChildNodes[0].id });
    }

    // Вернуть объединенный массив узлов
    return [node].concat(leftChildNodes, rightChildNodes);
} 

  








// function buildTree(nodeData, nodes, edges, parentID){ //функция для рекурсивного построения дерева
//     // Проверка, является ли узел пустым
//     if (nodeData === null) {
//         return [];
//     }

//     // Создание нового узла
//     var node = { id: parentID, label: String(nodeData.value)};
    

//     // Добавление узла в набор данных nodes
//     nodes.add(node);

//     // Рекурсивный вызов для левого потомка
//     var leftChildNodes = buildTree(nodeData.left, nodes, edges, 2*parentID);

//     // Если есть левый потомок, добавить ребро
//     if (leftChildNodes.length > 0) {
//         edges.add({ from: node.id, to: leftChildNodes[0].id });
//         if (nodeData.right===null){
//             nodes.add({id:node.id*2+1, color: {
//                 background: 'rgba(0, 0, 0, 0)'  // Прозрачный цвет фона
//                 },
//                 font: {
//                     color: 'rgba(0, 0, 0, 0)'  // Прозрачный цвет текста
//                 },
//                 borderWidth: 0 , // Устанавливаем толщину обводки в 0, чтобы сделать ее прозрачной
//                 highlight: 'rgba(0, 0, 0, 0)',});
//             edges.add({ from: node.id, to: node.id*2+1, 
//                     color: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет ребра
//                     highlight: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет при выделении (если нужно)
//             })

//         }
//     }

//     // Рекурсивный вызов для правого потомка
//     var rightChildNodes = buildTree(nodeData.right, nodes, edges, 2*parentID+1);

//     // Если есть правый потомок, добавить ребро
//     if (rightChildNodes.length > 0) {
        
//         if (nodeData.left===null){
//             nodes.add({id:node.id*2, color: {
//                 background: 'rgba(0, 0, 0, 0)'  // Прозрачный цвет фона
//                 },
//                 font: {
//                     color: 'rgba(0, 0, 0, 0)'  // Прозрачный цвет текста
//                 },
//                 borderWidth: 0 , // Устанавливаем толщину обводки в 0, чтобы сделать ее прозрачной
//                 highlight: 'rgba(0, 0, 0, 0)',});
//             edges.add({ from: node.id, to: node.id*2, 
//                     color: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет ребра
//                     highlight: 'rgba(0, 0, 0, 0)',  // Прозрачный цвет при выделении (если нужно)
//             })
//         }
//         edges.add({ from: node.id, to: rightChildNodes[0].id });
//     }

//     // Вернуть объединенный массив узлов
//     return [node].concat(leftChildNodes, rightChildNodes);
// }

let steps = []; // Глобальный массив для хранения шагов
  let currentStepIndex = -1; // Текущий индекс шага

  let cellCounter = 2; // Инициализация счетчика

async function saveArrayAndFetchSteps(event) {
    // Ваш массив для сохранения
    // Получаем все элементы с id, начинающимся с "cell-"
    const cells = document.querySelectorAll('[id^="cell-"]');
    
    // Инициализируем массив для хранения значений
    const valuesArray = [];

    // Проходим по каждой ячейке и добавляем значение в массив
    cells.forEach((cell, index) => {
      const inputElement = cell.querySelector('input');
      const numericValue = inputElement.value; // Преобразование в число
      console.log(numericValue);
      inputElement.setAttribute('readonly', 'readonly');
      valuesArray.push(numericValue);
    });

    // Также можно скрыть кнопку добавления ячейки, если нужно
    
  
    // Сначала сохраняем массив в сессии
    const saveArrayResponse = await fetch('/sorting_array/save_array_to_session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ array: valuesArray }),
    });
  
    // Получаем элемент, на котором произошло событие
    const clickedButton = event.target;

    // Получаем id кнопки
    const buttonId = clickedButton.id;
    let getStepsResponse;
    // После успешного сохранения, запрашиваем шаги
    if (saveArrayResponse.ok) {
      if (buttonId==="buttonSearchTreeSort"){
        getStepsResponse = await fetch('/sorting_array/search_tree_sort');
      }
      else if(buttonId==="buttonTournamentSort") {
        getStepsResponse = await fetch('/sorting_array/tournament_sort');
      }
      
      if (getStepsResponse.ok) {
        const Newsteps = await getStepsResponse.json();
        steps=Newsteps;
        console.log(steps);
        currentStepIndex = 0; // Сбрасываем индекс текущего шага
       console.log(currentStepIndex);
         printCurrentStep(); // Вызываем функцию для вывода первого шага
        // Здесь можно выполнить дополнительные действия с полученными шагами

        // displayEmptyArray();

      } else {
        console.error('Ошибка при получении шагов:', getStepsResponse.statusText);
      }
    } else {
      console.error('Ошибка при сохранении массива в сессии:', saveArrayResponse.statusText);
    }
  }

  function displayFirstArray() {
    const inputArray = document.getElementById('inputArray');
    const firstArray = document.getElementById('firstArray');

    // Клонируем исходный массив
    const clonedInputArray = inputArray.cloneNode(true);

    // Удаляем атрибут id у клонированных ячеек, чтобы избежать дублирования id
    const clonedCells = clonedInputArray.querySelectorAll('[id^="cell-"]');
    clonedCells.forEach(cell => {
      const currentId = cell.id;
      const newId = 'first_' + currentId; // Добавляем префикс "new_" к текущему id
      cell.id = newId; // Устанавливаем новый id для клонированной ячейки
    });

     // Очищаем значения во всех клонированных инпутах
     const clonedInputArrayInputs = clonedInputArray.querySelectorAll('input');
     clonedInputArrayInputs.forEach(input => {
         input.value = ''; // Очищаем значение инпута
     });

    // Показываем клонированный массив и добавляем его в блок с пустым массивом
    //clonedGrid.style.display = 'flex';
    firstArray.innerHTML = '';

    // Показываем клонированный массив и добавляем его в блок с пустым массивом
    firstArray.appendChild(clonedInputArray);
  }

  function displaySecondArray() {
    const inputArray = document.getElementById('inputArray');
    const secondArray = document.getElementById('secondArray');

    // Клонируем исходный массив
    const clonedInputArray = inputArray.cloneNode(true);

    // Удаляем атрибут id у клонированных ячеек, чтобы избежать дублирования id
    const clonedCells = clonedInputArray.querySelectorAll('[id^="cell-"]');
    clonedCells.forEach(cell => {
      const currentId = cell.id;
      const newId = 'second_' + currentId; // Добавляем префикс "new_" к текущему id
      cell.id = newId; // Устанавливаем новый id для клонированной ячейки
    });

     // Очищаем значения во всех клонированных инпутах
     const clonedInputArrayInputs = clonedInputArray.querySelectorAll('input');
     clonedInputArrayInputs.forEach(input => {
         input.value = ''; // Очищаем значение инпута
     });

    // Показываем клонированный массив и добавляем его в блок с пустым массивом
    //clonedGrid.style.display = 'flex';
    secondArray.innerHTML = '';

    // Показываем клонированный массив и добавляем его в блок с пустым массивом
    secondArray.appendChild(clonedInputArray);
  }

  function printCurrentStep() {
    if (currentStepIndex >= 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      console.log('Текущий шаг:', currentStep);
  

      if (currentStep.cell_colors &&currentStep.binary_tree) {
        console.log(currentStep.binary_tree)

        data.nodes.clear();
        data.edges.clear();

        stepDescription.textContent=currentStep.description;
        stepCounterLabel.textContent = `Шаг ${currentStepIndex + 1}`;

        buildTree(currentStep.binary_tree, data.nodes, data.edges, 1)  
        
        // Обновление цвета ячеек на основе данных из cell_colors
        updateCellColors(currentStep.cell_colors);
        updateFirstCellColors(currentStep.first_cell_colors,currentStep.first_cell_values);
        updateSecondColors(currentStep.second_cell_colors);

        const positions = network.getPositions();
      } else {
        console.error('Структура данных текущего шага не содержит node_colors');
      }
    } else {
      console.error('Некорректный индекс текущего шага:', currentStepIndex);
    }
  }

  function updateCellColors(cellColors) {
    if (!cellColors) {
      return;
    }
  
    // Удаление цвета у всех прошлых ячеек
    const allCells = document.querySelectorAll('[id^="cell-"]');
    allCells.forEach(cellElement => {
      // Находим вложенный элемент input внутри div
      const inputElement = cellElement.querySelector('input');
      
      if (inputElement) {
        inputElement.style.backgroundColor = ''; // или другой цвет по умолчанию
      }
    });

    // Обновите цвет каждой ячейки на основе данных из cell_colors
    Object.keys(cellColors).forEach(cellId => {
      const color = cellColors[cellId];
      const cellElement = document.getElementById("cell-"+cellId);
  
      if (cellElement) {
        // Находим вложенный элемент input внутри div
        const inputElement = cellElement.querySelector('input');

        if (inputElement) {
            // Обновляем цвет фона для элемента input
            inputElement.style.backgroundColor = color;
          }

      }
    });
  }

  function updateFirstCellColors(cellColors,cellValues) {
    if (!cellColors) {
      return;
    }
  
    // Удаление цвета у всех прошлых ячеек
    // const allCells = document.querySelectorAll('[id^="first_cell-"]');
    // allCells.forEach(cellElement => {
    //   // Находим вложенный элемент input внутри div
    //   const inputElement = cellElement.querySelector('input');
      
    //   if (inputElement) {
    //     inputElement.style.backgroundColor = ''; // или другой цвет по умолчанию
    //   }
    // });

    // Обновите цвет каждой ячейки на основе данных из cell_colors
    Object.keys(cellColors).forEach(cellId => {
      const color = cellColors[cellId];
      const value = cellValues[cellId]
      const cellElement = document.getElementById("first_cell-"+cellId);
  
      if (cellElement) {
        // Находим вложенный элемент input внутри div
        const inputElement = cellElement.querySelector('input');

        if (inputElement) {
            // Обновляем цвет фона для элемента input
            inputElement.style.backgroundColor = color;
            inputElement.value=value;
          }

      }
    });
  }