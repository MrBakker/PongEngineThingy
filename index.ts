const EPS = 1e-9;
const FAT_EPS = 1e-5;

function isNearly(x: number, n: number): boolean {
    return Math.abs(x - n) < EPS;
}

class Vec2 {
    constructor(public x: number, public y: number) { }

    add(v: Vec2): Vec2 {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    mul(s: number): Vec2 {
        return new Vec2(this.x * s, this.y * s);
    }

    div(s: number): Vec2 {
        return new Vec2(this.x / s, this.y / s);
    }

    dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y;
    }

    len(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lenSq(): number {
        return this.dot(this);
    }

    normalize(): Vec2 {
        const length = this.len();
        if (length !== 0) {
            return this.div(length);
        }
        return new Vec2(0, 0);
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle: number): Vec2 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        return new Vec2(x, y);
    }

    perp(): Vec2 {
        return new Vec2(-this.y, this.x);
    }

    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }
}

function solveQuadratic(a: number, b: number, c: number): number[] {
    if (isNearly(a, 0)) {
        if (isNearly(b, 0))
            return [];
        return [-c / b];
    }

    const disc = b * b - 4 * a * c;
    if (disc < -EPS) return [];
    if (disc < 0) return [-b / (2 * a)];

    const sqrtDisc = Math.sqrt(disc);
    return [(-b - sqrtDisc) / (2 * a), (-b + sqrtDisc) / (2 * a)];
}

enum CollisionResponse {
    BOUNCE = 0,
    IGNORE = 1,
    RESET = 2,
};

class BaseObject {
    private _velocity: Vec2;
    private _inverseMass: number;
    private _restitution: number;

    private parentObject: BaseObject | null = null;

    private collisionHandler: (other: BaseObject) => CollisionResponse = (other: BaseObject) => CollisionResponse.BOUNCE;

    constructor(velocity: Vec2, inverseMass: number = 1.0, restitution: number = 1.0, parentObject: BaseObject | null = null) {
        this._velocity = velocity;
        this._inverseMass = inverseMass;
        this._restitution = restitution;

        this.parentObject = parentObject;
    }

    public get velocity(): Vec2 {
        return this.getParentObject()._velocity;
    }

    public set velocity(v: Vec2) {
        this.getParentObject()._velocity = v;
    }

    public get inverseMass(): number {
        return this.getParentObject()._inverseMass;
    }

    public set inverseMass(m: number) {
        this.getParentObject()._inverseMass = m;
    }

    public get restitution(): number {
        return this.getParentObject()._restitution;
    }

    public set restitution(r: number) {
        this.getParentObject()._restitution = r;
    }

    isPartOfObject(obj: BaseObject): boolean {
        for (const sub of this.iter()) {
            if (sub === obj) return true;
        }
        return false;
    }

    setCollisionHandler(handler: (other: BaseObject) => CollisionResponse): void {
        this.collisionHandler = handler;
    }

    onCollision(other: BaseObject): CollisionResponse {
        return this.collisionHandler(other);
    }

    moveByDelta(delta: number): void {
        throw new Error("moveByDelta not implemented");
    }

    clone(): BaseObject {
        throw new Error("clone not implemented");
    }

    iter(): IterableIterator<BaseObject> {
        function* generator(obj: BaseObject): IterableIterator<BaseObject> {
            yield obj;
        }
        return generator(this);
    }

    setParentObject(parent: BaseObject): void {
        this.parentObject = parent;
    }

    getParentObject(): BaseObject {
        return this.parentObject?.getParentObject() || this;
    }
}

class LineObject extends BaseObject {
    public pointA: Vec2;
    public pointB: Vec2;

    constructor(pointA: Vec2, pointB: Vec2, velocity: Vec2, inverseMass: number = 0, restitution: number = 1.0) {
        super(velocity, inverseMass, restitution);
        this.pointA = pointA;
        this.pointB = pointB;
    }

    moveByDelta(delta: number): void {
        const move = this.velocity.mul(delta);
        this.pointA = this.pointA.add(move);
        this.pointB = this.pointB.add(move);
    }

    clone(): LineObject {
        return new LineObject(this.pointA.clone(), this.pointB.clone(), this.velocity.clone(), this.inverseMass, this.restitution);
    }

