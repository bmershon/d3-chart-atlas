import {center} from "./center";
import {graticule} from "./graticule";
import {height} from "./height";
import {chart_initialize} from "./chart_initialize";
import {path} from "./path";
import {pointRadius} from "./pointRadius";
import {precision} from "./precision";
import {projection} from "./projection";
import {rotate} from "./rotate";
import {scale} from "./scale";
import {chart_transform} from "./chart_transform";
import {translate} from "./translate";
import {width} from "./width";
import {zoomToLayer} from "./zoomToLayer";
import {rotateToLayer} from "./rotateToLayer";

var configuration = {};

// required by d3.chart specification
configuration.initialize = chart_initialize;

// optional data transform "hook" method to transform incoming data
configuration.transform = chart_transform;

// accessors and mutators
configuration.center = center;
configuration.graticule = graticule;
configuration.height = height;
configuration.path = path;
configuration.projection = projection;
configuration.rotate = rotate;
configuration.scale = scale;
configuration.translate = translate;
configuration.precision = precision;
configuration.pointRadius = pointRadius;
configuration.width = width;
configuration.zoomToLayer = zoomToLayer;
configuration.rotateToLayer = rotateToLayer;


export {configuration};
