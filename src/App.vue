<template>
    <div id="app" v-if="game !== null">
        <transition appear @enter="enterIntro" @leave="leaveIntro" :css="false">
            <Intro v-if="!isIntro" :play="play"></Intro>
        </transition>
        <div class="top">
            <p>{{msg}}</p>
            <p>{{right}}</p>
        </div>
        <GameOver
            v-if="(status === 'gameover' || status === 'paused') && isIntro" 
            :distance="game.game.distance" 
            :replay="replay"
            :backHome="backHome"
        ></GameOver>
        <transition name="fade">
            <Ui 
                v-if="isIntro && status === 'playing'" 
                :distance="Math.floor(distance % 1000)"
                :level="Math.floor(distance / 1000)"
            ></Ui>
        </transition>
    </div>
</template>

<script>
import { TimelineMax } from 'gsap';
import loop from 'raf-loop';
import Game from './Game';

import Intro from './Intro.vue';
import GameOver from './GameOver.vue';
import Ui from './Ui.vue';

export default {
    name: 'app',
    data() {
        return {
            msg: 'Digital Design Days 2017.',
            right: 'by Alessandro Rigobello @sndrgb',
            distance: 0,
            level: 0,
            game: null,
            isIntro: false,
            status: 'paused',
        }
    },

    components: {
        Intro, GameOver, Ui
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
            this.game.render();
            this.distance = Math.floor(this.game.game.distance);
            this.level = this.game.game.level;
            this.status = this.game.game.status;
        },

        replay() {
            this.game.reset();
        },

        backHome() {
            this.isIntro = false;
            this.game.destroy();
        },

        play() {
            this.isIntro = true;
            this.game.reset();
        },

        enterIntro(el, done) {
            const tl = new TimelineMax({ onComplete: done });

            tl.fromTo(el, 0.5, {
                autoAlpha: 0
            }, {
                autoAlpha: 1
            });
        },

        leaveIntro(el, done) {
            const tl = new TimelineMax({ onComplete: done });

            tl
            .add('start')
            .to('.keys', 0.5, {
                autoAlpha: 0,
            }, 'start')
            .to('#play-button', 0.3, {
                autoAlpha: 0,
            }, 'start')
            .to('#logo', 0.3, {
                scaleX: 1.5,
                scaleY: 1.5,
                ease: Power3.easeOut,
                autoAlpha: 0,
            }, 'start+=0.3');
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
