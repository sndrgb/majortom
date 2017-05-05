const THREE = require('three');
const gsap = require('gsap');
import colors from './colors';
import globals from './globals';

export default class Player {
    constructor(frustum) {
        this.frustum = frustum;
        this.spaceship = new THREE.Object3D();
        this.currentHorizontal = 0;
        this.currentVertical = 0;
        this.mesh = null;
        this.init();
    }

    init() {
        // Create player on json load
        var ObjectLoader = new THREE.ObjectLoader();

        ObjectLoader.load('./spaceship.json', (obj) => {
            var m = new THREE.Matrix4();
            m.makeRotationY(Math.PI / 1);
            m.makeRotationX(Math.PI / 2);
            obj.geometry.applyMatrix(m);
            this.geometry = obj.geometry;
            this.create();
        });
    }

    create() {
        const material = new THREE.MeshPhongMaterial({
            color: colors.player.color,
            emissive: colors.player.emissive,
            shading: THREE.FlatShading,
            shininess: 0
        });

        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.scale.set(25, 25, 25);
        this.mesh.position.set(0, 50, 0);
        this.mesh.castShadow = true;
        this.mesh.name = "playerMesh";

        this.spaceship.add(this.mesh);

        this.spaceship.position.x = globals.step / 2;
        this.spaceship.position.z = 900 * window.ASPECT_RATIO;
        this.spaceship.rotation.y = Math.PI / 1;


        console.log('vertici' + this.mesh.geometry.vertices);

        TweenMax.to(this.spaceship.position, 1.2, {
            delay: 2,
            z: (globals.step * 5) - (globals.step / 2),
            ease: Power2.easeOut,
            onComplete: () => {
                this.events();
            }
        });
    }

    events() {
        this.controlKeys = {
            87: "forward",
            83: "backward",
            65: "left",
            68: "right"
        };

        const onKeyDown = this.onKeyDown;
        document.addEventListener('keydown', onKeyDown.bind(this), false);
        // document.addEventListener("keyup", onKeyUp, false);
    }

    onKeyDown(event) {
        if (
            this.isAnimating || 
            - global.step * 3 > this.spaceship.position.z >= global.step * 3
        ) {
            return;
        }

        this.isAnimating = true;
        const move = globals.step;

        // Move left
        if (
            this.controlKeys[event.keyCode] === 'left' &&
            this.currentHorizontal >= -1
        ) {
            this.currentHorizontal = this.currentHorizontal - 1;
            TweenMax.to(this.spaceship.rotation, 0.3, { z: -0.2 });
            TweenMax.to(this.spaceship.position, 0.3, {
                x: this.spaceship.position.x - move,
                ease: Power2.easeOut,
                onComplete: () => {
                    this.isAnimating = false;
                    TweenMax.to(this.spaceship.rotation, 0.3, {z: 0});
                }
            });
        }

        // Move right
        else if (
            this.controlKeys[event.keyCode] === 'right' &&
            this.currentHorizontal < 2
        ) {
            this.currentHorizontal = this.currentHorizontal + 1;
            TweenMax.to(this.spaceship.rotation, 0.3, { z: 0.2 });
            TweenMax.to(this.spaceship.position, 0.3, {
                x: this.spaceship.position.x + move,
                onComplete: () => {
                    this.isAnimating = false;
                    TweenMax.to(this.spaceship.rotation, 0.3, {z: 0});
                }
            });
        }

        // Move forward
        else if (
            this.controlKeys[event.keyCode] === 'forward' &&
            this.currentVertical >= -1
        ) {
            this.currentVertical = this.currentVertical - 1;
            TweenMax.to(this.spaceship.rotation, 0.3, { x: -0.2 });
            TweenMax.to(this.spaceship.position, 0.3, {
                z: this.spaceship.position.z - move,
                ease: Power2.easeOut,
                onComplete: () => {
                    TweenMax.to(this.spaceship.rotation, 0.3, { x: 0 });
                    this.isAnimating = false;
                }
            });
        }

        // Move backward
        else if (
            this.controlKeys[event.keyCode] === 'backward' &&
            this.currentVertical < 1
        ) {
            this.currentVertical = this.currentVertical + 1;
            TweenMax.to(this.spaceship.rotation, 0.3, { x: 0.2 });
            TweenMax.to(this.spaceship.position, 0.3, {
                z:  this.spaceship.position.z + move,
                ease: Power2.easeOut,
                onComplete: () => {
                    TweenMax.to(this.spaceship.rotation, 0.3, { x: 0 });
                    this.isAnimating = false;
                }
            });
        } else {
            this.isAnimating = false;
        }
    }

    dead() {
        TweenMax.to(this.spaceship.position, 10, {
            y:  5000,
            ease: Power2.easeOut,
        });

        TweenMax.to(this.spaceship.rotation, 0.5, {
            y: 5
        });
    }
}