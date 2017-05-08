const THREE = require('three');

THREE.Cache.enabled = true;

class Text {
    constructor(scene) {
        this.scene = scene;
        this.bevelEnabled = true;
        this.hex = 0xffffff;
        this.size = 50;
        this.height = 20;
        this.init();
    }

    decimalToHex( d ) {
        var hex = Number( d ).toString( 16 );
        hex = "000000".substr( 0, 6 - hex.length ) + hex;
        return hex.toUpperCase();
    }

    init() {
        this.hex = 0xffffff;
        this.text = decodeURI('canna');
        this.materials = [
            new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
            new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
        ];

        this.loadFont();
    }

    boolToNum( b ) {
        return b ? 1 : 0;
    }

    loadFont() {
        const loader = new THREE.FontLoader();
        loader.load( 'assets/font.typeface.json', (response) => {
            this.font = response;
            this.createText();
        });
    }

    createText() {
        const textGeo = new THREE.TextGeometry('ddd', {
            font: this.font,
            size: this.size,
            height: this.height,
            curveSegments: 4,
            bevelThickness: 2,
            bevelSize: 1.5,
            bevelEnabled: true,
            material: 0,
            extrudeMaterial: 1
        });

        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();

        const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
        this.mesh = new THREE.Mesh(textGeo, this.materials);
        this.mesh.position.x = centerOffset;
        this.mesh.position.y = 0;
        this.mesh.position.z = 0;
        this.mesh.rotation.x = 0;
        this.mesh.rotation.y = Math.PI * 2;
        this.mesh.name = 'text';

        this.scene.add(this.mesh);
    }

    refreshText() {
        this.group.remove(this.mesh);
        if (!this.text) return;

        this.createText();
    }
}

export default Text;