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

    private collisionHandler: (other: BaseObject, elapsedTime: number) => CollisionResponse = (other: BaseObject, elapsedTime: number) => CollisionResponse.BOUNCE;

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

    setCollisionHandler(handler: (other: BaseObject, elapsedTime: number) => CollisionResponse): void {
        this.collisionHandler = handler;
    }

    onCollision(other: BaseObject, elapsedTime: number): CollisionResponse {
        return this.collisionHandler(other, elapsedTime);
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
    private timeScale: number = 1.0;

    constructor() {
        this.objects = [];
    }

    public setTimeScale(scale: number): void {
        this.timeScale = scale;
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
        this.elapsedTime += (deltaTime / this.timeScale);
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
        let timeRemaining = deltaTime * this.timeScale;
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
            const aTask = parentA.onCollision(parentB, this.elapsedTime);
            const bTask = parentB.onCollision(parentA, this.elapsedTime);

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

    public getElapsedTime(): number {
        return this.elapsedTime;
    }
}

type PongPaddleKeyData = {
    key: string;
    isPressed: boolean;
    isClockwise: boolean;
}

enum PowerupType {
    ADD_BALL,
    INCREASE_PADDLE_SPEED,
    DECREASE_PADDLE_SPEED,
    SLOW_MOTION,
    REVERSE_CONTROLS,
}

type PowerupData = {
    type: PowerupType;
    chance: number;
    duration: number | null;
}

const powerupData: PowerupData[] = [
    { type: PowerupType.ADD_BALL, chance: 30, duration: null },
    { type: PowerupType.INCREASE_PADDLE_SPEED, chance: 20, duration: 10 },
    { type: PowerupType.DECREASE_PADDLE_SPEED, chance: 20, duration: 10 },
    { type: PowerupType.SLOW_MOTION, chance: 20, duration: 10 },
    { type: PowerupType.REVERSE_CONTROLS, chance: 10, duration: 10 },
];
const totalPowerupChance = powerupData.reduce((sum, p) => sum + p.chance, 0);

class PongPaddle extends MultiObject {
    public keyData: PongPaddleKeyData[];
    public playerId: number;
    public clockwiseBaseVelocity: Vec2;
    public bounds: { min: Vec2; max: Vec2 };
    public paddleWidth: number;
    public paddleHeight: number;
    public paddleAngle: number;

    private boardPaddleSpeed: number;
    private reverseControls: boolean = false;

    constructor(center: Vec2, width: number, height: number, paddleDirection: Vec2, protectedWallWidth: number, paddleSpeedFactor: number, walls: LineObject[] = [], playerId: number) {
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
        this.boardPaddleSpeed = protectedWallWidth * paddleSpeedFactor;
        this.paddleHeight = height;
        this.paddleWidth = width;
        this.paddleAngle = paddleDirection.angle();
        this.playerId = playerId;
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

    public setReverseControls(reverse: boolean): void {
        this.reverseControls = reverse;
    }

    /// Update the paddle velocity based on the current key states and the given paddle speed. Return the amount of time this move will maximally take before hitting the bounds.
    public updatePaddleVelocity(): number {
        let moveDirection = 0;
        for (const keyData of this.keyData) {
            if (keyData.isPressed) {
                moveDirection += (keyData.isClockwise !== this.reverseControls) ? 1 : -1;
            }
        }

        if (moveDirection === 0) {
            this.velocity = new Vec2(0, 0);
            return Infinity;
        }

        const desiredVelocity = this.clockwiseBaseVelocity.normalize().mul(moveDirection * this.boardPaddleSpeed);
        const maxTravelDistance = moveDirection > 0 ? this.bounds.max.sub(this.getCenter()).len() : this.getCenter().sub(this.bounds.min).len();

        if (maxTravelDistance < 1) {
            this.velocity = new Vec2(0, 0);
            return Infinity;
        }

        const maxTravelTime = maxTravelDistance / desiredVelocity.len();
        this.velocity = desiredVelocity;
        return maxTravelTime;
    }

    public getSpeed(): number {
        return this.boardPaddleSpeed;
    }

    public setSpeed(newSpeed: number): void {
        this.boardPaddleSpeed = newSpeed;
    }

    public toJSON(): any {
        const center = this.getCenter();
        const velocity = this.velocity;
        return [
            center.x,
            center.y,
            this.paddleAngle,
            this.paddleWidth,
            this.paddleHeight,
            velocity.x,
            velocity.y,
            this.playerId,
        ]
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

    public toJSON(): any {
        return [
            this.center.x,
            this.center.y,
            this.velocity.x,
            this.velocity.y,
            this.radius,
            this.inverseMass,
        ]
    }
}

class Powerup extends CircleObject {
    private activationStartTime: number | null = null;
    private metadata: PowerupData;
    private spawnTime: number;
    private game: PongGame;

    constructor(center: Vec2, radius: number, velocity: Vec2, powerup: PowerupData, game: PongGame) {
        super(center, radius, velocity, 0.5, 1.0);
        this.metadata = powerup;
        this.game = game;
        this.spawnTime = game.getScene().getElapsedTime();

        this.setCollisionHandler((other: BaseObject) => {
            if (other instanceof PongBall) {
                console.log(`Powerup of type ${PowerupType[this.metadata.type]} collected by ball ID ${other.id}.`);
                this.game.applyPowerupEffect(this, other);
            }

            return CollisionResponse.RESET;
        });
    }

    static generateRandomPowerup(center: Vec2, velocity: Vec2, game: PongGame): Powerup {
        let randomPowerupIndex = Math.random() * totalPowerupChance;
        let newPowerup: PowerupData | undefined = undefined;
        for (const powerup of powerupData) {
            if (randomPowerupIndex < powerup.chance) {
                newPowerup = powerup;
                break;
            }
            randomPowerupIndex -= powerup.chance;
        }

        if (newPowerup === undefined) {
            newPowerup = powerupData[0]!;
        }

        return new Powerup(center, 10, velocity, newPowerup, game);
    }

    public getPowerupType(): PowerupType {
        return this.metadata.type;
    }

    public activate(currentTime: number): void {
        this.activationStartTime = currentTime;
    }

    public isPowerupActive(currentTime: number): boolean {
        if (this.activationStartTime === null || this.metadata.duration === null) return false;
        return (currentTime - this.activationStartTime + EPS) < this.metadata.duration;
    }

    public isPowerupTaken(): boolean {
        return this.activationStartTime !== null;
    }

    public isTimeBased(): boolean {
        return this.metadata.duration !== null;
    }

    public getRemainingPowerupTime(currentTime: number): number {
        if (this.activationStartTime === null) return 0;
        if (this.metadata.duration === null) return Infinity;
        const elapsed = currentTime - this.activationStartTime;
        return Math.max(0, this.metadata.duration - elapsed);
    }

    public toJSON(): any {
        return [
            this.center.x,
            this.center.y,
            this.velocity.x,
            this.velocity.y,
            this.radius,
            this.spawnTime,
            this.metadata.type,
            this.metadata.duration,
            this.activationStartTime,
        ]
    }
}

class Wall extends LineObject {
    public playerId: number;

    constructor(pointA: Vec2, pointB: Vec2, playerId: number) {
        super(pointA, pointB, new Vec2(0, 0), 0, 1.0);
        this.playerId = playerId;
    }

    public toJSON(): any {
        return [
            this.pointA.x,
            this.pointA.y,
            this.pointB.x,
            this.pointB.y,
            this.velocity.x,
            this.velocity.y,
            this.playerId,
        ]
    }
}

type PongGameOptions = {
    canvasWidth: number;
    canvasHeight: number;
    ballSpeed: number;
    paddleSpeedFactor: number;
    paddleSize?: number;
    paddleWallOffset?: number;
    amountOfBalls?: number;
    powerupFrequency: number;
}

class PongGame {
    private walls: Wall[] = [];
    private balls: PongBall[] = [];
    private powerups: Powerup[] = [];
    private paddles: PongPaddle[] = [];
    private scene: Scene = new Scene();
    private score: Map<number, number> = new Map();

    private gameOptions: PongGameOptions;
    private nextPowerupSpawnTime: number = 0;

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
            const wall = new Wall(wallStart, wallEnd, players[i]!);

            wall.setCollisionHandler((other: BaseObject): CollisionResponse => {
                console.log(`Ball collided with player ${players[i]}'s wall.`);
                if (other instanceof PongBall) {
                    this.score.set(players[i]!, (this.score.get(players[i]!) || 0) - 1);
                    console.log(`Player ${players[i]} conceded a point! Current score: ${this.score.get(players[i]!)}.`);
                }
                return CollisionResponse.BOUNCE;
            });

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
            const paddle = new PongPaddle(paddleCenter, playerPaddleSize, 20, new Vec2(0, -1).rotate(i * angleStep).normalize(), wallEnd.sub(wallStart).len(), gameOptions.paddleSpeedFactor, [this.walls[(i-1 + this.walls.length) % this.walls.length]!, this.walls[(i+1) % this.walls.length]!], players[i]!);
            this.paddles.push(paddle);
            this.scene.addObject(paddle);
        }
    }

    private spawnNewBall(position: Vec2, velocity: Vec2, radius: number, inverseMass: number, gameOptions: PongGameOptions): void {
        const ball = new PongBall(position, radius, velocity);
        ball.setCollisionHandler((other: BaseObject, elapsedTime: number): CollisionResponse => {
            if (other instanceof LineObject) {
                const wall = this.walls.find(w => w === other);
                if (wall) {
                    ball.center = new Vec2(gameOptions.canvasWidth / 2, gameOptions.canvasHeight / 2);
                    ball.velocity = new Vec2(0, -1).rotate(Math.random() * 2 * Math.PI).mul(gameOptions.ballSpeed);
                    return CollisionResponse.IGNORE;
                }
            }
            return CollisionResponse.BOUNCE;
        });

        ball.inverseMass = inverseMass;
        this.balls.push(ball);
        this.scene.addObject(ball);
    }

    private spawnNewPowerup(): void {
        const gameOptions = this.gameOptions;
        const position = new Vec2(Math.random() * gameOptions.canvasWidth * 0.8 + gameOptions.canvasWidth * 0.1, Math.random() * gameOptions.canvasHeight * 0.8 + gameOptions.canvasHeight * 0.1);
        const velocity = new Vec2(0, 0);
        const powerup = Powerup.generateRandomPowerup(position, velocity, this);
        this.powerups.push(powerup);
        this.scene.addObject(powerup);
        console.log(`Spawned new powerup of type ${PowerupType[powerup.getPowerupType()]} at position (${position.x.toFixed(2)}, ${position.y.toFixed(2)}).`);
    }

    constructor(players: number[], gameOptions: PongGameOptions) {
        this.walls = [];
        this.balls = [];
        this.paddles = [];
        this.powerups = [];

        this.constructPlayingField(players, gameOptions);
        this.gameOptions = gameOptions;

        for (let i = 0; i < (gameOptions.amountOfBalls || 1); i++) {
            const ballDirection = new Vec2(0, -1).rotate(i * (2 * Math.PI) / (gameOptions.amountOfBalls || 1));
            this.spawnNewBall(new Vec2(gameOptions.canvasWidth / 2, gameOptions.canvasHeight / 2), ballDirection.mul(gameOptions.ballSpeed), 10, 1.0, gameOptions);
        }

        for (let i = 0; i < players.length; i++) {
            this.score.set(players[i]!, 0);
            this.spawnNewPowerup();
        }
    }

    public getScene(): Scene {
        return this.scene;
    }

    public playSimulation(deltaTime: number): void {
        let timeRemaining = deltaTime;
        this.cleanUpExpiredPowerups();

        if (this.scene.getElapsedTime() >= this.nextPowerupSpawnTime) {
            this.spawnNewPowerup();
            this.nextPowerupSpawnTime += this.gameOptions.powerupFrequency * (0.8 + Math.random() * 0.4);
        }

        while (timeRemaining > EPS) {
            let minPaddleTime = Infinity;
            for (const paddle of this.paddles) {
                const paddleTime = paddle.updatePaddleVelocity();
                if (paddleTime < minPaddleTime) {
                    minPaddleTime = paddleTime;
                }
            }

            const stepTime = Math.min(timeRemaining, minPaddleTime);
            this.scene.playSimulation(stepTime, this.balls);
            timeRemaining -= stepTime;
        }
    }

    public applyPowerupEffect(powerup: Powerup, ball: PongBall): void {
        switch (powerup.getPowerupType()) {
            case PowerupType.ADD_BALL:
                this.spawnNewBall(ball.center.clone(), ball.velocity.clone().rotate(Math.random() * Math.PI / 4 - Math.PI / 8), ball.radius, 1.0, this.gameOptions);
                break;

            case PowerupType.INCREASE_PADDLE_SPEED:
                this.paddles.forEach(paddle => paddle.setSpeed(paddle.getSpeed() * 2));
                break;

            case PowerupType.DECREASE_PADDLE_SPEED:
                this.paddles.forEach(paddle => paddle.setSpeed(paddle.getSpeed() * 0.5));
                break;

            case PowerupType.SLOW_MOTION:
                this.scene.setTimeScale(0.5);
                break;

            case PowerupType.REVERSE_CONTROLS:
                this.paddles.forEach(paddle => paddle.setReverseControls(true));
                break;
        }

        powerup.activate(this.scene.getElapsedTime());
    }

    public removePowerupEffects(powerup: Powerup): void {
        switch (powerup.getPowerupType()) {
            case PowerupType.INCREASE_PADDLE_SPEED:
                this.paddles.forEach(paddle => paddle.setSpeed(paddle.getSpeed() / 2));
                break;
            
            case PowerupType.DECREASE_PADDLE_SPEED:
                this.paddles.forEach(paddle => paddle.setSpeed(paddle.getSpeed() * 2));
                break;

            case PowerupType.SLOW_MOTION:
                this.scene.setTimeScale(1.0);
                break;

            case PowerupType.REVERSE_CONTROLS:
                this.paddles.forEach(paddle => paddle.setReverseControls(false));
                break;
            
            default:
                if (powerup.isTimeBased()) {
                    console.warn(`Powerup of type ${PowerupType[powerup.getPowerupType()]} has no removal effect defined.`);
                }
                break;
        }
    }

    private cleanUpExpiredPowerups(): void {
        const currentTime = this.scene.getElapsedTime();
        this.powerups = this.powerups.filter(powerup => {
            const couldBeRemoved = !(powerup.isPowerupActive(currentTime) || !powerup.isPowerupTaken());
            if (couldBeRemoved) {
                console.log(`Removing expired powerup of type ${PowerupType[powerup.getPowerupType()]}.`);
                this.scene.getObjects().splice(this.scene.getObjects().indexOf(powerup), 1);
                this.removePowerupEffects(powerup);
            }
            return !couldBeRemoved;
        });
    }

    public handleKeyPress(key: string, isPressed: boolean): void {
        for (const paddle of this.paddles) {
            for (const keyData of paddle.keyData) {
                if (keyData.key !== key) continue;
                keyData.isPressed = isPressed;
            }
        }
    }

    public fetchPlayerScoreMap(): Map<number, number> {
        const allPlayers: Set<number> = new Set();
        for (const paddle of this.paddles)
            allPlayers.add(paddle.playerId);

        const scoreMap: Map<number, number> = new Map();

        for (const basePlayerId of allPlayers) {
            const playerNegativeScore = this.score.get(basePlayerId) || 0;
            if (playerNegativeScore >= 0) continue;

            for (const playerId of allPlayers) {
                if (playerId === basePlayerId) continue;
                scoreMap.set(playerId, (scoreMap.get(playerId) || 0) + Math.abs(playerNegativeScore));
            }
        }

        return scoreMap;
    }

    public fetchBoardJSON(): any {
        return {
            metadata: {
                gameOptions: this.gameOptions,
                elapsedTime: this.scene.getElapsedTime(),
                players: this.paddles.map(paddle => paddle.playerId),
            },
            walls: this.walls.map(wall => wall.toJSON()),
            balls: this.balls.map(ball => ball.toJSON()),
            paddles: this.paddles.map(paddle => paddle.toJSON()),
            powerups: this.powerups.map(powerup => powerup.toJSON()),
            score: Object.fromEntries(this.fetchPlayerScoreMap()),
        }
    }
}