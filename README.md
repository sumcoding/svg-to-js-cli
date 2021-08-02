![Tests](https://github.com/sumcoding/svg-to-js-cli/workflows/Tests/badge.svg)

# svg-to-js-cli
A simple cli for converting svgs into a javascript object

## Install

`npm install svg-to-js-cli`

or

`yarn add svg-to-js-cli`

## Usage

```$ svgtojs [sourceDirectory || sourceFile] [destinationDirectory]```

If `destinationDirectory` is not set it will default to the source directory

## Options

`--module` or `-m`, separate modules for each icon


Creates a javascript object: 
```
icons/index.js
```

```
export const icons = {
  [name of icon in camelCase]: {
    height: [viewBox height],
    width: [viewBox width],
    viewBox: [viewBox],
    path: [everything between the svg tag]
  }
}
```

Example vue component
```
<template>
  <svg v-if="icon" :viewBox="viewBox" v-html="icon.path" :style="{ width, height }" />
</template>

<script>
import icons from '@/icons';

export default {
  name: 'Icon',
  props: {
    name: String,
    width: {
      type: Number,
      default: 24
    },
    height: {
      type: Number,
      default: 24
    }
  },
  computed: {
    icon() {
      return icons[name];
    },
    viewBox() {
      return `0 0 ${this.width} ${this.height}`;
    },
    width() {
      return `${this.width}px`;
    },
    height() {
      return `${this.height}px`;
    }
  },

}
</script>

<style scoped>
svg path {
  fill: blue;
}
</style>

```