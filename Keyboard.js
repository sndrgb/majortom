const THREE = require('three');
const gsap = require('gsap');

export default class Keyboard {
    constructor(camera, scene) {
        this.camera = camera;

        this.point = new THREE.PointLight( 0xff0000, 1, 100 );
        this.point.position.set(500, 50, 50);
        // this.point.castShadow = true;
        const pointLightHelper = new THREE.PointLightHelper(this.point , 20);
        scene.add(pointLightHelper);

        this.mouse = {};
        this.controlKeys = {
            87: "forward",
            83: "backward",
            65: "left",
            68: "right"
        };

        const onKeyDown = this.onKeyDown;
        document.addEventListener("keydown", onKeyDown.bind(this), false);
    }


    onKeyDown(event) {
        // Move left
        if (this.controlKeys[event.keyCode] == 'left') {
            // Slight tilt
            TweenMax.to(this.point.rotation, 0.3, {z: -.4});

            TweenMax.to(this.point.spaceship.position, 2, { 
                x: this.point.position.x - moveDistance, ease: Power2.easeOut,
                onComplete() {
                    console.log(this.point.position);
                    // reset rotation
                    TweenMax.to(this.point.rotation, 0.3, { z: 0 });
                }
            });
        }

        // Move right
        if (this.controlKeys[event.keyCode] == 'right') {
            // Slight tilt
            TweenMax.to(this.point.rotation, 0.3, {z: +.4});
            // Move on x axis
            TweenMax.to(this.point.position, 2, { 
                x: this.point.position.x + moveDistance, ease: Power2.easeOut,
                onComplete() {
                    // reset rotation
                    TweenMax.to(this.point.rotation, 0.3, {z: 0});
                }
            });
        }

        // Move forward
        if (this.controlKeys[event.keyCode] == 'forward') {
            TweenMax.to(this.point.position, 2, {
                z: this.point.position.z - moveDistance,ease: Power2.easeOut
            });
        }

        // Move backward
        if (this.controlKeys[event.keyCode] == 'backward') {
            TweenMax.to(this.point.position, 2, {
                z: this.point.position.z + moveDistance,ease: Power2.easeOut
            });
        }
    }

    getKeyboard() {
        return this.point;
    }
}