    iter(): IterableIterator<BaseObject> {
        function* generator(obj: BaseObject): IterableIterator<BaseObject> {
            yield obj;
        }
        return generator(this);
    }
}

class CircleObject extends BaseObject {
    public center: Vec2;
    public radius: number;

    constructor(center: Vec2, radius: number, velocity: Vec2, inverseMass: number = 1.0, restitution: number = 1.0) {
        super(velocity, inverseMass, restitution);
        this.center = center;
        this.radius = radius;
    }

    moveByDelta(delta: number): void {
        const move = this.velocity.mul(delta);
        this.center = this.center.add(move);
    }

    clone(): CircleObject {
        return new CircleObject(this.center.clone(), this.radius, this.velocity.clone(), this.inverseMass, this.restitution);
    }

    iter(): IterableIterator<BaseObject> {
        function* generator(obj: BaseObject): IterableIterator<BaseObject> {
            yield obj;
        }
        return generator(this);
    }
}

class MultiObject extends BaseObject {
    public objects: BaseObject[];

    constructor(objects: BaseObject[], velocity: Vec2, inverseMass: number = 1.0, restitution: number = 1.0) {
        super(velocity, inverseMass, restitution);
        this.objects = objects;

        for (const obj of this.objects) {
            obj.setParentObject(this);
        }
    }

    moveByDelta(delta: number): void {
        const move = this.velocity.mul(delta);
        for (const obj of this.objects) {
            obj.moveByDelta(delta);
        }
    }

    addObject(obj: BaseObject): void {
        obj.setParentObject(this);
        this.objects.push(obj);
    }

    clone(): MultiObject {
        const clonedObjects = this.objects.map(obj => obj.clone());
        return new MultiObject(clonedObjects, this.velocity.clone(), this.inverseMass, this.restitution);
    }

    iter(): IterableIterator<BaseObject> {
        function* generator(objs: BaseObject[]): IterableIterator<BaseObject> {
            for (const obj of objs) {
                yield* obj.iter();
            }
        }
        return generator(this.objects);
    }
}

function getWallCollisionTime(
    ball: CircleObject,
    wall: LineObject,
) {
    const pointRelativeVelocity = ball.velocity.sub(wall.velocity);
    const pointRelativeStart = ball.center.sub(wall.pointA);

    const wallVec = wall.pointB.sub(wall.pointA);
    let wallNormal = wallVec.perp().normalize();

    if (pointRelativeVelocity.dot(wallNormal) >= -EPS)
        wallNormal = wallNormal.mul(-1);
    const vecAlongNormal = pointRelativeVelocity.dot(wallNormal);

    const distanceToLine = pointRelativeStart.dot(wallNormal);
    const tHit = (ball.radius - distanceToLine) / vecAlongNormal;

    if (tHit < 0) {
        return null;
    }

    const ballPosAtHit = pointRelativeStart.add(pointRelativeVelocity.mul(tHit));
    const shadowLengthSq = ballPosAtHit.dot(wallVec);
    const segmentT = shadowLengthSq / wallVec.dot(wallVec);

    if (segmentT < 0 || segmentT > 1) {
        return null;
    }

    return tHit;
}

function getBallCollisionTime(
    ballA: CircleObject,
    ballB: CircleObject,
): number | null {
    const pointRelativeStart = ballB.center.sub(ballA.center);
    const pointRelativeVelocity = ballB.velocity.sub(ballA.velocity);
    const combinedRadius = ballA.radius + ballB.radius;

    const a = pointRelativeVelocity.lenSq();
    const b = 2 * pointRelativeStart.dot(pointRelativeVelocity);
    const c = pointRelativeStart.lenSq() - Math.pow(combinedRadius, 2);

    const roots = solveQuadratic(a, b, c);
    if (roots.length > 0) {
        const t = roots[0]!

        if (t >= -EPS && t <= 1 + EPS) {
            return t;
        }
    }

    return null;
}

