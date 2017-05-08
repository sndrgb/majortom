const CANNON = require('cannon');

export default class World {
    constructor() {
        this.timeStep = 1 / 60;
        this.body = null;

        this.world = new CANNON.World();
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.gravity.set(0, -1000, 0);
        this.world.solver.tolerance = 0.001;
        this.world.allowSleep = true;

        // Ground plane
        var plane = new CANNON.Plane();
        var groundBody = new CANNON.Body({
            mass: 0
        });

        groundBody.addShape(plane);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.add(groundBody);
    }

    add(obj) {
        this.world.add(obj);
    }
}