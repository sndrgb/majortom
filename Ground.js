const CANNON = require('cannon');
const THREE = require('three');

import colors from './colors';

export default class Ground {
    constructor() {
        const solidGroundGeo = new THREE.PlaneGeometry(10000, 10000, 1, 1);
        solidGroundGeo.rotateX(-Math.PI / 2);

        this.texture = new THREE.TextureLoader().load('/assets/ground.png');
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
        const textureSize = 85;
        this.texture.repeat.set(textureSize, textureSize);

        const floorMat = new THREE.MeshLambertMaterial({
            map: this.texture,
            emissive: colors.floor.emissive,
            side: THREE.DoubleSide,
        });

        this.ground = new THREE.Mesh(solidGroundGeo, floorMat);
        this.ground.castShadow = true;
        this.ground.receiveShadow = true;
    }

    update() {
        this.texture.offset.y += 0.02;
    }

    getGround() {
        return this.ground;
    }
}