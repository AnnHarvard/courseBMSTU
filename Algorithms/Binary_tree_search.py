from flask import Flask, session
from pyvis.network import Network
import logging
import pickle
import ast



logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)
app.secret_key = 'my_secret_key'  # Задайте секретный ключ для сессий


class BinaryTreeNode:
    def __init__(self, id, value,color=""):
        self.id=id
        self.value = value
        self.left = None
        self.right = None
        self.color=color

class BinaryTree:
    def __init__(self,root_value=None):
        self.root = BinaryTreeNode(1,root_value) if root_value is not None else None
        self.index_for_sort=1
       

    # sorting_array methods
        
    def insert(self, value, steps,index,isLast):
        if not self.root:
            self.root = BinaryTreeNode(1,value,"rgba(168, 132, 160, 0.8)")
            step=Step()
            step.description=f"Элемент {value} помещаем в корень."
            step.cell_colors={index+1:"rgba(168, 132, 160, 0.8)"}
            step.binary_tree=self.serialize(self.root)

            steps.append(step)
        else:
            self._insert_recursive(self.root, value, steps,index,isLast)
            


    def _insert_recursive(self, current_node, value, steps,index,isLast):
        
        step=Step()
        step.description=f"{value} сравнивается с {current_node.value}.\n"
        step.cell_colors={index+1:"rgba(168, 132, 160, 0.8)"}

        current_node.color="rgba(216, 244, 83, 0.67)"
        step.binary_tree=self.serialize(self.root)
        steps.append(step)

        
        
        if int(value) < int(current_node.value):
            if current_node.left:
                # step=Step()
                steps[-1].description+=f" {value} меньше, чем {current_node.value}, перейдем к левому поддереву."
                # step.cell_colors={index+1:"green"}
                # step.binary_tree=binary_tree_array.serialize(binary_tree_array.root)
                # steps.append(step)
                current_node.color=""
                self._insert_recursive(current_node.left, value, steps,index, isLast)
            else:
                current_node.color=""
                current_node.left = BinaryTreeNode(current_node.id*2,value,"rgba(168, 132, 160, 0.8)")
                step=Step()
                step.description=f"{value} меньше, чем {current_node.value}, построим левого потомка у {current_node.value}."
                step.cell_colors=steps[-1].cell_colors
                step.binary_tree=self.serialize(self.root)
                steps.append(step)
                current_node.left.color=""
                
        elif int(value) > int(current_node.value):
            if current_node.right:

                # step=Step()
                steps[-1].description+=f" {value} больше, чем {current_node.value}, перейдем к правому поддереву."

                # step.description=f"{value} is greater than {current_node.value}, go to the right subtree."
                # step.cell_colors={index+1:"green"}
                # step.binary_tree=binary_tree_array.serialize(binary_tree_array.root)
                # steps.append(step)
                current_node.color=""
                self._insert_recursive(current_node.right, value, steps,index, isLast)

            else:
                current_node.color=""
                current_node.right = BinaryTreeNode(current_node.id*2+1,value,"rgba(168, 132, 160, 0.8)")
                step=Step()
                step.description=f" {value} больше, чем {current_node.value}, построим правого потомка у {current_node.value}."
                step.cell_colors=steps[-1].cell_colors
                step.binary_tree=self.serialize(self.root)
                steps.append(step)
                current_node.right.color=""
       
        if (isLast):
            check=True
            current_node.color=""
            step=Step()
            step.description=f"Дерево поиска построено.\n  Начинаем in-order обход для построения отсортированного массива"
            step.binary_tree=self.serialize(self.root)

            if step != steps[-1]:
                steps.append(step)

    def search_tree_sort(self, array):
        steps = []
        for index, value in enumerate(array):
            self.insert(value, steps, index, (index+1)==len(array))
        self.in_order_traversal_for_sort(steps)
        step=Step()
        step.description=f"Готово! Массив отсортирован!"
        step.binary_tree=self.serialize(self.root)
        steps.append(step)
        return steps
    
    def in_order_traversal_for_sort(self, steps, current_node=None):
        # index=1
        if current_node is None:
            current_node = self.root
        if current_node.left is not None:
            self.in_order_traversal_for_sort(steps,current_node.left)

        step = Step()
        step.description = f"Добавляем {current_node.value} в отсортированный массив."
        step.first_cell_colors = {self.index_for_sort: "rgba(216, 244, 83, 0.67)"}
        step.first_cell_values = {self.index_for_sort: current_node.value}
        current_node.color="rgba(216, 244, 83, 0.67)"
        step.binary_tree = self.serialize(self.root)
        steps.append(step)

        self.index_for_sort += 1

        if current_node.right is not None:
            self.in_order_traversal_for_sort(steps,current_node.right)
    ##################################

    def add_node(self, id, parent_value, new_value, is_left=True):
        # Ищем узел с заданным значением
        parent_node = self.find_node(self.root, parent_value)

        if parent_node is not None:
            # Создаем новый узел
            new_node = BinaryTreeNode(id, new_value)
            # Добавляем новый узел к родительскому узлу
            if is_left:
                parent_node.left = new_node
            else:
                parent_node.right = new_node
        self.update_session_data()

           

    def update_node(self, current_value, new_value, current_node=None):
        if current_node is None:
            current_node = self.root

        if current_node is not None:
            
            if current_node.value == current_value:

                current_node.value = new_value
                self.update_session_data() 
                return
            if current_node.left is not None:
                self.update_node(current_value, new_value, current_node.left)
            if current_node.right is not None:
                self.update_node(current_value, new_value, current_node.right)

        

    def find_node(self, current_node, target_value): #by value
        if current_node is not None:
            if current_node.value == target_value:
                return current_node

            left_result = self.find_node(current_node.left, target_value)
            if left_result is not None:
                return left_result

            right_result = self.find_node(current_node.right, target_value)
            return right_result
        
    
         
    def serialize(self, node=None):
        if node is None:
            return None
        return {
            
            "id": node.id,
            "value": node.value,
            "color":node.color,
            "left": self.serialize(node.left),
            "right": self.serialize(node.right)
        } 

    def deserialize(self, data):
        if data is None:
            return None
        # Восстанавливаем состояние дерева из словаря
        self.root = self.deserialize_helper(data)


        # Возвращаем объект BinaryTree
        return self
    
    def deserialize_helper(self, data):
        if data is None:
            return None
        # Создаем новый узел с переданным значением
        node = BinaryTreeNode(data["id"], data["value"])

        # Рекурсивные вызовы для левого и правого поддеревьев
        node.left = self.deserialize_helper(data["left"])
        node.right = self.deserialize_helper(data["right"])
        # Возвращаем созданный узел
        return node
    
    def update_session_data(self):
         session['binary_tree'] = self.serialize(self.root)

    def load_session_data(self):
        if 'binary_tree' not in session:
            session['binary_tree']={}
        serialized_data = session['binary_tree']

        if serialized_data:
            self.deserialize(serialized_data)

    def breadth_first_search(self):
        # Проверяем, что у нас есть корневой узел
        if self.root is None:
            return []

        # Создаем очередь для обхода в ширину
        queue = [self.root]
        
        # Массив для хранения идентификаторов узлов в порядке обхода
        traversal_order = []

        # Обход в ширину
        while queue:
            current_node = queue.pop(0)  # Извлекаем первый элемент из очереди

            # Добавляем идентификатор узла в порядке обхода
            traversal_order.append(current_node.id)

            # Меняем цвет текущего узла (это вы можете адаптировать под ваш код)
            # Пример: current_node.color = 'red'

            # Добавляем левого потомка в очередь, если есть
            if current_node.left:
                queue.append(current_node.left)

            # Добавляем правого потомка в очередь, если есть
            if current_node.right:
                queue.append(current_node.right)

        # Возвращаем порядок обхода для использования на клиенте
        return traversal_order 
    
    def depth_first_search_pre_order(self, current_node=None):
        if current_node is None:
            current_node = self.root

        traversal_order = []

        if current_node is not None:
            # Добавляем идентификатор узла в порядке обхода перед посещением потомков
            traversal_order.append(current_node.id)

            # Рекурсивные вызовы для левого и правого поддеревьев
            if current_node.left is not None:
                traversal_order.extend(self.depth_first_search_pre_order(current_node.left))

            if current_node.right is not None:
                traversal_order.extend(self.depth_first_search_pre_order(current_node.right))

        return traversal_order
    
    def depth_first_search_in_order(self, current_node=None):
        if current_node is None:
            current_node = self.root

        traversal_order = []  # изменено имя переменной

        if current_node.left is not None:
            # Рекурсивно вызываем для левого поддерева
            traversal_order.extend(self.depth_first_search_in_order(current_node.left))

        # Добавляем текущую вершину в результат
        traversal_order.append(current_node.id)

        if current_node.right is not None:
            # Рекурсивно вызываем для правого поддерева
            traversal_order.extend(self.depth_first_search_in_order(current_node.right))

        return traversal_order
    
    def depth_first_search_post_order(self, node=None):
        """
        Метод для post-order обхода дерева.
        Возвращает массив вершин в порядке post-order обхода.
        """
        if node is None:
            node = self.root

        traversal_order = []

        if node.left:
            traversal_order.extend(self.depth_first_search_post_order(node.left))

        if node.right:
            traversal_order.extend(self.depth_first_search_post_order(node.right))

        traversal_order.append(node.id)  # Посещаем текущий узел

        return traversal_order

class Step:
    def __init__(self):
        self.description=""
        self.cell_colors = {}
        self.first_cell_colors={}
        self.first_cell_values={}
        self.second_cell_colors={}
        self.binary_tree = {}

    def to_dict(self):
        return {
            'description': self.description,
            'cell_colors': self.cell_colors,
            'first_cell_colors': self.first_cell_colors,
            'first_cell_values': self.first_cell_values,
            'second_cell_colors': self.second_cell_colors,
            'binary_tree': self.binary_tree
        }