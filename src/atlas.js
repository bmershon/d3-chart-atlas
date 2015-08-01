import {configuration} from "./configuration";

// THIS FILE IS USED FOR ITS "SIDE EFFECT", rather than any of its bindings or
// its exposed functions

// Assumes d3.chart has already been included
d3.chart("atlas", configuration);
