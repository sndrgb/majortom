const THREE = require('three');
const _ = require('lodash');

import globals from './globals';

export default class Sphere {
    constructor(frustum, game, index) {
        this.obj = new THREE.Object3D();

        this.minVelocity = 2;
        this.maxVelocity = 4;

        const geometry = new THREE.SphereGeometry(20, 20, 20);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.obj.add(this.mesh);

        const positions = [-1,0,1,2,3];
        const x = (positions[index] * globals.step) - (globals.step / 2);
        const vec = new THREE.Vector3(x, 80, 0);
        this.mesh.position.set(x, 80, -1000);
        this.translate = _.random(-10, 15);

        this.velocity = _.random(this.minVelocity, this.maxVelocity);
        this.previous = false;
    }

    getSphere() {
        return this.obj;
    }

    update(frustum, game) {
        const timer = Date.now() * 0.001;

        if (this.mesh) {
            this.mesh.position.y = (Math.sin(timer) * this.translate) + 40;
            this.mesh.position.z += this.velocity;

            const next = frustum.intersectsObject(this.mesh);

            if (next === false && this.previous === true) {
                this.velocity = _.random(2000 * game.speed, 4000 * game.speed);
                console.log(`new velocity: ${this.velocity}`);
                this.mesh.position.z = - 900;
            }

            if (next !== this.previous) {
                this.previous = next;
            }
        }
    }
}
