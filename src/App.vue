<template>
    <div id="app">
        <div class="top">
            <p>{{msg}}</p>
            <p>{{right}}</p>
        </div>
        <div class="bottom">
            <p>level <span>{{Math.floor(distance / 1000)}}</span></p>
            <p>distance <span>{{distance}}</span></p>
        </div>
    </div>
</template>

<script>
import loop from 'raf-loop';
import Scene from './Scene'

export default {
    name: 'app',
    data() {
        return {
            msg: 'Digital Design Days 2017.',
            right: 'Alessandro Rigobello @sndrgb',
            distance: 0,
            level: 0,
        }
    },

    mounted() {
        this.scene = new Scene();
        this.loop = loop(this.render);

        // start rendering
        this.loop.start();
    },

    methods: {
        render() {
            this.scene.render();
            this.distance = Math.floor(this.scene.game.distance);
            this.level = this.scene.game.level;
        }
    }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,700,900');

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

  color: #2c3e50;
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

    p {
        text-align: right;
        margin-top: 2rem;
    }

    span {
        font-size: 3rem;
        display: block;
    }
}

/*252525*/
/*#46ffdd*/
/*#8367d8*/
</style>
