var app = (function() {
    function app(model) {
        var self = this;

        // viewmodel
        this.model = model;

        this.canvas = $("#cnvs");
        this.canvas.canvasWidth = model.CanvasSize.X;
        this.canvas.canvasHeight = model.CanvasSize.Y;
        this.ctx = this.canvas.get(0).getContext("2d");

        this.updateSegmentEl = $("#linkSave");
        this.updateSegmentEl.click(function () { self.postModel() });

        this.crossbar = new crossbar(this.canvas, this.ctx, model.Crossbar);
        this.crossbar.draw();      
    }

    app.prototype.postModel = function () {
        $.ajax({
            type: "POST",
            url: "Home/PostModel",
            data: JSON.stringify(this.model),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        });
    }

    return app;
})();

var crossbar = (function() {
    function crossbar(canvas, ctx, model) {
        var self = this;

        // crossbar
        this.model = model;

        this.canvas = canvas;
        this.ctx = ctx;

        this.canvasOffset = this.canvas.offset();
        this.offsetX = this.canvasOffset.left;
        this.offsetY = this.canvasOffset.top;
        
        this.circles = [];
        this.circles.push(new circle(this.canvas, this.ctx, this.model.Points[0], $("#coordFirst"), "First point")); 
        this.circles.push(new circle(this.canvas, this.ctx, this.model.Points[1], $("#coordSecond"), "Second point"));                 

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
    }

    crossbar.prototype.draw = function() {
        this.ctx.clearRect(0, 0, this.canvas.canvasWidth, this.canvas.canvasWidth);        

        this.line = new line(this.canvas, this.ctx, this.model);
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

        var x = this.dragCircle.model.X += dx;
        var y = this.dragCircle.model.Y += dy;

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
    function circle(canvas, ctx, model, elPoint, elText) {
        var self = this;

        // point
        this.model = model;

        this.canvas = canvas;
        this.ctx = ctx;

        this.elPoint = elPoint;
        this.elText = elText;

        this.radius = 3;
        this.color = "white";
    }

    circle.prototype.draw = function() {
        this.normalizeCoors();
        this.ctx.beginPath();
        this.ctx.arc(this.model.X, this.model.Y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.elPoint.text(this.elText + ":" + parseInt(this.model.X) + ";" + parseInt(this.model.Y));
    }

    circle.prototype.normalizeCoors = function() {
        if (this.model.X < 0) this.model.X = 0;
        if (this.model.Y < 0) this.model.Y = 0;
        if (this.model.X > this.canvas.canvasWidth) this.model.X = this.canvas.canvasWidth;
        if (this.model.Y > this.canvas.canvasHeight) this.model.Y = this.canvas.canvasHeight;
    }

    circle.prototype.hitCheck = function (x, y) {
        var dx = x - this.model.X;
        var dy = y - this.model.Y;
        
        return dx * dx + dy * dy < this.radius * 10;
    }

    return circle;
})();

var line = (function() {
    function line(canvas, ctx, model) {
        var self = this;

        // crossbar
        this.model = model;

        this.canvas = canvas;
        this.ctx = ctx;
        this.width = 2;
    }

    line.prototype.draw = function() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.model.Points[0].X, this.model.Points[0].Y);
        this.ctx.lineTo(this.model.Points[1].X, this.model.Points[1].Y);
        this.ctx.lineWidth = this.width;
        this.ctx.strokeStyle = this.model.Color;
        this.ctx.stroke();      
    }    

    return line;
})();

