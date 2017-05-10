const THREE = require('three');
const gsap = require('gsap');
import colors from './colors';
import globals from './globals';

const spaceship = require('./assets/spaceship.json');

export default class Player {
    constructor(frustum) {
        this.deadTweens = [];
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

        ObjectLoader.load(spaceship, (obj) => {
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

        this.spaceship.position.x = globals.step / 2;
        this.spaceship.position.z = 900 * window.ASPECT_RATIO;
        this.spaceship.position.y = 0;

        this.spaceship.add(this.mesh);
    }

    restart() {
        this.currentHorizontal = 0;
        this.currentVertical = 0;
        this.deadTweens.forEach((el) => el.kill());
        this.spaceship.position.x = globals.step / 2;
        this.spaceship.position.z = 900 * window.ASPECT_RATIO;
        this.spaceship.position.y = 0;

        this.spaceship.rotation.z = 0;
        this.spaceship.rotation.x = 0;
        this.spaceship.rotation.y = Math.PI / 1;

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

        this.onKeyDown = this.onKeyDown.bind(this);
        document.addEventListener('keydown', this.onKeyDown, false);
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
            this.currentVertical >= -3
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
        document.removeEventListener('keydown', this.onKeyDown);

        const tween1 = TweenMax.to(this.spaceship.position, 3, { y:  900, ease: Power1.easeOut });
        const tween2 = TweenMax.to(this.spaceship.rotation, 2, { y: 5 });
        this.deadTweens = [tween1, tween2];
    }
}