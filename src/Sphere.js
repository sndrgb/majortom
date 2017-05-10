const THREE = require('three');
const _ = require('lodash');

import globals from './globals';

export default class Sphere {
    constructor(frustum, game, index) {
        this.obj = new THREE.Object3D();

        this.minVelocity = 2;
        this.maxVelocity = 4;

        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x270000,
            shading: THREE.FlatShading
        });
        
        this.mesh = new Particle(material);
        this.obj.add(this.mesh);

        this.mesh.rotation.x += Math.random() * 0.5;
        this.mesh.rotation.y += Math.random() * 0.5;
        this.mesh.rotation.z += Math.random() * 0.5;

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
                this.mesh.position.z = - 900;
            }

            if (next !== this.previous) {
                this.previous = next;
            }
        }
    }

    implode() {
        let success;
        const promise = new Promise((resolve) => {
            success = resolve;
        });

        TweenMax.to(this.mesh.scale, 0.3, { 
            x: 0.01, 
            y: 0.01, 
            z: 0.01,
            onComplete: success,
        });

        return promise;
    }
}

const Particle = (material) => {
    // Size of the particle, make it random
    const s = 22;

    // geometry of the particle, choose between different shapes
    let geom;
    const random = Math.random();

    if (random<.25){
        // Cube
        geom = new THREE.BoxGeometry(s, s, s);

    } else if (random < .5){
        // Pyramid
        geom = new THREE.CylinderGeometry(0, s, s * 2, 4, 1);
    } else if (random < .75){
        // potato shape
        geom = new THREE.TetrahedronGeometry(s, 2);
    } else {
        // thick plane
        geom = new THREE.BoxGeometry((s * 1.2) / 4, s * 1.2, s * 1.2); // thick plane
    }
    // color of the particle, make it random and get a material
    //const color = getRandomColor();
    //const mat = getMat(color);
    const mat = material;

    // create the mesh of the particle
    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.userData.po = this;

    return mesh;
}