function resolveBallCollision(
    ballA: CircleObject,
    ballB: CircleObject,
): void {
    const normal = ballB.center.sub(ballA.center).normalize();
    const relativeVelocity = ballB.velocity.sub(ballA.velocity);
    const velocityAlongNormal = relativeVelocity.dot(normal);

    if (velocityAlongNormal > 0) {
        return;
    }

    const j = -(1 + Math.min(ballA.restitution, ballB.restitution)) * velocityAlongNormal / (ballA.inverseMass + ballB.inverseMass);

    const impulse = normal.mul(j);
    ballA.velocity = ballA.velocity.sub(impulse.mul(ballA.inverseMass));
    ballB.velocity = ballB.velocity.add(impulse.mul(ballB.inverseMass));
}

function resolveCircleLineCollision(
    ball: CircleObject,
    wall: LineObject,
): void {
    const wallVec = wall.pointB.sub(wall.pointA);
    const relativeVelocity = ball.velocity.sub(wall.velocity);

    let wallNormal = wallVec.perp().normalize();
    if (relativeVelocity.dot(wallNormal) > 0) {
        wallNormal = wallNormal.mul(-1);   
    }

    const velocityAlongNormal = relativeVelocity.dot(wallNormal);
    const j = -(1 + Math.min(ball.restitution, wall.restitution)) * velocityAlongNormal / (ball.inverseMass + wall.inverseMass);

    const impulse = wallNormal.mul(j);
    ball.velocity = ball.velocity.add(impulse.mul(ball.inverseMass));
    wall.velocity = wall.velocity.sub(impulse.mul(wall.inverseMass));
}

interface Collision {
    time: number;
    objectA: BaseObject;
    objectB: BaseObject;
};

type sceneObject = BaseObject;
class Scene {
    private objects: sceneObject[];
    private elapsedTime: number = 0;

    constructor() {
        this.objects = [];
    }

    public addObject(obj: sceneObject): void {
        this.objects.push(obj);
    }

    public getObjects(): sceneObject[] {
        return this.objects;
    }

    public getRawObjects(): sceneObject[] {
        let output = [];
        for (const obj of this.objects) {
            for (const subObj of obj.iter()) {
                output.push(subObj);
            }
        }
        return output;
    }

    private moveSceneObjects(deltaTime: number): void {
        for (const obj of this.objects) {
            obj.moveByDelta(deltaTime);
        }
        this.elapsedTime += deltaTime;
    }

    private getNextCollisionBetweenObjects(mainObjects: BaseObject[]): Collision | null {
        let earliestCollision: Collision | null = null;

        for (const parentA of mainObjects) {
            for (let j = 0; j < this.objects.length; j++) {
                const parentB = this.objects[j]!;
                if (parentA === parentB) continue;
                if (parentA.velocity.sub(parentB.velocity).lenSq() < EPS) continue;

                for (const objA of parentA.iter()) {
                    for (const objB of parentB.iter()) {
                        if (objA === objB) continue;

                        let tHit: number | null = null;

                        if (objA instanceof CircleObject && objB instanceof CircleObject) {
                            tHit = getBallCollisionTime(objA, objB);
                        } else if (objA instanceof CircleObject && objB instanceof LineObject) {
                            tHit = getWallCollisionTime(objA, objB);
                        } else if (objA instanceof LineObject && objB instanceof CircleObject) {
                            tHit = getWallCollisionTime(objB, objA);
                        }

                        if (tHit !== null && !isNaN(tHit) && (earliestCollision === null || tHit < earliestCollision.time)) {
                            earliestCollision = {
                                time: tHit,
                                objectA: objA,
                                objectB: objB,
                            };
                        }
                    }
                }
            }
        }

        return earliestCollision;
    }

    private fetchParentObject(obj: BaseObject): BaseObject | null {
        for (const sceneObj of this.objects) {
            if (sceneObj === obj) continue;
            if (sceneObj.isPartOfObject(obj)) {
                return this.fetchParentObject(sceneObj) || sceneObj;
            }
        }
        return null;
    }

