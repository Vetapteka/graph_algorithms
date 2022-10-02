class Graph {
    constructor() {
        this.vertices = {};
        this.verticesWithInfo = {};
        this.distanceToMur = [10000, 2468, 2044, 1951, 2913, 2461, 1871, 2992, 2596, 2287, 2291, 2081, 2799, 3264, 2114, 1938, 0, 1983, 3267, 2305, 1905, 2664, 3674, 1337, 1442, 2798, 2684, 1595];
    }

    addVertex(value) {
        if (!this.vertices[value]) {
            this.vertices[value] = [];
            this.verticesWithInfo[value] = [];
        } else {
            throw new Error('Уже есть такая вершина');
        }
    }

    addEdge(vertex1, vertex2, distance) {
        if (!(vertex1 in this.vertices) || !(vertex2 in this.vertices)) {
            throw new Error('В графе нет таких вершин');
        }

        if (!this.vertices[vertex1].includes(vertex2)) {
            this.vertices[vertex1].push(vertex2);
            this.verticesWithInfo[vertex1].push({vertex: vertex2, distance: distance});
        }
        if (!this.vertices[vertex2].includes(vertex1)) {
            this.vertices[vertex2].push(vertex1);
            this.verticesWithInfo[vertex2].push({vertex: vertex1, distance: distance});
        }
    }

    dfs(vertexFrom, vertexTo, limit) {
        let res = [];
        let iterCount = 0;
        let list = this.vertices; // список смежности
        let stack = [vertexFrom]; // стек вершин для перебора
        let stackEdge = [] //стек ребер для отрисовки
        let visited = {[vertexFrom]: 1}; // посещенные вершины

        function handleVertex(vertex) {
            // получаем список смежных вершин
            iterCount++;
            if (iterCount <= limit) {
                let reversedNeighboursList = [...list[vertex]].reverse();
                reversedNeighboursList.forEach(neighbour => {
                    if (!visited[neighbour]) {
                        // отмечаем вершину как посещенную
                        visited[neighbour] = 1;
                        // добавляем в стек
                        stack.push(neighbour);
                        stackEdge.push([vertex, neighbour]);
                    }

                });
            }
        }

        let activeVertex = vertexFrom;

        while (activeVertex !== vertexTo && stack.length) {
            console.log(activeVertex);
            handleVertex(activeVertex);
            res.push(stackEdge.pop());
            activeVertex = stack.pop();
        }

        return {path: res, depth: iterCount};
    }

    bfs(vertexFrom, vertexTo) {
        let path = [];
        let list = this.vertices; // список смежности
        let queue = [vertexFrom]; // очередь вершин для перебора
        let visited = {[vertexFrom]: 1}; // посещенные вершины

        function handleVertex(vertex) {
            // получаем список смежных вершин
            let neighboursList = list[vertex];
            path.push([]);
            path[path.length - 1].push(vertex)

            neighboursList.forEach(neighbour => {
                if (!visited[neighbour]) {
                    visited[neighbour] = 1;
                    path[path.length - 1].push(neighbour);
                    queue.push(neighbour);
                }
            });
            if (path[path.length - 1].length === 1) {
                path.pop()
            }
        }

        while (!visited[vertexTo]) {
            let activeVertex = queue.shift();
            handleVertex(activeVertex);
        }
        console.log(path);
        return path;
    }

    ds(vertexFrom, vertexTo) {
        let list = this.vertices;
        let visitedTo = {[vertexTo]: 1};
        let visitedFrom = {[vertexFrom]: 1};

        let queueFrom = [vertexFrom];
        let queueTo = [vertexTo];
        let path = [];

        function handleVertex(vertex, queue, visited) {
            // получаем список смежных вершин
            let neighboursList = list[vertex];
            path.push([]);
            path[path.length - 1].push(vertex)

            neighboursList.forEach(neighbour => {
                if (!visited[neighbour]) {
                    visited[neighbour] = 1;
                    path[path.length - 1].push(neighbour);
                    queue.push(neighbour);
                }
            });
            if (path[path.length - 1].length === 1) {
                path.pop()
            }
        }

        let i = 0;
        while (!findCommon()) {
            if (i % 2 === 0) {
                let activeVertex = queueFrom.shift();
                handleVertex(activeVertex, queueFrom, visitedFrom);
            } else {
                let activeVertex = queueTo.shift();
                handleVertex(activeVertex, queueTo, visitedTo);
            }
            i++;
            findCommon();

        }

        function findCommon() {
            let res = false
            queueTo.forEach(elTo => {
                queueFrom.forEach(elfrom => {
                    if (elfrom === elTo) {
                        res = true;
                    }
                });
            });
            return res;
        }

        return path;
    }

    bestFirstSearch(vertexFrom) {
        let res = [];
        let vertices = this.vertices;
        let distanceToMur = this.distanceToMur;
        let visited = new Set();

        let start = vertexFrom;
        let prev = vertexFrom;

        while (start !== 16) {
            visited.add(start);
            let neighbours = vertices[start];
            neighbours = neighbours.filter(e => !visited.has(e));

            if (neighbours.length === 0) {
                start = prev;
                continue;
            }

            let minDistance = Math.min(...neighbours.map(e => distanceToMur[e]));
            prev = start;
            start = distanceToMur.indexOf(minDistance);
            res.push([prev, start]);
        }
        return res;
    }

    searchOptimized(vertexFrom) {
        let res = [];
        let distanceToMur = this.distanceToMur;
        let verticesWithInfo = this.verticesWithInfo;
        let visited = new Set();
        let variantToGo = [];

        let start = vertexFrom;
        let carDistance = 0;

        let level = 1;

        while (start !== 16) {
            visited.add(start);
            let neighbours = verticesWithInfo[start];
            neighbours = neighbours.filter(e => !visited.has(e.vertex));

            neighbours.forEach(e => variantToGo.push({
                start: start,
                togo: e.vertex,
                distance: e.distance + carDistance,
                level: level
            }))

            let withRealDist = variantToGo.map(e => e.distance + distanceToMur[e.togo])

            let min = Math.min(...withRealDist);
            let indexMin = withRealDist.indexOf(min);

            let nextVer = variantToGo[indexMin];

            //если уходим с текущей ветки, то удаляем текущую ветку
            variantToGo = variantToGo.filter(e => e.level <= nextVer.level)

            start = nextVer.togo;
            carDistance = nextVer.distance;

            variantToGo.splice(indexMin, 1);
            level++;

            res.push([start, nextVer.start])
        }

        return res;
    }

}

