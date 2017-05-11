const THREE = require('three');
const loop = require('raf-loop');
const gsap = require('gsap');
const OrbitControls = require('three-orbitcontrols');

import round from 'lodash/round';
import delay from 'lodash/delay';
import { deg2rad } from './utils';
import colors from './colors';
import globals from './globals';
import Computer from './Computer';
import Ground from './Ground';
import Player from './Player';
import Sphere from './Sphere';

class Game {
    constructor() {
        this.firstStart = true;
        this.instances = [];
        this.collidableMeshes = [];
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0xdddddd, 100,950);

        window.scene = this.scene;
        window.THREE = THREE;

        this.newTime = new Date().getTime();
        this.oldTime = new Date().getTime();

        this.render = this.render.bind(this);

        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;
        window.ASPECT_RATIO = aspect;

        // http://stackoverflow.com/questions/31978368/three-js-fit-orthographic-camera-to-scene
        // http://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object
        // var maxDim = Math.max(width, height);
        // var distance = maxDim/ 2 /  ratio / Math.tan(Math.PI * fov / 360);

        this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, -1000, 5000);
        this.camera.position.x = 200;
        this.camera.position.y = 200;
        this.camera.position.z = 200;
        this.camera.zoom = 1.8;

        this.camera.updateProjectionMatrix();
        this.camera.lookAt(this.scene.position);

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.renderReverseSided = false;

        document.body.appendChild(this.renderer.domElement);

        this.init();
    }

    init() {
        this.calculateFrustum();

        this.ground = new Ground(globals.size, globals.divisions);
        this.scene.add(this.ground.getGround());

        this.addLights();
        //this.addHelpers();

        this.player = new Player();
        this.scene.add(this.player.spaceship);
    }

    calculateFrustum() {
        this.frustum = new THREE.Frustum();
        const cameraViewProjectionMatrix = new THREE.Matrix4();

        // every time the camera or objects change position (or every frame)
        this.camera.updateMatrixWorld(); // make sure the camera matrix is updated
        this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
        cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);

        this.frustum.setFromMatrix(cameraViewProjectionMatrix);
    }

    reset(status = 'playing') {
        this.ambient.intensity = 1;

        if (this.firstStart) {
            this.resetProps('playing');
            this.player.restart();
            this.firstStart = false;
        } else {
            this.instances.forEach((el) => {
                el.implode().then(() => {
                    this.scene.remove(el.getSphere());
                    this.resetProps(status);
                    this.player.restart();
                });
            });
        }

        delay(() => {
            this.addSpheres(this.game.enemyValue);
        }, 2000);
    }

    destroy() {
        this.ambient.intensity = 1;
        this.firstStart = true;

        this.instances.forEach((el) => {
            el.implode().then(() => {
                this.scene.remove(el.getSphere());
                this.resetProps('paused');
            });
        });
    }

    addSpheres(n) {
        for (let i = 0; i <= n; i++) {
            const sphere = new Sphere(this.frustum, this.game, i);
            this.instances.push(sphere);
            this.collidableMeshes.push(sphere.mesh);
            this.scene.add(sphere.getSphere());
        }
    }

    addHelpers() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

        var helper = new THREE.CameraHelper( this.camera );
        this.scene.add( helper );

        const axisHelper = new THREE.AxisHelper(5);
        this.scene.add(axisHelper);
    }

    addLights() {
        this.ambient = new THREE.AmbientLight(colors.ambient);
        this.scene.add(this.ambient);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
        hemiLight.color.setHex(0xffffff);
        hemiLight.groundColor.setHSL(0, 0, 0);
        hemiLight.position.set(0, 500, 0);
        this.scene.add(hemiLight);

        const dirLight = this.point = new THREE.DirectionalLight(0xffffff, 1, 100);
        dirLight.color.setHex(0xffffff);
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 500 );
        dirLight.castShadow = true;

        this.scene.add( dirLight );

        dirLight.shadow.mapSize.width = 4096;
        dirLight.shadow.mapSize.height = 4096;

        const d = 1000;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.camera.far = 2000;
        dirLight.shadow.bias = -0.0015;
    }

    render() {
        this.newTime = new Date().getTime();
        this.game.deltaTime = this.newTime - this.oldTime;
        this.oldTime = this.newTime;

        this.instances.forEach(el => el.update(this.frustum, this.game));
        this.updateCollisions();

        const floorDistance = Math.floor(this.game.distance);
        this.ground.update(this.game);

        if (this.game.status === 'playing') {
            // update speed
            if (
                floorDistance % this.game.distanceForSpeedUpdate == 0 &&
                floorDistance > this.game.speedLastUpdate
            ) {
                this.game.speedLastUpdate = floorDistance;
                this.game.targetBaseSpeed += this.game.incrementSpeedByTime * this.game.deltaTime;
            }

            // update level
            if (
                floorDistance % this.game.distanceForLevelUpdate == 0 && 
                floorDistance > this.game.levelLastUpdate
            ) {
                this.game.levelLastUpdate = floorDistance;
                this.game.level++;
                this.game.targetBaseSpeed += (this.game.incrementSpeedByLevel * this.game.level * this.game.deltaTime);
            }

            this.game.distance += this.game.speed * this.game.deltaTime * this.game.ratioSpeedDistance;
            this.game.baseSpeed += (this.game.targetBaseSpeed - this.game.baseSpeed) * this.game.deltaTime * 0.02;
            this.game.speed = this.game.baseSpeed;

        } else if(this.game.status === 'gameover') {

            this.player.dead();
            this.game.speed *= .99;
            this.ambient.intensity *= 1.01;

            if (this.ambient.intensity >= 3) {
                this.game.status = 'paused';
                this.game.stop = true;
            };
        }

        this.renderer.render(this.scene, this.camera);
    }

    resetProps(status = 'paused') {
        this.collidableMeshes = [];
        this.instances = [];

        this.game = {
          status,
          speed: 0,
          
          initSpeed: 0.008,
          baseSpeed: 0.008,
          targetBaseSpeed: 0.002,
          
          incrementSpeedByTime: 0.000005,
          incrementSpeedByLevel: 0.00001,

          distanceForLevelUpdate: 500,
          distanceForSpeedUpdate: 100,
          distance: 0,
          speedLastUpdate: 0,
          ratioSpeedDistance: 20,

          deltaTime: 0,
          level: 1,
          levelLastUpdate: 0,

          enemyValue: 4,
          enemyDistanceTolerance: 60,
          enemyLastSpawn: 0,
          stop: false,
         };
    }

    updateCollisions() {
        this.collidableMeshes.forEach((enemy) => {
            const diffPos = this.player.spaceship.position.clone().sub(enemy.position.clone());
            const d = diffPos.length();

            if (d < this.game.enemyDistanceTolerance) {
                this.game.status = 'gameover';
            }
        });
    }
}

export default Game;

/*
this.computer = new Computer();
this.computer.loadJson().then(() => {
    const computer = this.computer.obj;
    this.collidableMeshes.push(this.computer.mesh);
    this.objects.add(computer);
});
this.instances.push(this.computer);
*/