const THREE = require('three');
const loop = require('raf-loop');
const gsap = require('gsap');
const CANNON = require('cannon');
const OrbitControls = require('three-orbitcontrols');

import { deg2rad } from './utils';
import colors from './colors';
import globals from './globals';
import Computer from './Computer';
import Card from './Card';
import World from './World';
import Ground from './Ground';
import Player from './Player';
import Sphere from './Sphere';


class Scene {
    constructor() {
        this.instances = [];
        this.collidableMeshes = [];
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0xdddddd, 100,950);

        window.scene = this.scene;
        window.THREE = THREE;

        this.render = this.render.bind(this);
        this.loop = loop(this.render);

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
        this.objects = new THREE.Object3D();
        this.calculateFrustum();

        setTimeout(() => {
            this.computer = new Computer();
            this.computer.loadJson().then(() => {
                const computer = this.computer.obj;
                this.collidableMeshes.push(this.computer.mesh);
                this.objects.add(computer);
            });

            this.instances.push(this.computer);

            for (let i = 0; i <= 10; i++) {
                const sphere = new Sphere(this.frustum, this.scene);
                this.instances.push(sphere);
                this.collidableMeshes.push(sphere.mesh);
                this.objects.add(sphere.getSphere());
            }
        }, 3000);

        this.ground = new Ground(globals.size, globals.divisions);
        this.scene.add(this.ground.getGround());

        this.addLights();
        this.addHelpers();

        this.player = new Player();
        this.scene.add(this.player.spaceship);

        this.world = new World();

        this.scene.add(this.objects);
        // start rendering
        this.loop.start();
    }

    calculateFrustum() {
        this.frustum = new THREE.Frustum();
        const cameraViewProjectionMatrix = new THREE.Matrix4();

        // every time the camera or objects change position (or every frame)
        this.camera.updateMatrixWorld(); // make sure the camera matrix is updated
        this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
        cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);

        this.frustum.setFromMatrix(cameraViewProjectionMatrix);

        console.log(this.frustum);
    }

    addHelpers() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

        const solidGroundGeo = new THREE.PlaneGeometry(
            globals.STEP * 2,
            (this.camera.top * 2) + (this.camera.position.z * 2),
        20, 20);
        solidGroundGeo.rotateX(-Math.PI / 2);
        const floorMat = new THREE.MeshLambertMaterial({
            wireframe: true,
            color: 0xff0000,
            side: THREE.DoubleSide,
        });

        const ground = new THREE.Mesh(solidGroundGeo, floorMat);
        // this.scene.add(ground);

        var helper = new THREE.CameraHelper( this.camera );
        this.scene.add( helper );

        const axisHelper = new THREE.AxisHelper(5);
        this.scene.add(axisHelper);
    }

    addLights() {
        const ambient = new THREE.AmbientLight(colors.ambient);
        this.scene.add(ambient);

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
        const now = Date.now() * 0.001;
        this.ground.update();

        this.instances.forEach(el => el.update(this.frustum));

        if (this.collidableMeshes[0] !== undefined && this.player.mesh) {
            const originPoint = this.player.spaceship.position.clone();

            for (var vertexIndex = 0; vertexIndex < this.player.mesh.geometry.vertices.length; vertexIndex++) {
                const localVertex = this.player.mesh.geometry.vertices[vertexIndex].clone();
                const globalVertex = localVertex.applyMatrix4(this.player.mesh.matrix);
                const directionVector = globalVertex.sub(this.player.mesh.position);

                const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
                const collisionResults = ray.intersectObjects(this.collidableMeshes);
                if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                    this.player.dead();
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

new Scene();
