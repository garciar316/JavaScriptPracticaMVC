//Definicion del tablero donde se van a dibujar los diferentes objetos del juego
(function () {
    self.Board = function (width, height) {
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
        this.playing = false;
    }
//Agregar atributos a todos los objetos del tipo Board
    self.Board.prototype = {
        get elements() {
            var elements = this.bars.map(function(bar) { return bar});
            elements.push(this.ball);
            return elements;
        }
    }
})();
//Definicion de la bola que posteriormente sera dibujada en el tablero
//Tambien se definen unos atributos
(function () {
    self.Ball = function (x, y, radius, board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed_x = 3;
        this.speed_y = 0;
        this.direction = 1;
        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI / 2;
        this.speed = 3;

        this.board = board;
        this.kind = "circle";

        board.ball = this;
    }
//Agregar los metodos y atributos para todos los objetos del tipo Ball
    self.Ball.prototype = {
        //Metodo para realizar el movimiento, el eje x se multiplica por la direccion para cambiar la trayectoria
        move: function () {
            this.x += (this.speed_x * this.direction);
            this.y += (this.speed_y);
        },
        get width() {
            return this.radius * 2;
        },
        get height() {
            return this.radius * 2;
        },
        collision: function (bar) {
            //Reacciona a la colision con una barra que recibe como parametro
            var relative_intersect_y = (bar.y + (bar.height / 2)) - this.y;

            var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

            this.speed_y = this.speed * - Math.sin(this.bounce_angle);
            this.speed_x = this.speed * Math.cos(this.bounce_angle);

            if (this.x > (this.board.width / 2)) {
                this.direction = -1
            } else {
                this.direction = 1;
            }
        }
    }
})();
//Definicion del objeto barra y sus atributos
(function () {
    self.Bar = function (x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.width = width;
        this.height = height;
        this.board = board;
        //Se agrega al arreglo bars, del atributo borard todas las barras que se definan
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 20;
    }
//Agregar los metodos y atributos para todos los objetos del tipo Bar
    self.Bar.prototype = {
        //Sube el objeto en el eje y, segun la velocidad definida en la definicion del objeto
        down: function () {
            this.y += this.speed;
        },
        //Baja el objeto en el eje y, segun la velocidad definida en la definicion del objeto
        up: function () {
            this.y -= this.speed;
        },
        //Escribe por consola la pocicon actual del objeto
        toSring: function () {
            return "x: " + this.x + ", y: " + this.y;
        }
    }
})();
//Crea un canvas y dibuja en el los objetos
(function () {
    self.BoardView = function (canvas, board) {
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d");
    }

    self.BoardView.prototype = {
        //Limpia el tablero a medida que se desplazan los objetos para no dejar el rastro del movimiento
        clean: function () {
            this.ctx.clearRect(0, 0, this.board.width, this.board.height)
        },
        //Llama al metodo que dibuja el objeto en el canvas
        draw: function () {
            for (var i = this.board.elements.length - 1; i >= 0; i--) {
                var el = this.board.elements[i];
                draw(this.ctx, el);
            }
        },
        //Valida si una barra colisiona con la bola
        check_collisions: function () {
            for (var i = this.board.bars.length -1; i >= 0; i--) {
                var bar = this.board.bars[i];
                if (hit(bar, this.board.ball)) {
                    this.board.ball.collision(bar);
                }
            }
        },
        //Administra el juego, llamando a los metodos necesarios para que funcione
        play: function () {
            if (this.board.playing) {
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();
            }
        }
    }

    function hit(a, b) {
        //Revisa si a colisiona con b
        var hit = false;
        //Colisiones horizontales
        if (b.x + b.width >= a.x && b.x < a.x + a.width) {
            //Colisiones verticales
            if (b.y + b.height >= a.y && b.y < a.y + a.height) {
                hit = true;
            }
        }
        // Colision  de a con b
        if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
            if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
                hit = true;
            }
        }
        //Colision de b con a
        if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
            if (a.y < b.y && a.y + a.height >= b.y + b.height) {
                hit = true;
            }
        }
        return hit;
    }
//Dibuja un objeto en el canvas, recibe el contexto (canvas) y el elemento
    function draw(ctx, element) {
        switch (element.kind) {
            case "rectangle":
                ctx.fillRect(element.x, element.y, element.width, element.height);
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(element.x, element.y, element.radius, 0, 7);
                ctx.fill();
                ctx.closePath();
                break;
        }
    }
})();
//Creacion de los objetos
var board = new Board(800, 400);
var bar = new Bar(20, 100, 40, 100, board);
var bar_2 = new Bar(735, 100, 40, 100, board);
var canvas = document.getElementById('canvas');
var board_view = new BoardView(canvas, board);
var ball = new Ball(350, 100, 10, board);
//Agrega un evento a la pulsacion de teclas, captura la tecla y llama a un mentodo segun corresponda
document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp") {
        event.preventDefault();
        bar.up();
    }
    if (event.key === "ArrowDown") {
        event.preventDefault();
        bar.down();
    }
    if (event.key === "w") {
        event.preventDefault();
        bar_2.up();
    }
    if (event.key === "s") {
        event.preventDefault();
        bar_2.down();
    }
    if (event.key === " ") {
        event.preventDefault();
        board.playing = !board.playing;
    }
})
window.requestAnimationFrame(controller);
setTimeout(function () {
    ball.direction = -1;
}, 4000);

board_view.draw();

function controller() {
    board_view.play();
    window.requestAnimationFrame(controller);
}