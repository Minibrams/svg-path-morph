# `svg-path-morph`
![ci](https://github.com/Minibrams/svg-path-morph/workflows/ci/badge.svg)
![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Minibrams/52a42b0e3eb35095e2f81e12d63dc374/raw/svg-path-morph__master.json)
[![size](https://packagephobia.now.sh/badge?p=svg-path-morph)](https://packagephobia.now.sh/result?p=svg-path-morph)
[![version](http://img.shields.io/npm/v/svg-path-morph.svg?style=flat)](https://www.npmjs.org/package/svg-path-morph)

A simple library for morphing between variations of SVG paths.
Use `svg-path-morph` to smoothly morph between X variations of the same SVG path (i.e. same commands, different values).


# Installation
```
npm install --save svg-path-morph
```

# Demo

https://user-images.githubusercontent.com/8108085/172227481-1e1e1e9b-6868-41f9-81e0-dfb52ec32e3d.mp4

> See `demo.html` and `src/demo.js` for the implementation of the above demonstration

# Usage
```typescript

import { compile, morph } from 'svg-path-morph'


// Get the d attributes of the <path> elements 
// you want to morph between
const paths = {
  happyFace: 'M6.5 17.5C12.8333 11.6667 38.5 ...',
  angryFace: 'M7 13.5C13.3333 7.66667 36 -5.5...'
}


const compiled = compile([ 
  paths.happy, 
  paths.angry 
])

const face = morph(
  compiled,  // Morph between the happy/angry faces,
  [
    0.80,  // 80% happy
    0.20   // 20% angry
  ]
)

// Use the face is the d attribute of a <path> element
document.getElementById('the-face').setAttribute('d', face)
```
