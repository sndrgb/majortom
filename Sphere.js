const THREE = require('three');
const _ = require('lodash');

export default class Sphere {
    constructor(frustum) {
        const geometry = new THREE.SphereGeometry(20, 6, 6);
        const material = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });
        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.castShadow = true;

        const x = _.random(-500, 500);
        const vec = new THREE.Vector3(x, 80, 0);
        this.sphere.position.set(x, 80, 0);

        const contain = frustum.containsPoint(vec);

        this.translate = _.random(-10, 25);
        this.velocity = _.random(0.2, 3);
        this.previous = false;
    }

    getSphere() {
        return this.sphere;
    }

    update(frustum) {
        const timer = Date.now() * 0.001;

        if (this.sphere) {
            this.sphere.position.y = (Math.sin(timer) * this.translate) + 35;
            this.sphere.position.z += this.velocity;

            const next = frustum.intersectsObject(this.sphere);

            if (next === false && this.previous === true) {
                this.sphere.position.z = -1500;
            }

            if (next !== this.previous) {
                this.previous = next;
            }
        }
    }
}
