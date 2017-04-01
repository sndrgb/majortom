const THREE = require('three');
const loop = require('raf-loop')

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

        matrix.makeTranslation(-vector.x, -vector.y, -vector.z);
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

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;
        this.camera.position.y = 50;
        this.camera.lookAt(this.scene.position);

        this.renderer = new THREE.WebGLRenderer({ alpha: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.init();
    }

    init() {
        const computer = new Computer();
        computer.loadJson().then(() => { this.addElementToScene(computer) });

        this.addLights();
        this.addPlane();

        // start rendering
        this.loop.start();
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
        const geometry = new THREE.PlaneGeometry( 100, 100, 100, 100 );
        const material = new THREE.MeshBasicMaterial({color: 0x2800D7, wireframe: true});
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = 1;
	    plane.position.set(0, 0, 5);

        this.scene.add(plane);
    }

    addLights() {
        var light = new THREE.AmbientLight( 0x404040 ); // soft white light
        this.scene.add( light );

        var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        this.scene.add( light );
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}


new Scene();


gsap.set(document.body, {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
});