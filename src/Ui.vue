<template>
    <div class="bottom">
        <p>level <span>{{level + 1}}</span></p>
        <p>distance <span>{{distance}}</span></p>
    </div>
</template>

<script>
export default {
    props: ['distance', 'level']
}
</script>

<style lang="scss" scoped>
.bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    display: flex;
    width: 100%;
    align-items: flex-end;
    justify-content: center;
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
</style>