    public playSimulation(deltaTime: number, mainObjects?: BaseObject[]) {
        console.log("Starting simulation step with deltaTime =", deltaTime);
        let timeRemaining = deltaTime;
        let shouldContinue = true;
        let timeout = 1000;

        while (timeRemaining > EPS && shouldContinue && timeout-- > 0) {
            const collision = this.getNextCollisionBetweenObjects(mainObjects || this.objects);

            if (collision === null || collision.time - EPS > timeRemaining) {
                this.moveSceneObjects(timeRemaining);
                break;
            }

            const earliestHit = collision.time;
            this.moveSceneObjects(earliestHit);
            timeRemaining -= earliestHit;

            const parentA = this.fetchParentObject(collision.objectA) || collision.objectA;
            const parentB = this.fetchParentObject(collision.objectB) || collision.objectB;
            const aTask = parentA.onCollision(parentB);
            const bTask = parentB.onCollision(parentA);

            const handleMethod = Math.max(aTask, bTask);
            switch (handleMethod) {
                case CollisionResponse.IGNORE:
                    collision.objectA.moveByDelta(FAT_EPS);
                    collision.objectB.moveByDelta(FAT_EPS);
                    break;
                case CollisionResponse.RESET:
                    if (aTask === CollisionResponse.RESET)
                        this.objects = this.objects.filter(obj => obj !== parentA);
                    if (bTask === CollisionResponse.RESET)
                        this.objects = this.objects.filter(obj => obj !== parentB);
                    break;
                case CollisionResponse.BOUNCE:
                    collision.objectA.moveByDelta(FAT_EPS);
                    collision.objectB.moveByDelta(FAT_EPS);
                    if (collision.objectA instanceof CircleObject && collision.objectB instanceof CircleObject) {
                        resolveBallCollision(collision.objectA, collision.objectB);
                    } else if (collision.objectA instanceof CircleObject && collision.objectB instanceof LineObject) {
                        resolveCircleLineCollision(collision.objectA, collision.objectB);
                    } else if (collision.objectA instanceof LineObject && collision.objectB instanceof CircleObject) {
                        resolveCircleLineCollision(collision.objectB, collision.objectA);
                    } else {
                        console.warn(`Collision resolution not implemented for ${collision.objectA.constructor.name} and ${collision.objectB.constructor.name}`);
                    }
                    break;
            }
        }
    }
}

type PongPaddleKeyData = {
    key: string;
    isPressed: boolean;
    isClockwise: boolean;
}

class PongPaddle extends MultiObject {
    public keyData: PongPaddleKeyData[];
    public playerId: number = -1;
    public clockwiseBaseVelocity: Vec2;
    public bounds: { min: Vec2; max: Vec2 };

