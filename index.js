const THREE = require('three');
const loop = require('raf-loop');
const gsap = require('gsap');
const CANNON = require('cannon');

const OrbitControls = require('three-orbitcontrols');
import { deg2rad } from './utils';

import colors from './colors';
import Computer from './Computer';
import Card from './Card';
import World from './World';
import Ground from './Ground';
import Player from './Player';
import Sphere from './Sphere';

class Scene {
    constructor() {
        this.instances = [];
        this.scene = new THREE.Scene();
        // this.scene.fog = new THREE.Fog(0xdddddd, 100,950);

        this.render = this.render.bind(this);
        this.loop = loop(this.render);

        // const aspectRatio = window.innerWidth / window.innerHeight;
        // const fieldOfView = 60;
        // const nearPlane = 1;
        // const farPlane = 10000;
        // this.camera = new THREE.PerspectiveCamera(
        //     fieldOfView,
        //     aspectRatio,
        //     nearPlane,
        //     farPlane
        //     );
        // this.camera.position.x = 200;
        // this.camera.position.z = 200;
        // this.camera.position.y = 300;

        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -10000, 100000);
        this.camera.position.x = 200;
        this.camera.position.y = 190;
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

        this.computer = new Computer();
        this.computer.loadJson().then(() => {
            const computer = this.computer.obj;
            this.objects.add(computer);
         });

        this.instances.push(this.computer);

        for (let i = 1; i <= 8; i++) {
            const sphere = new Sphere(this.frustum);
            this.instances.push(sphere);
            this.objects.add(sphere.getSphere());
        }

        this.ground = new Ground();
        this.scene.add(this.ground.getGround());

        this.addLights();
        this.addHelpers();

        this.player = new Player();
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
    }

    addHelpers() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

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

        const dirhelper = new THREE.DirectionalLightHelper(dirLight, 5);
        this.scene.add(dirhelper );
        const shadowhelper = new THREE.CameraHelper( dirLight.shadow.camera );
        this.scene.add(shadowhelper);
    }

    render() {
        const now = Date.now() * 0.001;
        this.ground.update();

        this.instances.forEach(el => el.update(this.frustum));

        // this.point.position.z = Math.sin(now) * 500;
        // this.point.position.x = Math.cos(now) * 500;

        this.renderer.render(this.scene, this.camera);
    }
}

new Scene();
