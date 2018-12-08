export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.hypot(dx, dy);
    }

    serialize() {
        return {
            x: this.x,
            y: this.y
        };
    }
}

export class Shape {
    constructor() {

    }
    draw() {

    }
    intersect() {

    }
    history() {
        return this._serialized;
    }
}

class Circle extends Shape {
    constructor(centerPoint, radius) {
        super();
        this.name = 'Circle';
        this.center = centerPoint;
        this.radius = radius;
    }

    draw() {
        const circle = new Path2D();
        circle.beginPath();
        circle.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
        circle.closePath();
        super.draw();

        return circle;
    }

    serialize() {
        return [
            this.name,
            {
                center: this.center.serialize(), 
            }
        ];
    }
}