    constructor(center: Vec2, width: number, height: number, paddleDirection: Vec2, protectedWallWidth: number, walls: LineObject[] = []) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const topLine = new LineObject(
            center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)),
            center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(halfHeight)),
            new Vec2(0, 0),
            0,
            1.0,
        )

        const bottomLine = new LineObject(
            center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)),
            center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(halfHeight)),
            new Vec2(0, 0),
            0,
            1.0,
        )

        const leftLine = new LineObject(
            center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)),
            center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)),
            new Vec2(0, 0),
            0,
            1.0,
        )

        const rightLine = new LineObject(
            center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(halfHeight)),
            center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(halfHeight)),
            new Vec2(0, 0),
            0,
            1.0,
        )

        const topLeftCorner = new CircleObject(
            center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)),
            0,
            new Vec2(0, 0),
            0,
            1.0,
        );

        const topRightCorner = new CircleObject(
            center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(halfHeight)),
            0,
            new Vec2(0, 0),
            0,
            1.0,
        );

        const bottomLeftCorner = new CircleObject(
            center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)),
            0,
            new Vec2(0, 0),
            0,
            1.0,
        );

        const bottomRightCorner = new CircleObject(
            center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(halfHeight)),
            0,
            new Vec2(0, 0),
            0,
            1.0,
        );

        super([topLine, bottomLine, leftLine, rightLine, topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner], new Vec2(0, 0), 0, 1.0);
        this.clockwiseBaseVelocity = paddleDirection.clone().perp().normalize();
        this.keyData = [];
        this.playerId = -1;

        const maxTravelDistance = Math.min(
            getWallCollisionTime(new CircleObject(center.sub(paddleDirection.normalize().mul(halfHeight)), 10, paddleDirection.perp().normalize().mul(-1)), walls[0]!) || Infinity,
            getWallCollisionTime(new CircleObject(center.sub(paddleDirection.normalize().mul(halfHeight)), 10, paddleDirection.perp().normalize().mul(1)), walls[1]!) || Infinity,
            getWallCollisionTime(new CircleObject(center.add(paddleDirection.normalize().mul(halfHeight)), 10, paddleDirection.perp().normalize().mul(-1)), walls[0]!) || Infinity,
            getWallCollisionTime(new CircleObject(center.add(paddleDirection.normalize().mul(halfHeight)), 10, paddleDirection.perp().normalize().mul(1)), walls[1]!) || Infinity,
            protectedWallWidth / 2,
        ) - halfWidth - 1;

        this.bounds = {
            min: center.sub(paddleDirection.normalize().perp().mul(maxTravelDistance)),
            max: center.add(paddleDirection.normalize().perp().mul(maxTravelDistance)),
        };

        const isTopHalf = (new Vec2(0, -1).dot(paddleDirection) > 0);
        this.keyData = [
            { key: "ArrowLeft", isPressed: false, isClockwise: !isTopHalf },
            { key: "ArrowRight", isPressed: false, isClockwise: isTopHalf },
        ]
    }

    private getCenter(): Vec2 {
        let sum = new Vec2(0, 0);
        let count = 0;
        for (const obj of this.objects) {
            if (obj instanceof LineObject) {
                sum = sum.add(obj.pointA).add(obj.pointB);
                count += 2;
            } else if (obj instanceof CircleObject) {
                sum = sum.add(obj.center);
                count += 1;
            }
        }
        return sum.div(count);
    }

    /// Update the paddle velocity based on the current key states and the given paddle speed. Return the amount of time this move will maximally take before hitting the bounds.
    public updatePaddleVelocity(paddleSpeed: number): number {
        let moveDirection = 0;
        for (const keyData of this.keyData) {
            if (keyData.isPressed) {
                moveDirection += keyData.isClockwise ? 1 : -1;
            }
        }

        if (moveDirection === 0) {
            this.velocity = new Vec2(0, 0);
            return Infinity;
        }

        const desiredVelocity = this.clockwiseBaseVelocity.normalize().mul(moveDirection * paddleSpeed);
        const maxTravelDistance = moveDirection > 0 ? this.bounds.max.sub(this.getCenter()).len() : this.getCenter().sub(this.bounds.min).len();
        console.log("Paddle max travel distance:", maxTravelDistance);

        if (maxTravelDistance < 1) {
            this.velocity = new Vec2(0, 0);
            return Infinity;
        }

        const maxTravelTime = maxTravelDistance / desiredVelocity.len();
        this.velocity = desiredVelocity;
        return maxTravelTime;
    }
}

class PongBall extends CircleObject {
    private static idCounter = 0;
    public readonly id: number;

    constructor(center: Vec2, radius: number, velocity: Vec2) {
        super(center, radius, velocity, 1.0, 1.0);
        this.id = PongBall.idCounter++;

        this.setCollisionHandler((other: BaseObject) => {
            return CollisionResponse.BOUNCE;
        });
    }
}

class Powerup extends CircleObject {
    constructor(center: Vec2, radius: number, velocity: Vec2) {
        super(center, radius, velocity, 0.5, 1.0);

        this.setCollisionHandler((other: BaseObject) => {
            return CollisionResponse.RESET;
        });
    }
}

type PongGameOptions = {
    canvasWidth: number;
    canvasHeight: number;
    ballSpeed: number;
    paddleSpeed: number;
    paddleSize?: number;
    paddleWallOffset?: number;
    amountOfBalls?: number;
    powerupFrequency: number;
}

class PongGame {
    private walls: LineObject[] = [];
    private balls: PongBall[] = [];
    private powerups: Powerup[] = [];
    private paddles: PongPaddle[] = [];
    private scene: Scene = new Scene();
    private score: Map<number, number> = new Map();

