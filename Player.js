class Player {
    constructor() {
        this.spaceship = new THREE.Object3D(),
        spaceshipMesh = null;
    }
    init() {
        // Create player on json load
        var ObjectLoader = new THREE.ObjectLoader();
        ObjectLoader.load("assets/model.json", function(obj) {
            var m = new THREE.Matrix4();
            m.makeRotationY(Math.PI / 1);
            m.makeRotationX(Math.PI / 2);
            obj.geometry.applyMatrix(m);
            player.mesh = obj.geometry;
            player.create();
            enemies.create();
        });
    }

    create() {

        var material = new THREE.MeshPhongMaterial({
            color: colors.player.color,
            emissive: colors.player.emissive,
            shading: THREE.FlatShading,
            shininess: 0
        });

        var spaceshipMesh = new THREE.Mesh(player.mesh, material);

        spaceshipMesh.scale.set(25, 25, 25);
        spaceshipMesh.position.set(0, 50, 0);
        spaceshipMesh.castShadow = true;
        spaceshipMesh.name = "playerMesh";

        player.spaceship.add(spaceshipMesh);
        player.spaceshipMesh = spaceshipMesh;
        scene.add(player.spaceship);

        if (opts.helpers) {

            var axisHelper = new THREE.AxisHelper(100);
            axisHelper.position.y = 50;
            player.spaceship.add(axisHelper);
        }

        player.spaceship.position.z = 1500;
        player.spaceship.rotation.y = Math.PI / 1;

        TweenMax.to(player.spaceship.position, 1.2, {
            z: 500,
            ease: Power2.easeOut,
            onComplete: function() {
                player.events();
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
        document.addEventListener("keydown", onKeyDown, false);
        // document.addEventListener("keyup", onKeyUp, false);
    }

    onKeyDown(event) {

        console.log(this.controlKeys[event.keyCode]);

        // Move left
        if (this.controlKeys[event.keyCode] === 'left') {
            TweenMax.to(this.point.position, 2, {
                x: this.point.position.x -= 100,
                ease: Power2.easeOut,
            });
        }

        // Move right
        if (this.controlKeys[event.keyCode] === 'right') {
            TweenMax.to(this.point.position, 2, {
                x: this.point.position.x += 100,
                ease: Power2.easeOut,
            });
        }

        // Move forward
        if (this.controlKeys[event.keyCode] === 'forward') {
            TweenMax.to(this.point.position, 2, {
                z: -this.moveDistanceZ,
                ease: Power2.easeOut
            });
        }

        // Move backward
        if (this.controlKeys[event.keyCode] === 'backward') {
            TweenMax.to(this.point.position, 2, {
                z:  this.moveDistanceZ,
                ease: Power2.easeOut
            });
        }
    }

    fire() {

        gun.fire();

        TweenMax.to(player.spaceshipMesh.position, 0.06, {
            z: player.spaceshipMesh.position.z - 5,
            onComplete: function() {
                TweenMax.to(player.spaceshipMesh.position, 0.06, {
                    z: 0
                });
            }
        });

        TweenMax.to(player.spaceshipMesh.rotation, 0.06, {
            x: player.spaceshipMesh.rotation.x - .15,
            onComplete: function() {
                TweenMax.to(player.spaceshipMesh.rotation, 0.06, {
                    x: player.spaceshipMesh.rotation.x + .15
                });
            }
        });
    }
}