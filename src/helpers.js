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
        return this.serialize();
    }
}

export class Circle extends Shape {
    constructor(centerPoint, radius) {
        super();
        this.name = 'Circle';
        this.center = centerPoint;
        this.radius = radius;
    }

    get path() {
        const circle = new Path2D();
        circle.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);

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

    contains(point) {
        const d = Point.distance(this.center, point);

        return d <= this.radius;
    }
}

export class Bezier extends Shape {
    constructor(points, accuracy = 0.001) {
        super();
        this.name = 'Bezier';
        this.accuracy = accuracy;
        this.points = Array.from(points);
    }

    serialize() {
        return {
            name: this.name.toLowerCase(),
            args: [
                this.points,
                this.accuracy
            ],
            path: this.getPath()
        };
    }

    getPath() {
        const path = new Path2D();
        
        path.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 0; i < 1; i += this.accuracy) {
           let p = this.bezierPoint(i);
           path.lineTo(p.x, p.y);
        }


        return path;
    }

    bezierPoint(t) {
        const cX = 3 * (this.points[1].x - this.points[0].x),
            bX = 3 * (this.points[2].x - this.points[1].x) - cX,
            aX = this.points[3].x - this.points[0].x - cX - bX;
      
        const cY = 3 * (this.points[1].y - this.points[0].y),
            bY = 3 * (this.points[2].y - this.points[1].y) - cY,
            aY = this.points[3].y - this.points[0].y - cY - bY;
      
        const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + this.points[0].x;
        const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + this.points[0].y;
      
        return {
          x: x,
          y: y,
        }
    }
    
    contains(point) {
        let contains = false;
      
        for (let i = 0; i < 1; i += this.accuracy) {
          let p = this.bezierPoint(i);
          
          if (Point.distance(point, p) <= 3) {
            contains = true;
            break;
          }
        }
      
        return contains;
    }
}