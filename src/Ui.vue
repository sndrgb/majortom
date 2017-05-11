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

<style>
</style>