let frame = document.getElementById("graph");
frame.onload = function () {

    const graph = new Graph();
    console.log(graph.verticesWithInfo)
    $.ajax({
        url: "matrix.csv",
        dataType: 'text',
    }).done(function successFunction(data) {
        const allRows = data.split(/\r?\n|\r/);
        for (let i = 1; i <= allRows.length; i++) {
            graph.addVertex(i)
        }
        for (let i = 0; i < allRows.length; i++) {
            let rowCells = String(allRows[i]).split(',');
            for (let j = 0; j < rowCells.length; j++) {
                let distance = Number(rowCells[j]);
                if (distance > 0) {
                    graph.addEdge(i + 1, j + 1, distance);
                }
            }
        }
        console.log(graph.vertices)

        let path;
        let vertexFrom;
        let vertexTo;
        let limit = 100;

        document.getElementById("input_from").addEventListener("change", () => {
            vertexFrom = Number(document.getElementById("input_from").value);
        });
        document.getElementById("input_to").addEventListener("change", () => {
            vertexTo = Number(document.getElementById("input_to").value);
        });

        let bfsButton = document.getElementById("bfs_button");
        bfsButton.addEventListener("click", () => {
            buttonChangeStyle(bfsButton)
            path = graph.bfs(vertexFrom, vertexTo)
        });

        let dfsButton = document.getElementById("dfs_button");
        dfsButton.addEventListener("click", () => {
            buttonChangeStyle(dfsButton);
            path = graph.dfs(vertexFrom, vertexTo, limit).path;
        });

        //depth-limited search
        let dlsButton = document.getElementById("dls_button");
        dlsButton.addEventListener("click", () => {
            let inputLimit = document.getElementById("input_limit")

            if (!inputLimit) {
                inputLimit = document.createElement('input')
                inputLimit.className = "input"
                inputLimit.type = "text"
                inputLimit.id = "input_limit"
                inputLimit.placeholder = "лимит (число)"
                document.getElementById("input_to").after(inputLimit);
            }

            inputLimit.addEventListener("change", () => {
                buttonChangeStyle(dlsButton);
                limit = Number(inputLimit.value);
                path = graph.dfs(vertexFrom, vertexTo, limit).path;
            });
        });

        // iterative-deepening depth-first search
        let iddfsButton = document.getElementById("iddfs_button");
        iddfsButton.addEventListener("click", () => {
            buttonChangeStyle(iddfsButton);
            let result = graph.dfs(vertexFrom, vertexTo, limit)
            path = result.path;
            displayContent("глубина: " + result.depth);
        });

        // bidirectional search
        let dsButton = document.getElementById("ds_button");
        dsButton.addEventListener("click", () => {
            buttonChangeStyle(dsButton);
            path = graph.ds(vertexFrom, vertexTo, limit);
        });

        let bestFirstSearchButton = document.getElementById("best_first_search_button");
        bestFirstSearchButton.addEventListener("click", () => {
            buttonChangeStyle(bestFirstSearchButton);
            path = graph.bestFirstSearch(vertexFrom);
        });

        let searchOptimized = document.getElementById("search_optimized_button");
        searchOptimized.addEventListener("click", () => {
            buttonChangeStyle(searchOptimized);
            path = graph.searchOptimized(vertexFrom);
        });


        let nextStepButton = document.getElementById("next_step_button");
        nextStepButton.addEventListener("click", () => {
            let nextVertices = path.shift()
            let startVer = nextVertices.shift()
            highlightVertex(startVer)
            nextVertices.forEach(v => {
                drawPath(startVer, v);
                highlightVertex(v);
            });
        });
    });
}

function buttonChangeStyle(button) {
    button.style.background = "#f0d543";
    button.style.color = "firebrick";
}

function drawPath(start, end) {
    let svgId = "edge_" + Math.min(start, end) + "_" + Math.max(start, end);
    frame.contentWindow.document.getElementById(svgId).setAttribute("stroke", "coral")
    displayContent([start, end])
}

function highlightVertex(vertex) {
    let svgId = "circle_" + vertex;
    frame.contentWindow.document.getElementById(svgId).setAttribute("stroke", "coral")
}

function displayContent(edge) {
    document.getElementById("display").innerText = edge;
}
