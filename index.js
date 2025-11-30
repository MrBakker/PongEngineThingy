var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var EPS = 1e-9;
var FAT_EPS = 1e-5;
function isNearly(x, n) {
    return Math.abs(x - n) < EPS;
}
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.add = function (v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    };
    Vec2.prototype.sub = function (v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    };
    Vec2.prototype.mul = function (s) {
        return new Vec2(this.x * s, this.y * s);
    };
    Vec2.prototype.div = function (s) {
        return new Vec2(this.x / s, this.y / s);
    };
    Vec2.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    Vec2.prototype.len = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vec2.prototype.lenSq = function () {
        return this.dot(this);
    };
    Vec2.prototype.normalize = function () {
        var length = this.len();
        if (length !== 0) {
            return this.div(length);
        }
        return new Vec2(0, 0);
    };
    Vec2.prototype.angle = function () {
        return Math.atan2(this.y, this.x);
    };
    Vec2.prototype.rotate = function (angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var x = this.x * cos - this.y * sin;
        var y = this.x * sin + this.y * cos;
        return new Vec2(x, y);
    };
    Vec2.prototype.perp = function () {
        return new Vec2(-this.y, this.x);
    };
    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };
    return Vec2;
}());
function solveQuadratic(a, b, c) {
    if (isNearly(a, 0)) {
        if (isNearly(b, 0))
            return [];
        return [-c / b];
    }
    var disc = b * b - 4 * a * c;
    if (disc < -EPS)
        return [];
    if (disc < 0)
        return [-b / (2 * a)];
    var sqrtDisc = Math.sqrt(disc);
    return [(-b - sqrtDisc) / (2 * a), (-b + sqrtDisc) / (2 * a)];
}
var CollisionResponse;
(function (CollisionResponse) {
    CollisionResponse[CollisionResponse["BOUNCE"] = 0] = "BOUNCE";
    CollisionResponse[CollisionResponse["IGNORE"] = 1] = "IGNORE";
    CollisionResponse[CollisionResponse["RESET"] = 2] = "RESET";
})(CollisionResponse || (CollisionResponse = {}));
;
var BaseObject = /** @class */ (function () {
    function BaseObject(velocity, inverseMass, restitution, parentObject) {
        if (inverseMass === void 0) { inverseMass = 1.0; }
        if (restitution === void 0) { restitution = 1.0; }
        if (parentObject === void 0) { parentObject = null; }
        this.parentObject = null;
        this.collisionHandler = function (other, elapsedTime) { return CollisionResponse.BOUNCE; };
        this._velocity = velocity;
        this._inverseMass = inverseMass;
        this._restitution = restitution;
        this.parentObject = parentObject;
    }
    Object.defineProperty(BaseObject.prototype, "velocity", {
        get: function () {
            return this.getParentObject()._velocity;
        },
        set: function (v) {
            this.getParentObject()._velocity = v;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseObject.prototype, "inverseMass", {
        get: function () {
            return this.getParentObject()._inverseMass;
        },
        set: function (m) {
            this.getParentObject()._inverseMass = m;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseObject.prototype, "restitution", {
        get: function () {
            return this.getParentObject()._restitution;
        },
        set: function (r) {
            this.getParentObject()._restitution = r;
        },
        enumerable: false,
        configurable: true
    });
    BaseObject.prototype.isPartOfObject = function (obj) {
        var e_1, _a;
        try {
            for (var _b = __values(this.iter()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var sub = _c.value;
                if (sub === obj)
                    return true;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    };
    BaseObject.prototype.setCollisionHandler = function (handler) {
        this.collisionHandler = handler;
    };
    BaseObject.prototype.onCollision = function (other, elapsedTime) {
        return this.collisionHandler(other, elapsedTime);
    };
    BaseObject.prototype.moveByDelta = function (delta) {
        throw new Error("moveByDelta not implemented");
    };
    BaseObject.prototype.clone = function () {
        throw new Error("clone not implemented");
    };
    BaseObject.prototype.iter = function () {
        function generator(obj) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, obj];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        return generator(this);
    };
    BaseObject.prototype.setParentObject = function (parent) {
        this.parentObject = parent;
    };
    BaseObject.prototype.getParentObject = function () {
        var _a;
        return ((_a = this.parentObject) === null || _a === void 0 ? void 0 : _a.getParentObject()) || this;
    };
    return BaseObject;
}());
var LineObject = /** @class */ (function (_super) {
    __extends(LineObject, _super);
    function LineObject(pointA, pointB, velocity, inverseMass, restitution) {
        if (inverseMass === void 0) { inverseMass = 0; }
        if (restitution === void 0) { restitution = 1.0; }
        var _this = _super.call(this, velocity, inverseMass, restitution) || this;
        _this.pointA = pointA;
        _this.pointB = pointB;
        return _this;
    }
    LineObject.prototype.moveByDelta = function (delta) {
        var move = this.velocity.mul(delta);
        this.pointA = this.pointA.add(move);
        this.pointB = this.pointB.add(move);
    };
    LineObject.prototype.clone = function () {
        return new LineObject(this.pointA.clone(), this.pointB.clone(), this.velocity.clone(), this.inverseMass, this.restitution);
    };
    LineObject.prototype.iter = function () {
        function generator(obj) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, obj];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        return generator(this);
    };
    return LineObject;
}(BaseObject));
var CircleObject = /** @class */ (function (_super) {
    __extends(CircleObject, _super);
    function CircleObject(center, radius, velocity, inverseMass, restitution) {
        if (inverseMass === void 0) { inverseMass = 1.0; }
        if (restitution === void 0) { restitution = 1.0; }
        var _this = _super.call(this, velocity, inverseMass, restitution) || this;
        _this.center = center;
        _this.radius = radius;
        return _this;
    }
    CircleObject.prototype.moveByDelta = function (delta) {
        var move = this.velocity.mul(delta);
        this.center = this.center.add(move);
    };
    CircleObject.prototype.clone = function () {
        return new CircleObject(this.center.clone(), this.radius, this.velocity.clone(), this.inverseMass, this.restitution);
    };
    CircleObject.prototype.iter = function () {
        function generator(obj) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, obj];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        return generator(this);
    };
    return CircleObject;
}(BaseObject));
var MultiObject = /** @class */ (function (_super) {
    __extends(MultiObject, _super);
    function MultiObject(objects, velocity, inverseMass, restitution) {
        var e_2, _a;
        if (inverseMass === void 0) { inverseMass = 1.0; }
        if (restitution === void 0) { restitution = 1.0; }
        var _this = _super.call(this, velocity, inverseMass, restitution) || this;
        _this.objects = objects;
        try {
            for (var _b = __values(_this.objects), _c = _b.next(); !_c.done; _c = _b.next()) {
                var obj = _c.value;
                obj.setParentObject(_this);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return _this;
    }
    MultiObject.prototype.moveByDelta = function (delta) {
        var e_3, _a;
        var move = this.velocity.mul(delta);
        try {
            for (var _b = __values(this.objects), _c = _b.next(); !_c.done; _c = _b.next()) {
                var obj = _c.value;
                obj.moveByDelta(delta);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    MultiObject.prototype.addObject = function (obj) {
        obj.setParentObject(this);
        this.objects.push(obj);
    };
    MultiObject.prototype.clone = function () {
        var clonedObjects = this.objects.map(function (obj) { return obj.clone(); });
        return new MultiObject(clonedObjects, this.velocity.clone(), this.inverseMass, this.restitution);
    };
    MultiObject.prototype.iter = function () {
        function generator(objs) {
            var objs_1, objs_1_1, obj, e_4_1;
            var e_4, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        objs_1 = __values(objs), objs_1_1 = objs_1.next();
                        _b.label = 1;
                    case 1:
                        if (!!objs_1_1.done) return [3 /*break*/, 4];
                        obj = objs_1_1.value;
                        return [5 /*yield**/, __values(obj.iter())];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        objs_1_1 = objs_1.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_4_1 = _b.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (objs_1_1 && !objs_1_1.done && (_a = objs_1.return)) _a.call(objs_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }
        return generator(this.objects);
    };
    return MultiObject;
}(BaseObject));
function getWallCollisionTime(ball, wall) {
    var pointRelativeVelocity = ball.velocity.sub(wall.velocity);
    var pointRelativeStart = ball.center.sub(wall.pointA);
    var wallVec = wall.pointB.sub(wall.pointA);
    var wallNormal = wallVec.perp().normalize();
    if (pointRelativeVelocity.dot(wallNormal) >= -EPS)
        wallNormal = wallNormal.mul(-1);
    var vecAlongNormal = pointRelativeVelocity.dot(wallNormal);
    var distanceToLine = pointRelativeStart.dot(wallNormal);
    var tHit = (ball.radius - distanceToLine) / vecAlongNormal;
    if (tHit < 0) {
        return null;
    }
    var ballPosAtHit = pointRelativeStart.add(pointRelativeVelocity.mul(tHit));
    var shadowLengthSq = ballPosAtHit.dot(wallVec);
    var segmentT = shadowLengthSq / wallVec.dot(wallVec);
    if (segmentT < 0 || segmentT > 1) {
        return null;
    }
    return tHit;
}
function getBallCollisionTime(ballA, ballB) {
    var pointRelativeStart = ballB.center.sub(ballA.center);
    var pointRelativeVelocity = ballB.velocity.sub(ballA.velocity);
    var combinedRadius = ballA.radius + ballB.radius;
    var a = pointRelativeVelocity.lenSq();
    var b = 2 * pointRelativeStart.dot(pointRelativeVelocity);
    var c = pointRelativeStart.lenSq() - Math.pow(combinedRadius, 2);
    var roots = solveQuadratic(a, b, c);
    if (roots.length > 0) {
        var t = roots[0];
        if (t >= -EPS && t <= 1 + EPS) {
            return t;
        }
    }
    return null;
}
function resolveBallCollision(ballA, ballB) {
    var normal = ballB.center.sub(ballA.center).normalize();
    var relativeVelocity = ballB.velocity.sub(ballA.velocity);
    var velocityAlongNormal = relativeVelocity.dot(normal);
    if (velocityAlongNormal > 0) {
        return;
    }
    var j = -(1 + Math.min(ballA.restitution, ballB.restitution)) * velocityAlongNormal / (ballA.inverseMass + ballB.inverseMass);
    var impulse = normal.mul(j);
    ballA.velocity = ballA.velocity.sub(impulse.mul(ballA.inverseMass));
    ballB.velocity = ballB.velocity.add(impulse.mul(ballB.inverseMass));
}
function resolveCircleLineCollision(ball, wall) {
    var wallVec = wall.pointB.sub(wall.pointA);
    var relativeVelocity = ball.velocity.sub(wall.velocity);
    var wallNormal = wallVec.perp().normalize();
    if (relativeVelocity.dot(wallNormal) > 0) {
        wallNormal = wallNormal.mul(-1);
    }
    var velocityAlongNormal = relativeVelocity.dot(wallNormal);
    var j = -(1 + Math.min(ball.restitution, wall.restitution)) * velocityAlongNormal / (ball.inverseMass + wall.inverseMass);
    var impulse = wallNormal.mul(j);
    ball.velocity = ball.velocity.add(impulse.mul(ball.inverseMass));
    wall.velocity = wall.velocity.sub(impulse.mul(wall.inverseMass));
}
;
var Scene = /** @class */ (function () {
    function Scene() {
        this.elapsedTime = 0;
        this.timeScale = 1.0;
        this.objects = [];
    }
    Scene.prototype.setTimeScale = function (scale) {
        this.timeScale = scale;
    };
    Scene.prototype.addObject = function (obj) {
        this.objects.push(obj);
    };
    Scene.prototype.getObjects = function () {
        return this.objects;
    };
    Scene.prototype.getRawObjects = function () {
        var e_5, _a, e_6, _b;
        var output = [];
        try {
            for (var _c = __values(this.objects), _d = _c.next(); !_d.done; _d = _c.next()) {
                var obj = _d.value;
                try {
                    for (var _e = (e_6 = void 0, __values(obj.iter())), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var subObj = _f.value;
                        output.push(subObj);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return output;
    };
    Scene.prototype.moveSceneObjects = function (deltaTime) {
        var e_7, _a;
        try {
            for (var _b = __values(this.objects), _c = _b.next(); !_c.done; _c = _b.next()) {
                var obj = _c.value;
                obj.moveByDelta(deltaTime);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        this.elapsedTime += (deltaTime / this.timeScale);
    };
    Scene.prototype.getNextCollisionBetweenObjects = function (mainObjects) {
        var e_8, _a, e_9, _b, e_10, _c;
        var earliestCollision = null;
        try {
            for (var mainObjects_1 = __values(mainObjects), mainObjects_1_1 = mainObjects_1.next(); !mainObjects_1_1.done; mainObjects_1_1 = mainObjects_1.next()) {
                var parentA = mainObjects_1_1.value;
                for (var j = 0; j < this.objects.length; j++) {
                    var parentB = this.objects[j];
                    if (parentA === parentB)
                        continue;
                    if (parentA.velocity.sub(parentB.velocity).lenSq() < EPS)
                        continue;
                    try {
                        for (var _d = (e_9 = void 0, __values(parentA.iter())), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var objA = _e.value;
                            try {
                                for (var _f = (e_10 = void 0, __values(parentB.iter())), _g = _f.next(); !_g.done; _g = _f.next()) {
                                    var objB = _g.value;
                                    if (objA === objB)
                                        continue;
                                    var tHit = null;
                                    if (objA instanceof CircleObject && objB instanceof CircleObject) {
                                        tHit = getBallCollisionTime(objA, objB);
                                    }
                                    else if (objA instanceof CircleObject && objB instanceof LineObject) {
                                        tHit = getWallCollisionTime(objA, objB);
                                    }
                                    else if (objA instanceof LineObject && objB instanceof CircleObject) {
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
                            catch (e_10_1) { e_10 = { error: e_10_1 }; }
                            finally {
                                try {
                                    if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                                }
                                finally { if (e_10) throw e_10.error; }
                            }
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (mainObjects_1_1 && !mainObjects_1_1.done && (_a = mainObjects_1.return)) _a.call(mainObjects_1);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return earliestCollision;
    };
    Scene.prototype.fetchParentObject = function (obj) {
        var e_11, _a;
        try {
            for (var _b = __values(this.objects), _c = _b.next(); !_c.done; _c = _b.next()) {
                var sceneObj = _c.value;
                if (sceneObj === obj)
                    continue;
                if (sceneObj.isPartOfObject(obj)) {
                    return this.fetchParentObject(sceneObj) || sceneObj;
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return null;
    };
    Scene.prototype.playSimulation = function (deltaTime, mainObjects) {
        var timeRemaining = deltaTime * this.timeScale;
        var shouldContinue = true;
        var timeout = 1000;
        var _loop_1 = function () {
            var collision = this_1.getNextCollisionBetweenObjects(mainObjects || this_1.objects);
            if (collision === null || collision.time - EPS > timeRemaining) {
                this_1.moveSceneObjects(timeRemaining);
                return "break";
            }
            var earliestHit = collision.time;
            this_1.moveSceneObjects(earliestHit);
            timeRemaining -= earliestHit;
            var parentA = this_1.fetchParentObject(collision.objectA) || collision.objectA;
            var parentB = this_1.fetchParentObject(collision.objectB) || collision.objectB;
            var aTask = parentA.onCollision(parentB, this_1.elapsedTime);
            var bTask = parentB.onCollision(parentA, this_1.elapsedTime);
            var handleMethod = Math.max(aTask, bTask);
            switch (handleMethod) {
                case CollisionResponse.IGNORE:
                    collision.objectA.moveByDelta(FAT_EPS);
                    collision.objectB.moveByDelta(FAT_EPS);
                    break;
                case CollisionResponse.RESET:
                    if (aTask === CollisionResponse.RESET)
                        this_1.objects = this_1.objects.filter(function (obj) { return obj !== parentA; });
                    if (bTask === CollisionResponse.RESET)
                        this_1.objects = this_1.objects.filter(function (obj) { return obj !== parentB; });
                    break;
                case CollisionResponse.BOUNCE:
                    collision.objectA.moveByDelta(FAT_EPS);
                    collision.objectB.moveByDelta(FAT_EPS);
                    if (collision.objectA instanceof CircleObject && collision.objectB instanceof CircleObject) {
                        resolveBallCollision(collision.objectA, collision.objectB);
                    }
                    else if (collision.objectA instanceof CircleObject && collision.objectB instanceof LineObject) {
                        resolveCircleLineCollision(collision.objectA, collision.objectB);
                    }
                    else if (collision.objectA instanceof LineObject && collision.objectB instanceof CircleObject) {
                        resolveCircleLineCollision(collision.objectB, collision.objectA);
                    }
                    else {
                        console.warn("Collision resolution not implemented for ".concat(collision.objectA.constructor.name, " and ").concat(collision.objectB.constructor.name));
                    }
                    break;
            }
        };
        var this_1 = this;
        while (timeRemaining > EPS && shouldContinue && timeout-- > 0) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
    };
    Scene.prototype.getElapsedTime = function () {
        return this.elapsedTime;
    };
    return Scene;
}());
var PowerupType;
(function (PowerupType) {
    PowerupType[PowerupType["ADD_BALL"] = 0] = "ADD_BALL";
    PowerupType[PowerupType["INCREASE_PADDLE_SPEED"] = 1] = "INCREASE_PADDLE_SPEED";
    PowerupType[PowerupType["DECREASE_PADDLE_SPEED"] = 2] = "DECREASE_PADDLE_SPEED";
    PowerupType[PowerupType["SLOW_MOTION"] = 3] = "SLOW_MOTION";
    PowerupType[PowerupType["REVERSE_CONTROLS"] = 4] = "REVERSE_CONTROLS";
})(PowerupType || (PowerupType = {}));
var powerupData = [
    { type: PowerupType.ADD_BALL, chance: 30, duration: null },
    { type: PowerupType.INCREASE_PADDLE_SPEED, chance: 20, duration: 10 },
    { type: PowerupType.DECREASE_PADDLE_SPEED, chance: 20, duration: 10 },
    { type: PowerupType.SLOW_MOTION, chance: 20, duration: 10 },
    { type: PowerupType.REVERSE_CONTROLS, chance: 10, duration: 10 },
];
var totalPowerupChance = powerupData.reduce(function (sum, p) { return sum + p.chance; }, 0);
var PongPaddle = /** @class */ (function (_super) {
    __extends(PongPaddle, _super);
    function PongPaddle(center, width, height, paddleDirection, protectedWallWidth, paddleSpeedFactor, walls, playerId) {
        if (walls === void 0) { walls = []; }
        var _this = this;
        var halfWidth = width / 2;
        var halfHeight = height / 2;
        var topLine = new LineObject(center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)), center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(halfHeight)), new Vec2(0, 0), 0, 1.0);
        var bottomLine = new LineObject(center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)), center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(halfHeight)), new Vec2(0, 0), 0, 1.0);
        var leftLine = new LineObject(center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)), center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)), new Vec2(0, 0), 0, 1.0);
        var rightLine = new LineObject(center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(halfHeight)), center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(halfHeight)), new Vec2(0, 0), 0, 1.0);
        var topLeftCorner = new CircleObject(center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)), 0, new Vec2(0, 0), 0, 1.0);
        var topRightCorner = new CircleObject(center.add(paddleDirection.normalize().perp().mul(-halfWidth)).add(paddleDirection.normalize().mul(halfHeight)), 0, new Vec2(0, 0), 0, 1.0);
        var bottomLeftCorner = new CircleObject(center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(-halfHeight)), 0, new Vec2(0, 0), 0, 1.0);
        var bottomRightCorner = new CircleObject(center.add(paddleDirection.normalize().perp().mul(halfWidth)).add(paddleDirection.normalize().mul(halfHeight)), 0, new Vec2(0, 0), 0, 1.0);
        _this = _super.call(this, [topLine, bottomLine, leftLine, rightLine, topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner], new Vec2(0, 0), 0, 1.0) || this;
        _this.reverseControls = false;
        _this.clockwiseBaseVelocity = paddleDirection.clone().perp().normalize();
        _this.keyData = [];
        _this.playerId = -1;
        var maxTravelDistance = Math.min(getWallCollisionTime(new CircleObject(center.sub(paddleDirection.normalize().mul(halfHeight)), 10, paddleDirection.perp().normalize().mul(-1)), walls[0]) || Infinity, getWallCollisionTime(new CircleObject(center.sub(paddleDirection.normalize().mul(halfHeight)), 10, paddleDirection.perp().normalize().mul(1)), walls[1]) || Infinity, getWallCollisionTime(new CircleObject(center.add(paddleDirection.normalize().mul(halfHeight)), 10, paddleDirection.perp().normalize().mul(-1)), walls[0]) || Infinity, getWallCollisionTime(new CircleObject(center.add(paddleDirection.normalize().mul(halfHeight)), 10, paddleDirection.perp().normalize().mul(1)), walls[1]) || Infinity, protectedWallWidth / 2) - halfWidth - 1;
        _this.bounds = {
            min: center.sub(paddleDirection.normalize().perp().mul(maxTravelDistance)),
            max: center.add(paddleDirection.normalize().perp().mul(maxTravelDistance)),
        };
        var isTopHalf = (new Vec2(0, -1).dot(paddleDirection) > 0);
        _this.keyData = [
            { key: "ArrowLeft", isPressed: false, isClockwise: !isTopHalf },
            { key: "ArrowRight", isPressed: false, isClockwise: isTopHalf },
        ];
        _this.boardPaddleSpeed = protectedWallWidth * paddleSpeedFactor;
        _this.paddleHeight = height;
        _this.paddleWidth = width;
        _this.paddleAngle = paddleDirection.angle();
        _this.playerId = playerId;
        return _this;
    }
    PongPaddle.prototype.getCenter = function () {
        var e_12, _a;
        var sum = new Vec2(0, 0);
        var count = 0;
        try {
            for (var _b = __values(this.objects), _c = _b.next(); !_c.done; _c = _b.next()) {
                var obj = _c.value;
                if (obj instanceof LineObject) {
                    sum = sum.add(obj.pointA).add(obj.pointB);
                    count += 2;
                }
                else if (obj instanceof CircleObject) {
                    sum = sum.add(obj.center);
                    count += 1;
                }
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_12) throw e_12.error; }
        }
        return sum.div(count);
    };
    PongPaddle.prototype.setReverseControls = function (reverse) {
        this.reverseControls = reverse;
    };
    /// Update the paddle velocity based on the current key states and the given paddle speed. Return the amount of time this move will maximally take before hitting the bounds.
    PongPaddle.prototype.updatePaddleVelocity = function () {
        var e_13, _a;
        var moveDirection = 0;
        try {
            for (var _b = __values(this.keyData), _c = _b.next(); !_c.done; _c = _b.next()) {
                var keyData = _c.value;
                if (keyData.isPressed) {
                    moveDirection += (keyData.isClockwise !== this.reverseControls) ? 1 : -1;
                }
            }
        }
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_13) throw e_13.error; }
        }
        if (moveDirection === 0) {
            this.velocity = new Vec2(0, 0);
            return Infinity;
        }
        var desiredVelocity = this.clockwiseBaseVelocity.normalize().mul(moveDirection * this.boardPaddleSpeed);
        var maxTravelDistance = moveDirection > 0 ? this.bounds.max.sub(this.getCenter()).len() : this.getCenter().sub(this.bounds.min).len();
        if (maxTravelDistance < 1) {
            this.velocity = new Vec2(0, 0);
            return Infinity;
        }
        var maxTravelTime = maxTravelDistance / desiredVelocity.len();
        this.velocity = desiredVelocity;
        return maxTravelTime;
    };
    PongPaddle.prototype.getSpeed = function () {
        return this.boardPaddleSpeed;
    };
    PongPaddle.prototype.setSpeed = function (newSpeed) {
        this.boardPaddleSpeed = newSpeed;
    };
    PongPaddle.prototype.toJSON = function () {
        var center = this.getCenter();
        var velocity = this.velocity;
        return [
            center.x,
            center.y,
            this.paddleAngle,
            this.paddleWidth,
            this.paddleHeight,
            velocity.x,
            velocity.y,
            this.playerId,
        ];
    };
    return PongPaddle;
}(MultiObject));
var PongBall = /** @class */ (function (_super) {
    __extends(PongBall, _super);
    function PongBall(center, radius, velocity) {
        var _this = _super.call(this, center, radius, velocity, 1.0, 1.0) || this;
        _this.id = PongBall.idCounter++;
        _this.setCollisionHandler(function (other) {
            return CollisionResponse.BOUNCE;
        });
        return _this;
    }
    PongBall.prototype.toJSON = function () {
        return [
            this.center.x,
            this.center.y,
            this.velocity.x,
            this.velocity.y,
            this.radius,
            this.inverseMass,
        ];
    };
    PongBall.idCounter = 0;
    return PongBall;
}(CircleObject));
var Powerup = /** @class */ (function (_super) {
    __extends(Powerup, _super);
    function Powerup(center, radius, velocity, powerup, game) {
        var _this = _super.call(this, center, radius, velocity, 0.5, 1.0) || this;
        _this.activationStartTime = null;
        _this.metadata = powerup;
        _this.game = game;
        _this.spawnTime = game.getScene().getElapsedTime();
        _this.setCollisionHandler(function (other) {
            if (other instanceof PongBall) {
                console.log("Powerup of type ".concat(PowerupType[_this.metadata.type], " collected by ball ID ").concat(other.id, "."));
                _this.game.applyPowerupEffect(_this, other);
            }
            return CollisionResponse.RESET;
        });
        return _this;
    }
    Powerup.generateRandomPowerup = function (center, velocity, game) {
        var e_14, _a;
        var randomPowerupIndex = Math.random() * totalPowerupChance;
        var newPowerup = undefined;
        try {
            for (var powerupData_1 = __values(powerupData), powerupData_1_1 = powerupData_1.next(); !powerupData_1_1.done; powerupData_1_1 = powerupData_1.next()) {
                var powerup = powerupData_1_1.value;
                if (randomPowerupIndex < powerup.chance) {
                    newPowerup = powerup;
                    break;
                }
                randomPowerupIndex -= powerup.chance;
            }
        }
        catch (e_14_1) { e_14 = { error: e_14_1 }; }
        finally {
            try {
                if (powerupData_1_1 && !powerupData_1_1.done && (_a = powerupData_1.return)) _a.call(powerupData_1);
            }
            finally { if (e_14) throw e_14.error; }
        }
        if (newPowerup === undefined) {
            newPowerup = powerupData[0];
        }
        return new Powerup(center, 10, velocity, newPowerup, game);
    };
    Powerup.prototype.getPowerupType = function () {
        return this.metadata.type;
    };
    Powerup.prototype.activate = function (currentTime) {
        this.activationStartTime = currentTime;
    };
    Powerup.prototype.isPowerupActive = function (currentTime) {
        if (this.activationStartTime === null || this.metadata.duration === null)
            return false;
        return (currentTime - this.activationStartTime + EPS) < this.metadata.duration;
    };
    Powerup.prototype.isPowerupTaken = function () {
        return this.activationStartTime !== null;
    };
    Powerup.prototype.isTimeBased = function () {
        return this.metadata.duration !== null;
    };
    Powerup.prototype.getRemainingPowerupTime = function (currentTime) {
        if (this.activationStartTime === null)
            return 0;
        if (this.metadata.duration === null)
            return Infinity;
        var elapsed = currentTime - this.activationStartTime;
        return Math.max(0, this.metadata.duration - elapsed);
    };
    Powerup.prototype.toJSON = function () {
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
        ];
    };
    return Powerup;
}(CircleObject));
var Wall = /** @class */ (function (_super) {
    __extends(Wall, _super);
    function Wall(pointA, pointB, playerId) {
        var _this = _super.call(this, pointA, pointB, new Vec2(0, 0), 0, 1.0) || this;
        _this.playerId = playerId;
        return _this;
    }
    Wall.prototype.toJSON = function () {
        return [
            this.pointA.x,
            this.pointA.y,
            this.pointB.x,
            this.pointB.y,
            this.velocity.x,
            this.velocity.y,
            this.playerId,
        ];
    };
    return Wall;
}(LineObject));
var PongGame = /** @class */ (function () {
    function PongGame(players, gameOptions) {
        this.walls = [];
        this.balls = [];
        this.powerups = [];
        this.paddles = [];
        this.scene = new Scene();
        this.score = new Map();
        this.nextPowerupSpawnTime = 0;
        this.walls = [];
        this.balls = [];
        this.paddles = [];
        this.powerups = [];
        this.constructPlayingField(players, gameOptions);
        this.gameOptions = gameOptions;
        for (var i = 0; i < (gameOptions.amountOfBalls || 1); i++) {
            var ballDirection = new Vec2(0, -1).rotate(i * (2 * Math.PI) / (gameOptions.amountOfBalls || 1));
            this.spawnNewBall(new Vec2(gameOptions.canvasWidth / 2, gameOptions.canvasHeight / 2), ballDirection.mul(gameOptions.ballSpeed), 10, 1.0, gameOptions);
        }
        for (var i = 0; i < players.length; i++) {
            this.score.set(players[i], 0);
            this.spawnNewPowerup();
        }
    }
    PongGame.prototype.constructPlayingField = function (players, gameOptions) {
        var _this = this;
        var size = Math.min(gameOptions.canvasWidth, gameOptions.canvasHeight);
        var halfSize = size / 2;
        var center = new Vec2(Math.floor(gameOptions.canvasWidth / 2), Math.floor(gameOptions.canvasHeight / 2));
        var amountOfWalls = Math.max(3, players.length);
        var halfAngleStep = Math.PI / amountOfWalls;
        var angleStep = (2 * Math.PI) / amountOfWalls;
        var _loop_2 = function (i) {
            var wallStart = center.add(new Vec2(0, -1).rotate(i * angleStep - halfAngleStep).mul(halfSize));
            var wallEnd = center.add(new Vec2(0, -1).rotate(i * angleStep + halfAngleStep).mul(halfSize));
            var wall = new Wall(wallStart, wallEnd, players[i]);
            wall.setCollisionHandler(function (other) {
                console.log("Ball collided with player ".concat(players[i], "'s wall."));
                if (other instanceof PongBall) {
                    _this.score.set(players[i], (_this.score.get(players[i]) || 0) - 1);
                    console.log("Player ".concat(players[i], " conceded a point! Current score: ").concat(_this.score.get(players[i]), "."));
                }
                return CollisionResponse.BOUNCE;
            });
            this_2.walls.push(wall);
            this_2.scene.addObject(wall);
        };
        var this_2 = this;
        for (var i = 0; i < players.length; i++) {
            _loop_2(i);
        }
        for (var i = 0; i < players.length; i++) {
            var wallStart = center.add(new Vec2(0, -1).rotate(i * angleStep - halfAngleStep).mul(halfSize));
            var wallEnd = center.add(new Vec2(0, -1).rotate(i * angleStep + halfAngleStep).mul(halfSize));
            var cSq = wallStart.sub(center).lenSq();
            var bSq = Math.pow((wallEnd.sub(wallStart).len() / 2), 2);
            var aSq = cSq - bSq;
            var closestDistanceWallToCenter = Math.sqrt(aSq);
            var playerPaddleSize = (gameOptions.paddleSize || 0.3) * (wallEnd.sub(wallStart).len());
            var playerPaddleOffset = gameOptions.paddleWallOffset || 50;
            var paddleCenter = center.add(new Vec2(0, -1).rotate(i * angleStep).mul(closestDistanceWallToCenter - playerPaddleOffset));
            var paddle = new PongPaddle(paddleCenter, playerPaddleSize, 20, new Vec2(0, -1).rotate(i * angleStep).normalize(), wallEnd.sub(wallStart).len(), gameOptions.paddleSpeedFactor, [this.walls[(i - 1 + this.walls.length) % this.walls.length], this.walls[(i + 1) % this.walls.length]], players[i]);
            this.paddles.push(paddle);
            this.scene.addObject(paddle);
        }
    };
    PongGame.prototype.spawnNewBall = function (position, velocity, radius, inverseMass, gameOptions) {
        var _this = this;
        var ball = new PongBall(position, radius, velocity);
        ball.setCollisionHandler(function (other, elapsedTime) {
            if (other instanceof LineObject) {
                var wall = _this.walls.find(function (w) { return w === other; });
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
    };
    PongGame.prototype.spawnNewPowerup = function () {
        var gameOptions = this.gameOptions;
        var position = new Vec2(Math.random() * gameOptions.canvasWidth * 0.8 + gameOptions.canvasWidth * 0.1, Math.random() * gameOptions.canvasHeight * 0.8 + gameOptions.canvasHeight * 0.1);
        var velocity = new Vec2(0, 0);
        var powerup = Powerup.generateRandomPowerup(position, velocity, this);
        this.powerups.push(powerup);
        this.scene.addObject(powerup);
        console.log("Spawned new powerup of type ".concat(PowerupType[powerup.getPowerupType()], " at position (").concat(position.x.toFixed(2), ", ").concat(position.y.toFixed(2), ")."));
    };
    PongGame.prototype.getScene = function () {
        return this.scene;
    };
    PongGame.prototype.playSimulation = function (deltaTime) {
        var e_15, _a;
        var timeRemaining = deltaTime;
        this.cleanUpExpiredPowerups();
        if (this.scene.getElapsedTime() >= this.nextPowerupSpawnTime) {
            this.spawnNewPowerup();
            this.nextPowerupSpawnTime += this.gameOptions.powerupFrequency * (0.8 + Math.random() * 0.4);
        }
        while (timeRemaining > EPS) {
            var minPaddleTime = Infinity;
            try {
                for (var _b = (e_15 = void 0, __values(this.paddles)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var paddle = _c.value;
                    var paddleTime = paddle.updatePaddleVelocity();
                    if (paddleTime < minPaddleTime) {
                        minPaddleTime = paddleTime;
                    }
                }
            }
            catch (e_15_1) { e_15 = { error: e_15_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_15) throw e_15.error; }
            }
            var stepTime = Math.min(timeRemaining, minPaddleTime);
            this.scene.playSimulation(stepTime, this.balls);
            timeRemaining -= stepTime;
        }
    };
    PongGame.prototype.applyPowerupEffect = function (powerup, ball) {
        switch (powerup.getPowerupType()) {
            case PowerupType.ADD_BALL:
                this.spawnNewBall(ball.center.clone(), ball.velocity.clone().rotate(Math.random() * Math.PI / 4 - Math.PI / 8), ball.radius, 1.0, this.gameOptions);
                break;
            case PowerupType.INCREASE_PADDLE_SPEED:
                this.paddles.forEach(function (paddle) { return paddle.setSpeed(paddle.getSpeed() * 2); });
                break;
            case PowerupType.DECREASE_PADDLE_SPEED:
                this.paddles.forEach(function (paddle) { return paddle.setSpeed(paddle.getSpeed() * 0.5); });
                break;
            case PowerupType.SLOW_MOTION:
                this.scene.setTimeScale(0.5);
                break;
            case PowerupType.REVERSE_CONTROLS:
                this.paddles.forEach(function (paddle) { return paddle.setReverseControls(true); });
                break;
        }
        powerup.activate(this.scene.getElapsedTime());
    };
    PongGame.prototype.removePowerupEffects = function (powerup) {
        switch (powerup.getPowerupType()) {
            case PowerupType.INCREASE_PADDLE_SPEED:
                this.paddles.forEach(function (paddle) { return paddle.setSpeed(paddle.getSpeed() / 2); });
                break;
            case PowerupType.DECREASE_PADDLE_SPEED:
                this.paddles.forEach(function (paddle) { return paddle.setSpeed(paddle.getSpeed() * 2); });
                break;
            case PowerupType.SLOW_MOTION:
                this.scene.setTimeScale(1.0);
                break;
            case PowerupType.REVERSE_CONTROLS:
                this.paddles.forEach(function (paddle) { return paddle.setReverseControls(false); });
                break;
            default:
                if (powerup.isTimeBased()) {
                    console.warn("Powerup of type ".concat(PowerupType[powerup.getPowerupType()], " has no removal effect defined."));
                }
                break;
        }
    };
    PongGame.prototype.cleanUpExpiredPowerups = function () {
        var _this = this;
        var currentTime = this.scene.getElapsedTime();
        this.powerups = this.powerups.filter(function (powerup) {
            var couldBeRemoved = !(powerup.isPowerupActive(currentTime) || !powerup.isPowerupTaken());
            if (couldBeRemoved) {
                console.log("Removing expired powerup of type ".concat(PowerupType[powerup.getPowerupType()], "."));
                _this.scene.getObjects().splice(_this.scene.getObjects().indexOf(powerup), 1);
                _this.removePowerupEffects(powerup);
            }
            return !couldBeRemoved;
        });
    };
    PongGame.prototype.handleKeyPress = function (key, isPressed) {
        var e_16, _a, e_17, _b;
        try {
            for (var _c = __values(this.paddles), _d = _c.next(); !_d.done; _d = _c.next()) {
                var paddle = _d.value;
                try {
                    for (var _e = (e_17 = void 0, __values(paddle.keyData)), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var keyData = _f.value;
                        if (keyData.key !== key)
                            continue;
                        keyData.isPressed = isPressed;
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
            }
        }
        catch (e_16_1) { e_16 = { error: e_16_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_16) throw e_16.error; }
        }
    };
    PongGame.prototype.fetchPlayerScoreMap = function () {
        var e_18, _a, e_19, _b, e_20, _c;
        var allPlayers = new Set();
        try {
            for (var _d = __values(this.paddles), _e = _d.next(); !_e.done; _e = _d.next()) {
                var paddle = _e.value;
                allPlayers.add(paddle.playerId);
            }
        }
        catch (e_18_1) { e_18 = { error: e_18_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_18) throw e_18.error; }
        }
        var scoreMap = new Map();
        try {
            for (var allPlayers_1 = __values(allPlayers), allPlayers_1_1 = allPlayers_1.next(); !allPlayers_1_1.done; allPlayers_1_1 = allPlayers_1.next()) {
                var basePlayerId = allPlayers_1_1.value;
                var playerNegativeScore = this.score.get(basePlayerId) || 0;
                if (playerNegativeScore >= 0)
                    continue;
                try {
                    for (var allPlayers_2 = (e_20 = void 0, __values(allPlayers)), allPlayers_2_1 = allPlayers_2.next(); !allPlayers_2_1.done; allPlayers_2_1 = allPlayers_2.next()) {
                        var playerId = allPlayers_2_1.value;
                        if (playerId === basePlayerId)
                            continue;
                        scoreMap.set(playerId, (scoreMap.get(playerId) || 0) + Math.abs(playerNegativeScore));
                    }
                }
                catch (e_20_1) { e_20 = { error: e_20_1 }; }
                finally {
                    try {
                        if (allPlayers_2_1 && !allPlayers_2_1.done && (_c = allPlayers_2.return)) _c.call(allPlayers_2);
                    }
                    finally { if (e_20) throw e_20.error; }
                }
            }
        }
        catch (e_19_1) { e_19 = { error: e_19_1 }; }
        finally {
            try {
                if (allPlayers_1_1 && !allPlayers_1_1.done && (_b = allPlayers_1.return)) _b.call(allPlayers_1);
            }
            finally { if (e_19) throw e_19.error; }
        }
        return scoreMap;
    };
    PongGame.prototype.fetchBoardJSON = function () {
        return {
            metadata: {
                gameOptions: this.gameOptions,
                elapsedTime: this.scene.getElapsedTime(),
                players: this.paddles.map(function (paddle) { return paddle.playerId; }),
            },
            walls: this.walls.map(function (wall) { return wall.toJSON(); }),
            balls: this.balls.map(function (ball) { return ball.toJSON(); }),
            paddles: this.paddles.map(function (paddle) { return paddle.toJSON(); }),
            powerups: this.powerups.map(function (powerup) { return powerup.toJSON(); }),
            score: Object.fromEntries(this.fetchPlayerScoreMap()),
        };
    };
    return PongGame;
}());
