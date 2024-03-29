from flask import Flask, render_template, request, session, jsonify
import Algorithms.Strong_Connectivity as sc # импорт модуля Андрея
import Algorithms.Topological_Sort as ts # импорт модуля Кирилла
import Algorithms.Minimal_spanning_tree as st # импорт модуля Коли
import Algorithms.Binary_tree_search as bt
import ast

from flask_sqlalchemy import SQLAlchemy ## имплементация бд


app = Flask(__name__)
app.config.from_object('config')
app.secret_key = 'your_secret_key' # секретный ключ для подписы данных сессии

## имплементация бд
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://Bauman:Baumanpassword@localhost/GraphDB'
db = SQLAlchemy(app)

class Problem_class(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pr_cl = db.Column(db.Text, nullable=False)
    dsc = db.Column(db.Text)

    def __repr__(self):
        return f"Problem class: {self.pr_cl}"

class Algorithm (db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    alg = db.Column(db.Text, nullable=False)
    dsc = db.Column(db.Text)
    key = db.Column(db.Text, nullable=False)
    
    pr_cl_id = db.Column(db.Integer, db.ForeignKey('problem_class.id', ondelete='CASCADE'), nullable=False)
    
    def __repr__(self):
        return f"Algorithm: {self.alg}"
    
class Example (db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ex = db.Column(db.Text, nullable=False)
    dsc = db.Column(db.Text)

    alg_id = db.Column(db.Integer, db.ForeignKey('algorithm.id', ondelete='CASCADE'), nullable=False)
    
    def __repr__(self):
        return f"Example: {self.ex}"
## имплементация бд
    
binary_tree = bt.BinaryTree(10)
# binary_tree_array=bt.BinaryTree()


# начальная страница
@app.route('/')
def home():
    return render_template("index.html", show_alg_btn = [], title = 'Графы')

# универсальная функция для сохранения матрицы в сессии
@app.route('/set_data_to_session', methods=['POST'])
def set_data_to_session():
    data = request.get_json() # получаем данные
    matrix = data.get('matrix')
    size = data.get('size')
    session['matrix'] = matrix # сохранение матрицы в словаре "Session"
    session['size'] = size # сохранение матрицы в словаре "Session"

    print(f'Размер: {size}', f'Матрица: {matrix}', sep="\n") # тестовый вывод

    return 'Данные успешно получены на сервере' # требуется возврат текстового значения

# получение данных из БД
@app.route('/set_dbdata', methods=['POST'])
def set_dbdata():
    data = request.get_json() # получаем данные
    alg_code = data.get('alg_code') # получаем переданную строку
    # запрос для получения матрицы
    algos = Algorithm.query.filter_by(key = alg_code).first()
    matrix = Example.query.filter_by(alg_id = algos.id).first().ex # получение матрицы
    print(matrix)
    matrix = ast.literal_eval(matrix)
    print(matrix)
    session['matrix'] = matrix # сохранение матрицы в словаре "Session"
    print(session['matrix'])

    return jsonify({'dbData': alg_code})

# session['db_alg'] = Algorithm.query.filter_by(key = alg_code).first().dsc # сохранение экземпляра сущности Алгоритм в словаре "Session"
# session['db_class'] = Problem_class.query.filter_by(id = Algorithm.query.filter_by(key = alg_code).first().pr_cl_id).first().dsc # сохранение экземпляра сущности Алгоритм в словаре "Session"
    
# print(f'Класс алгоритма: {alg_code}', f'БД: {session["db_class"]}', sep="\n") # тестовый вывод
# print(f'Код алгоритма: {alg_code}', f'БД: {session["db_alg"]}', sep="\n") # тестовый вывод

# алгоритмы Даны
@app.route("/sorting_array")
def sorting_array():
    
    return render_template("binary_tree/sorting_array.html", title = 'Сортировка массива')

@app.route('/sorting_array/save_array_to_session', methods=['POST'])
def save_array_to_session():
    try:
        data = request.get_json()
        array_to_save = data.get('array')

        # Сохраняем массив в сессии
        session['your_array_key'] = array_to_save
        print("mySessionArray: ", session['your_array_key'])

        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/sorting_array/search_tree_sort', methods=['GET'])
def search_tree_sort():
    # Ваш код для формирования массива steps
    # Пример:
    # steps = [
    #     {'cell_colors': {1: 'red'}, 'binary_tree': {'id': 1, 'value': 12, 'left': None, 'right': None, 'color':'yellow'}},
    #     {'cell_colors': {1: 'red'}, 'binary_tree': {'id': 1, 'value': 12, 'left':{'id': 2, 'value': 12, 'left': None, 'right': None, 'color':'red'} , 'right': None, 'color':''}},
    #     {'cell_colors': {1: 'red'}, 'binary_tree': {'id': 1, 'value': 12, 'left': None, 'right': None, 'color':''}},
    # ]

    print("BINARYSEARCHHHHHHHHHHHHHHH")
    binary_tree_array=bt.BinaryTree()
    steps = binary_tree_array.search_tree_sort(session['your_array_key'])
    return jsonify([step.to_dict() for step in steps])

@app.route('/sorting_array/tournament_sort', methods=['GET'])
def tournament_sort():
    # Ваш код для формирования массива steps
    # Пример:
    # steps = [
    #     {'cell_colors': {1: 'red'}, 'binary_tree': {'id': 1, 'value': 12, 'left': None, 'right': None, 'color':'yellow'}},
    #     {'cell_colors': {1: 'red'}, 'binary_tree': {'id': 1, 'value': 12, 'left':{'id': 2, 'value': 12, 'left': None, 'right': None, 'color':'red'} , 'right': None, 'color':''}},
    #     {'cell_colors': {1: 'red'}, 'binary_tree': {'id': 1, 'value': 12, 'left': None, 'right': None, 'color':''}},
    # ]

    print("TOURNAMENTSORTTTTTTTTTTTTT")
    binary_tree_array=bt.BinaryTree()
    
    steps = binary_tree_array.build_search_tree(session['your_array_key'])
    return jsonify([step.to_dict() for step in steps])

@app.route("/traversal")
def traversal():
    # session.pop('binary_tree', None)
    binary_tree.load_session_data()
    binary_tree.update_session_data()
    return render_template("binary_tree/traversal.html", serialized_tree=session['binary_tree'], title = 'Обходы')

@app.route('/traversal/update_node', methods=['POST'])
def update_node():
    # logging.debug('Получен запрос на обновление узла')
    data = request.get_json()
    current_value = int(data.get('current_value'))
    # print(current_value)
    new_value = int(data.get('new_value'))
    # print(new_value)

    # binary_tree.load_session_data()
    # Вызываем метод update объекта binary_tree
    binary_tree.update_node(current_value, new_value)
    

    return jsonify({"status": "success"})

@app.route('/traversal/add_node', methods=['POST'])
def add_node():
    data = request.get_json()
    parentValue = int(data.get('parentValue'))
    newNodeId = int(data.get('newNodeId'))
    print("newNodeId=", newNodeId)
    side = data.get('side')
    newNodeValue = int(data.get('newNodeValue'))

    # Добавление новой вершины в дерево
    binary_tree.add_node(newNodeId,parentValue,newNodeValue, side == 'left')

    # Обновление данных в сессии
    binary_tree.update_session_data()
    return jsonify({"status": "success"})

@app.route('/traversal/traversal_selected', methods=['GET'])
def traversal_selected():
    binary_tree.load_session_data()
    traversal_type = request.args.get('traversal_type', default='bfs')

    if traversal_type == 'bfs':
        traversal_order = binary_tree.breadth_first_search()
    elif traversal_type == 'dfs_pre_order':
        traversal_order = binary_tree.depth_first_search_pre_order()
    elif traversal_type == 'dfs_in_order':
        traversal_order = binary_tree.depth_first_search_in_order()
    elif traversal_type == 'dfs_post_order':
        traversal_order = binary_tree.depth_first_search_post_order()
    else:
        return jsonify({"error": "Invalid traversal type"})

    return jsonify({"traversal_order": traversal_order})

# алгоритмы Маши
@app.route("/shortest_path")
def shortest_path():
    return render_template("shortest_path.html", show_alg_btn = [], title = 'Кратчайший путь', ds_desc = Algorithm.query.filter_by(key = 'ds').first(), bf_desc = Algorithm.query.filter_by(key = 'bf').first(), fl_desc = Algorithm.query.filter_by(key = 'fl').first())

@app.route('/shortest_path/dijkstra')
def dijkstra():
    # matrix = [ [0, 1, 0, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 1, 0, 0, 1], [0, 0, 1, 0, 0] ]
    alg_input, steps, alg_result = ts.algorithm_depth_first_search(session['matrix'])
    return render_template("main.html", show_alg_btn = ["dm", "dfs"], title = 'Поиск в глубину', alg_title = "Поиск в глубину", alg_input = alg_input, steps = steps, alg_result = alg_result)

@app.route('/shortest_path/bellman–ford')
def bellman_ford():
    matrix = [ [0, 1, 0, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 1, 0, 0, 1], [0, 0, 1, 0, 0] ]

    alg_input, steps, alg_result = ts.demukron(session['matrix'])
    # alg_input, steps, alg_result = ts.demukron(matrix)
    return render_template("main.html", show_alg_btn = ["dm", "dfs"], title = 'Демукрон', alg_title = "Алгоритм Демукрона", alg_input = alg_input, steps = steps, alg_result = alg_result)

@app.route('/shortest_path/floyd_warshall')
def floyd_warshall():
    matrix = [ [0, 1, 0, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 1, 0, 0, 1], [0, 0, 1, 0, 0] ]

    alg_input, steps, alg_result = ts.demukron(session['matrix'])
    # alg_input, steps, alg_result = ts.demukron(matrix)
    return render_template("main.html", show_alg_btn = ["dm", "dfs"], title = 'Демукрон', alg_title = "Алгоритм Демукрона", alg_input = alg_input, steps = steps, alg_result = alg_result)



# алгоритмы Андрей
@app.route("/strong_connectivity")
def strong_connectivity_input():
    return render_template("strong_connectivity.html", show_alg_btn = [], title = 'Разбиение графа', ml_desc = Algorithm.query.filter_by(key = 'ml').first(), ks_desc = Algorithm.query.filter_by(key = 'ks').first())

@app.route('/strong_connectivity/malgrange')
def Malgrange():
    # matrix = [ [0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0], [1, 1, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0] ]
    alg_input, steps, alg_result = sc.algorithm_Malgrange(session['matrix'])
    return render_template("main.html", show_alg_btn = ["ml", "ks"], title = 'Мальгранж', alg_title = "Алгоритм Мальгранжа", alg_input = alg_input, steps = steps, alg_result = alg_result)

@app.route('/strong_connectivity/kosaraju')
def Kosaraju():
    # matrix = [ [0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0], [1, 1, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0] ]
    alg_input, steps, alg_result = sc.algorithm_Kosaraju(session['matrix'])
    return render_template("main.html", show_alg_btn = ["ml", "ks"], title = 'Косарайю', alg_title = "Алгоритм Косарайю", alg_input = alg_input, steps = steps, alg_result = alg_result)

# алгоритмы Кирилла
@app.route("/topological_sort")
def topological_sort_input():
    return render_template("topological_sort.html", show_alg_btn = [], title = 'Топологическая сортировка', dm_desc = Algorithm.query.filter_by(key = 'dm').first(), dfs_desc = Algorithm.query.filter_by(key = 'dfs').first())

@app.route('/topological_sort/depth_first_search')
def depth_first_search():
    # matrix = [ [0, 1, 0, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 1, 0, 0, 1], [0, 0, 1, 0, 0] ]
    alg_input, steps, alg_result = ts.algorithm_depth_first_search(session['matrix'])
    return render_template("main.html", show_alg_btn = ["dm", "dfs"], title = 'Поиск в глубину', alg_title = "Поиск в глубину", alg_input = alg_input, steps = steps, alg_result = alg_result)

@app.route('/topological_sort/demukron')
def demukron():
    matrix = [ [0, 1, 0, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 1, 0, 0, 1], [0, 0, 1, 0, 0] ]

    alg_input, steps, alg_result = ts.demukron(session['matrix'])
    # alg_input, steps, alg_result = ts.demukron(matrix)
    return render_template("main.html", show_alg_btn = ["dm", "dfs"], title = 'Демукрон', alg_title = "Алгоритм Демукрона", alg_input = alg_input, steps = steps, alg_result = alg_result)

# алгоритмы Коли
@app.route("/minimal_spanning_tree")
def minimal_spanning_tree():
    return render_template("minimal_spanning_tree.html", show_alg_btn = [], title = 'Минимальный остов', kr_desc = Algorithm.query.filter_by(key = 'kr').first(), pr_desc = Algorithm.query.filter_by(key = 'pr').first())

@app.route('/minimal_spanning_tree/kraskal')
def kraskal():
    alg_input, steps, alg_result = st.kraskal(session['matrix'])
    return render_template("main.html", show_alg_btn = ["kr", "pr"], title = 'Краскал', alg_title = "Алгоритм Краскала", alg_input = alg_input, steps = steps, alg_result = alg_result)

@app.route('/minimal_spanning_tree/prim')
def prim():
    alg_input, steps, alg_result = st.prim(session['matrix'])
    return render_template("main.html", show_alg_btn = ["kr", "pr"], title = 'Прим', alg_title = "Алгоритм Прима", alg_input = alg_input, steps = steps, alg_result = alg_result)

# binary_tree = bt.BinaryTree(12)
#----------------Бинарные деревья
# @app.route('/binary_tree')
# def index():
#     session.pop('binary_tree', None)
#     print("из индекс")
#     print(binary_tree.root.value)
#     print("из индекс после")
#     binary_tree.load_session_data()
#     # nodes, edges = binary_tree.visualize()
#     binary_tree.update_session_data()
#     # print(nodes)
#     # print(edges)
#     return render_template('binary_tree_search.html', serialized_tree=session['binary_tree'])
    

# @app.route('/binary_tree/update_node', methods=['POST'])
# def update_node():
#     # logging.debug('Получен запрос на обновление узла')
#     data = request.get_json()
#     current_value = int(data.get('current_value'))
#     print(current_value)
#     new_value = int(data.get('new_value'))
#     print(new_value)

#     # binary_tree.load_session_data()
#     # Вызываем метод update объекта binary_tree
#     binary_tree.update_node(current_value, new_value)
    

#     return jsonify({"status": "success"})

# @app.route('/binary_tree/add_node', methods=['POST'])
# def add_node():
#     data = request.get_json()
#     parentValue = int(data.get('parentValue'))
#     newNodeId = int(data.get('newNodeId'))
#     print("newNodeId=", newNodeId)
#     side = data.get('side')
#     newNodeValue = int(data.get('newNodeValue'))

#     # Добавление новой вершины в дерево
#     binary_tree.add_node(newNodeId,parentValue,newNodeValue, side == 'left')

#     # Обновление данных в сессии
#     binary_tree.update_session_data()
#     return jsonify({"status": "success"})

# @app.route('/binary_tree/traversal', methods=['GET'])
# def traversal():
#     binary_tree.load_session_data()
#     traversal_type = request.args.get('traversal_type', default='bfs')

#     if traversal_type == 'bfs':
#         traversal_order = binary_tree.breadth_first_search()
#     elif traversal_type == 'dfs_pre_order':
#         traversal_order = binary_tree.depth_first_search_pre_order()
#     elif traversal_type == 'dfs_in_order':
#         traversal_order = binary_tree.depth_first_search_in_order()
#     elif traversal_type == 'dfs_post_order':
#         traversal_order = binary_tree.depth_first_search_post_order()
#     else:
#         return jsonify({"error": "Invalid traversal type"})
#     # Добавьте другие методы обхода здесь, если необходимо

#     return jsonify({"traversal_order": traversal_order})


if __name__ == '__main__':
    # app.debug = True
    app.run(host="0.0.0.0")