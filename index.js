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
import Keyboard from './Keyboard';

class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        // this.scene.fog = new THREE.Fog(0xdddddd, 100,950);

        this.render = this.render.bind(this);
        this.loop = loop(this.render);

        // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // this.camera.position.z = 50;
        // this.camera.position.y = 50;
        // this.camera.lookAt(this.scene.position);

        const aspectRatio = window.innerWidth / window.innerHeight;
        const fieldOfView = 60;
        const nearPlane = 1;
        const farPlane = 10000;
        this.camera = new THREE.PerspectiveCamera(
            fieldOfView,
            aspectRatio,
            nearPlane,
            farPlane
            );
        this.camera.position.x = 200;
        this.camera.position.z = 200;
        this.camera.position.y = 300;

        // const width = window.innerWidth;
        // const height = window.innerHeight;
        // this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -10000, 100000);
        // this.camera.position.x = 200;
        // this.camera.position.y = 190;
        // this.camera.position.z = 200;
        // this.camera.zoom = 1.8;

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
        this.computer = new Computer();
        this.computer.loadJson().then(() => { 
            const computer = this.computer.obj;
            this.scene.add(computer);
         });

        this.ground = new Ground();
        this.scene.add(this.ground.getGround());


        this.addLights();
        this.addHelpers();

        this.keys = new Keyboard(this.dirLight);
        this.world = new World();

        // start rendering
        this.loop.start();
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
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 500, 0);
        this.scene.add(hemiLight);

        const dirLight = this.dirLight = new THREE.DirectionalLight(0xffffff, 1, 100);
        dirLight.color.setHSL( 0.1, 1, 0.85 );
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 500 );
        dirLight.castShadow = true;

        this.scene.add( dirLight );

        dirLight.shadow.mapSize.width = 4096;
        dirLight.shadow.mapSize.height = 4096;

        const d = 500;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.camera.far = 5000;
        dirLight.shadow.bias = -0.0015;

        // const helper = new THREE.DirectionalLightHelper(dirLight, 5);
        // this.scene.add(helper);

        // const shadowhelper = new THREE.CameraHelper( dirLight.shadow.camera );
        // this.scene.add( shadowhelper );

    }

    render() {
        this.ground.update();
        this.computer.update();

        this.renderer.render(this.scene, this.camera);
    }
}

new Scene();
