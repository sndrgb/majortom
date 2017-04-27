const THREE = require('three');

export default class Computer {
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
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
        mesh.matrixWorldNeedsUpdate = true;

        const obj = new THREE.Object3D();
        obj.add(mesh);
        obj.name = 'computer';

        this.obj = obj;
        done();
    }

    update() {
        const timer = Date.now() * 0.001;

        if (this.obj) {
            this.obj.position.y = (Math.sin(timer) * 20) + 25;
            // this.obj.position.z += 0.8;
        }
    }
}