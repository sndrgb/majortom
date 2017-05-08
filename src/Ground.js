const CANNON = require('cannon');
const THREE = require('three');

import colors from './colors';
import globals from './globals';

const image = require('./assets/ground.png');

export default class Ground {
    constructor(s, d) {
        const solidGroundGeo = new THREE.PlaneGeometry(s, s, d, d);
        solidGroundGeo.rotateX(-Math.PI / 2);

        this.texture = new THREE.TextureLoader().load(image);
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
        const textureSize = globals.step;
        this.texture.repeat.set(textureSize, textureSize);

        const floorMat = new THREE.MeshLambertMaterial({
            map: this.texture,
            // wireframe: true,
            emissive: colors.floor.emissive,
            side: THREE.DoubleSide,
        });

        this.ground = new THREE.Mesh(solidGroundGeo, floorMat);
        this.ground.castShadow = true;
        this.ground.receiveShadow = true;
    }

    update(game) {
        this.texture.offset.y += (game.speed * 20);
    }

    getGround() {
        return this.ground;
    }
}