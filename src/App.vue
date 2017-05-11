<template>
    <div id="app">
        <transition appear @:enter="enterIntro" @:leave="leaveIntro" :css="false">
            <Intro :show="show" :play="play"></Intro>
        </transition>
        <div class="top">
            <p>{{msg}}</p>
            <p>{{right}}</p>
        </div>
        <transition name="fade">
            <div v-if="show">
                <div class="mid" v-if="status === 'gameover' || status === 'paused'">
                    <p>Game Over</p>
                    <h2>
                        You run for<br>
                        <span>{{Math.floor(game.game.distance)}}</span>
                    </h2>
                    <button @click="replay">
                        Replay
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M12 0c3.31 0 6.29 1.353 8.46 3.522l2.48-2.48L24 8.382l-7.437-.965 2.49-2.49C17.242 3.122 14.752 2 12 2 6.486 2 2 6.486 2 12s4.486 10 10 10c3.872 0 7.23-2.216 8.89-5.443l1.717 1.046C20.595 21.406 16.602 24 12 24 5.373 24 0 18.627 0 12S5.373 0 12 0z"/></svg>
                    </button>
                </div>
                <div class="bottom" v-if="status === 'playing'">
                    <p>level <span>{{Math.floor(distance / 1000)}}</span></p>
                    <p>distance <span>{{distance}}</span></p>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import loop from 'raf-loop';
import Game from './Game'
import Intro from './Intro.vue'

export default {
    name: 'app',
    data() {
        return {
            msg: 'Digital Design Days 2017.',
            right: 'by Alessandro Rigobello @sndrgb',
            distance: 0,
            level: 0,
            show: false,
            status: 'paused',
        }
    },

    components: {
        Intro
    },

    mounted() {
        this.game = new Game();
        this.game.resetProps();
        this.loop = loop(this.render);
        // start rendering
        this.loop.start();
    },

    methods: {
        render() {
            //if (this.game.game.stop) this.loop.stop();
            //console.log(this.game.game.stop);
            this.game.render();
            this.distance = Math.floor(this.game.game.distance);
            this.level = this.game.game.level;
            this.status = this.game.game.status;
        },

        replay() {
            this.game.reset();
        },

        play() {
            this.show = true;
            this.game.reset('playing');
        },

        enterIntro(el, done) {
            console.log(el);
            done();
        },

        leaveIntro(el, done) {
            console.log(el);
            done();
        }
    }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,700,900');

$main-color: #2c3e50;

#app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
  bottom: 0;
  font-family: 'Lato', sans-serif;
  font-weight: 300;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: $main-color;
  margin: 40px;
  z-index: 20;
}

.intro {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    > h2 svg {
        width: 350px;
        margin-bottom: 25px;
    }

    /*#252525*/
    /*#46ffdd*/
    /*#8367d8*/

    .major {
        fill: #252525;
    }

    .tom {
        fill: #8367d8;
    }

    > p {
        margin: 5px;
        line-height: 25px;
    }

    > button {
        &:hover {
            svg {
                transform: translateX(2px);
            }
        }
    }
}

p {
    margin: 0;
}

canvas {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
  bottom: 0;
}

.top {
    display: flex;
    width: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    justify-content: space-between;
    visibility: visible;
}

.mid {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    visibility: visible;

    p {
        font-size: 2.2rem;
        text-transform: uppercase;
        margin-bottom: 1rem;
    }

    span {
        font-size: 2.2rem;
    }

    h2 {
        font-weight: 300;
        margin-bottom: 2rem;
        text-align:center;
    }
}

.bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    width: 100%;
    justify-content: flex-end;
    flex-flow: column;
    visibility: visible;

    p {
        text-align: right;
        margin-top: 2rem;
    }

    span {
        font-size: 3rem;
        display: block;
    }
}


button {
    background: $main-color;
    color: white;
    padding: 10px 20px;
    border-radius: 30px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: lighten($main-color, 10%);

        svg {
            transform: rotate(180deg);
        }
    }

    svg {
        margin-left: 10px;
        fill: white;
        transition: all 0.2s;
    }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0
}

.keys {
    display:flex;
    flex-flow: column;
    align-items: center;
    margin-top: 65px;
    line-height: 22px;

    svg {
        margin-top: 10px;
        width: 50px;
        stroke: $main-color;
        fill: $main-color;
    }
    .st0 {
        fill: none;
        // fill: $main-color;
    }
}

/*252525*/
/*#46ffdd*/
/*#8367d8*/
</style>
