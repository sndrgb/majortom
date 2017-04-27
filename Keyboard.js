const THREE = require('three');
const gsap = require('gsap');

export default class Keyboard {
    constructor(point) {
        this.point = point;
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
        const moveDistance = 2000;

        console.log(this.controlKeys[event.keyCode]);

        // Move left
        if (this.controlKeys[event.keyCode] === 'left') {
            TweenMax.to(this.point.position, 2, { 
                x: this.point.position.x - moveDistance, 
                ease: Power2.easeOut,
            });
        }

        // Move right
        if (this.controlKeys[event.keyCode] === 'right') {
            TweenMax.to(this.point.position, 2, { 
                x: this.point.position.x + moveDistance, 
                ease: Power2.easeOut,
            });
        }

        // Move forward
        if (this.controlKeys[event.keyCode] === 'forward') {
            TweenMax.to(this.point.position, 2, {
                z: this.point.position.z - moveDistance,
                ease: Power2.easeOut
            });
        }

        // Move backward
        if (this.controlKeys[event.keyCode] === 'backward') {
            TweenMax.to(this.point.position, 2, {
                z: this.point.position.z + moveDistance,
                ease: Power2.easeOut
            });
        }
    }
}