    private constructPlayingField(players: number[], gameOptions: PongGameOptions): void {
        const size = Math.min(gameOptions.canvasWidth, gameOptions.canvasHeight);
        const halfSize = size / 2;
        const center = new Vec2(Math.floor(gameOptions.canvasWidth / 2), Math.floor(gameOptions.canvasHeight / 2));

        const amountOfWalls = Math.max(3, players.length);
        const halfAngleStep = Math.PI / amountOfWalls;
        const angleStep = (2 * Math.PI) / amountOfWalls;

        for (let i = 0; i < players.length; i++) {
            const wallStart = center.add(new Vec2(0, -1).rotate(i * angleStep - halfAngleStep).mul(halfSize));
            const wallEnd = center.add(new Vec2(0, -1).rotate(i * angleStep + halfAngleStep).mul(halfSize));
            const wall = new LineObject(wallStart, wallEnd, new Vec2(0, 0), 0, 1.0);

            wall.onCollision = (other: BaseObject): CollisionResponse => {
                console.log(`Ball collided with player ${players[i]}'s wall.`);
                if (other instanceof PongBall) {
                    this.score.set(players[i]!, (this.score.get(players[i]!) || 0) - 1);
                    console.log(`Player ${players[i]} conceded a point! Current score: ${this.score.get(players[i]!)}.`);
                }
                return CollisionResponse.BOUNCE;
            }

            this.walls.push(wall);
            this.scene.addObject(wall);
        }

        for (let i = 0; i < players.length; i++) {
            const wallStart = center.add(new Vec2(0, -1).rotate(i * angleStep - halfAngleStep).mul(halfSize));
            const wallEnd = center.add(new Vec2(0, -1).rotate(i * angleStep + halfAngleStep).mul(halfSize));
            const cSq = wallStart.sub(center).lenSq();
            const bSq = (wallEnd.sub(wallStart).len() / 2) ** 2;
            const aSq = cSq - bSq;

            const closestDistanceWallToCenter =  Math.sqrt(aSq)
            const playerPaddleSize = (gameOptions.paddleSize || 0.3) * (wallEnd.sub(wallStart).len());
            const playerPaddleOffset = gameOptions.paddleWallOffset || 50;
            const paddleCenter = center.add(new Vec2(0, -1).rotate(i * angleStep).mul(closestDistanceWallToCenter - playerPaddleOffset));
            const paddle = new PongPaddle(paddleCenter, playerPaddleSize, 20, new Vec2(0, -1).rotate(i * angleStep).normalize(), wallEnd.sub(wallStart).len(), [this.walls[(i-1 + this.walls.length) % this.walls.length]!, this.walls[(i+1) % this.walls.length]!]);
            this.paddles.push(paddle);
            this.scene.addObject(paddle);
        }
    }

    constructor(players: number[], gameOptions: PongGameOptions) {
        this.walls = [];
        this.balls = [];
        this.paddles = [];
        this.powerups = [];

        this.constructPlayingField(players, gameOptions);

        for (let i = 0; i < (gameOptions.amountOfBalls || 1); i++) {
            const ballDirection = new Vec2(0, -1).rotate(i * (2 * Math.PI) / (gameOptions.amountOfBalls || 1));
            const ball = new PongBall(new Vec2(gameOptions.canvasWidth / 2, gameOptions.canvasHeight / 2), 10, ballDirection.mul(gameOptions.ballSpeed));
            ball.onCollision = (other: BaseObject): CollisionResponse => {
                if (other instanceof LineObject) {
                    const wall = this.walls.find(w => w === other);
                    if (wall) {
                        console.log(`Ball collided with wall.`);
                        ball.center = new Vec2(gameOptions.canvasWidth / 2, gameOptions.canvasHeight / 2);
                        ball.velocity = new Vec2(0, -1).rotate(Math.random() * 2 * Math.PI).mul(gameOptions.ballSpeed);
                        return CollisionResponse.IGNORE;
                    }
                }
                return CollisionResponse.BOUNCE;
            }
            this.balls.push(ball);
            this.scene.addObject(ball);
        }
    }

    public getScene(): Scene {
        return this.scene;
    }

    public playSimulation(deltaTime: number): void {
        let timeRemaining = deltaTime;

        while (timeRemaining > EPS) {
            let minPaddleTime = Infinity;
            for (const paddle of this.paddles) {
                const paddleTime = paddle.updatePaddleVelocity(400);
                if (paddleTime < minPaddleTime) {
                    minPaddleTime = paddleTime;
                }
            }

            const stepTime = Math.min(timeRemaining, minPaddleTime);
            this.scene.playSimulation(stepTime, this.balls);
            timeRemaining -= stepTime;
        }
    }

    public handleKeyPress(key: string, isPressed: boolean): void {
        for (const paddle of this.paddles) {
            for (const keyData of paddle.keyData) {
                if (keyData.key !== key) continue;
                keyData.isPressed = isPressed;
            }
        }
    }
}