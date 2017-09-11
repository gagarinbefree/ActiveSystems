var app = (function() {
    function app(model) {
        this.model = model;
        this.canvas = $("#cnvs");
        this.canvas.canvasWidth = model.canvasSize.x;
        this.canvas.canvasHeight = model.canvasSize.y;
        this.ctx = this.canvas.get(0).getContext("2d");
        this.crossbar = new crossbar(this.canvas, this.ctx, model);
        this.crossbar.draw();      
    }

    return app;
})();

var crossbar = (function() {
    function crossbar(canvas, ctx, model) {
        var self = this;

        this.canvas = canvas;
        this.ctx = ctx;

        this.canvasOffset = this.canvas.offset();
        this.offsetX = this.canvasOffset.left;
        this.offsetY = this.canvasOffset.top;

        this.color = model.crossBar.color;
        this.circles = [];
        this.circles.push(new circle(this.canvas, this.ctx, model.crossBar.points[0].x, model.crossBar.points[0].y, $("#coordFirst"), "First point")); 
        this.circles.push(new circle(this.canvas, this.ctx, model.crossBar.points[1].x, model.crossBar.points[1].y, $("#coordSecond"), "Second point"));                 

        this.links = $("#links");
        this.body = $("body");        

        this.dragCircle = null;

        this.body.mousedown(function(e) {
            self.handleMouseDown(e);
        });

        this.body.mouseup(function(e) {
            self.handleMouseUp(e);
        });

        this.body.mousemove(function(e) {
            self.handleMouseMove(e);
        });

        this.canvas.mouseleave(function(e) {
            self.handleOut(e);
        });      

        //this.canvas.mouseenter(function (e) {
        //    self.handleIn(e);
        //});      
    }

    crossbar.prototype.draw = function() {
        this.ctx.clearRect(0, 0, this.canvas.canvasWidth, this.canvas.canvasWidth);        

        this.line = new line(this.canvas,
            this.ctx,
            this.circles[0].x,
            this.circles[0].y,
            this.circles[1].x,
            this.circles[1].y,
            this.color
        );
        this.line.draw();

        this.circles[0].draw();
        this.circles[1].draw();       

        this.roundRect(0, 0, this.canvas.canvasWidth, this.canvas.canvasHeight, 8, "#3E3E3E", 3);
    }

    crossbar.prototype.roundRect = function(x, y, width, height, radius, style, lineWidth) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = style;
        this.ctx.lineWidth = lineWidth;
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    crossbar.prototype.handleOut = function(e) {     
        var target = e.relatedTarget;
        if (target.id == "linkSave" || target.id == "linkUpdate" || target.id == "coordFirst" || target.id == "coordSecond")
            return;

        this.dragCircle = null;
    }
    
    crossbar.prototype.handleMouseDown = function(e) {
        e.preventDefault();
        e.stopPropagation();

        lastX = parseInt(e.clientX - this.offsetX);
        lastY = parseInt(e.clientY - this.offsetY);

        this.dragCircle = this.getHitCircle(lastX, lastY);      
    }

    crossbar.prototype.handleMouseUp = function(e) {
        this.dragCircle = null;
    }

    crossbar.prototype.handleMouseMove = function(e) {
        if (this.dragCircle == null)
            return;
        
        e.preventDefault();
        e.stopPropagation();

        mouseX = parseInt(e.clientX - this.offsetX);
        mouseY = parseInt(e.clientY - this.offsetY);

        var dx = mouseX - lastX;
        var dy = mouseY - lastY;

        lastX = mouseX;
        lastY = mouseY;

        var x = this.dragCircle.x += dx;
        var y = this.dragCircle.y += dy;
        
        this.dragCircle.x = x;
        this.dragCircle.y = y;

        this.draw();
    }



    crossbar.prototype.getHitCircle = function(x, y) {
        for (var ii = 0; ii < this.circles.length; ii++) {
            if (this.circles[ii].hitCheck(x, y)) {
                return this.circles[ii];
            }
        }

        return null;
    }

    return crossbar;
})();

var circle = (function() {
    function circle(canvas, ctx, x, y, elPoint, elText) {
        var self = this;

        this.canvas = canvas;
        this.ctx = ctx;
        this.x = x;
        this.y = y;

        this.elPoint = elPoint;
        this.elText = elText;

        this.radius = 3;
        this.color = "white";
    }

    circle.prototype.draw = function() {
        this.normalizeCoors();
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.elPoint.text(this.elText + ":" + parseInt(this.x) + ";" + parseInt(this.y));
    }

    circle.prototype.normalizeCoors = function() {
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > this.canvas.canvasWidth) this.x = this.canvas.canvasWidth;
        if (this.y > this.canvas.canvasHeight) this.y = this.canvas.canvasHeight;
    }

    circle.prototype.hitCheck = function(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        if (dx * dx + dy * dy < this.radius * 10)
            return true;

        return false;
    }

    return circle;
})();

var line = (function() {
    function line(canvas, ctx, x1, y1, x2, y2, color) {
        var self = this;

        this.canvas = canvas;
        this.ctx = ctx;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
        this.width = 2;
    }

    line.prototype.draw = function() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x1, this.y1);
        this.ctx.lineTo(this.x2, this.y2);
        this.ctx.lineWidth = this.width;
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();      
    }    

    return line;
})();

