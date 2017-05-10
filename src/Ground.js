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
            emissive: colors.floor.emissive,
            side: THREE.DoubleSide,
        });

        this.ground = new THREE.Mesh(solidGroundGeo, floorMat);
        this.ground.receiveShadow = true;
    }

    update(game) {
        const factor = game.status === 'paused' ? 0.01 : (game.speed * 20);
        this.texture.offset.y += factor;
    }

    getGround() {
        return this.ground;
    }
}