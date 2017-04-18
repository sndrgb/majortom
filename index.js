const THREE = require('three');
const loop = require('raf-loop');
const gsap = require('gsap');

const OrbitControls = require('three-orbitcontrols');
import { deg2rad } from './utils';

console.log(deg2rad);


class Computer {
    constructor() {
        this.obj = null;
    }

    loadJson() {
        const loader = new THREE.JSONLoader();
        const promise = new Promise((resolve) => { 
            const done = resolve; 
            loader.load(
                '/pc.json',
                (geometry, materials) => {
                    const material = new THREE.MultiMaterial(materials);
                    const mesh = new THREE.Mesh(geometry, material);
                    
                    this.generateMesh(mesh, done);
                }
            );
        });

        return promise;
    }

    generateMesh(mesh, done) {
        const vector = new THREE.Vector3();
        const matrix = new THREE.Matrix4();

        mesh.geometry.computeBoundingBox();
        const bbox = mesh.geometry.boundingBox;

        vector.subVectors(bbox.max, bbox.min);
        vector.multiplyScalar(0.5);
        vector.add(bbox.min);

        // matrix.makeTranslation(-vector.x, -vector.y, -vector.z);
        mesh.geometry.applyMatrix(matrix);
        mesh.geometry.verticesNeedUpdate = true;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.geometry.computeVertexNormals();
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.5;
        mesh.matrixWorldNeedsUpdate = true;

        const obj = new THREE.Object3D();
        obj.add(mesh);
        obj.name = 'computer';

        this.obj = obj;
        done();
    }
}

class Scene {
    constructor() {
        this.scene = new THREE.Scene();

        this.render = this.render.bind(this);
        this.loop = loop(this.render);

        // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // this.camera.position.z = 50;
        // this.camera.position.y = 50;
        // this.camera.lookAt(this.scene.position);

        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -1000, 10000);
        this.camera.position.x = 200;
        this.camera.position.y = 190;
        this.camera.position.z = 200;
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
        this.renderer.shadowMap.renderReverseSided = false;

        document.body.appendChild(this.renderer.domElement);

        this.init();
    }

    init() {
        const computer = new Computer();
        computer.loadJson().then(() => { this.addElementToScene(computer) });

        this.addLights();
        this.addPlane();
        this.addHelpers();

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

    addElementToScene(computer) {
        this.computer = computer.obj;
        this.scene.add(this.computer);

        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );
    }

    addPlane() {
        const geometry = new THREE.PlaneGeometry( 200, 200, 80, 80 );
        const material = new THREE.MeshBasicMaterial({ color: 0x252525, wireframe: true });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = deg2rad(90);
	    plane.position.set(0, 0, 0);

        this.scene.add(plane);
    }

    addLights() {
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 500, 0 );
        this.scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 50 );
        this.scene.add( dirLight );

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        const d = 50;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = -0.0001;

        const helper = new THREE.DirectionalLightHelper(dirLight, 5);
        this.scene.add(helper);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

new Scene();
