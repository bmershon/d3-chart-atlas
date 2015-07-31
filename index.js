import {center} from "./src/center";
import {graticule} from "./src/graticule";
import {height} from "./src/height";
import {initialize} from "./src/initialize";
import {path} from "./src/path";
import {pointRadius} from "./src/pointRadius";
import {precision} from "./src/precision";
import {projection} from "./src/projection";
import {rotate} from "./src/rotate";
import {scale} from "./src/scale";
import {transform} from "./src/transform";
import {translate} from "./src/translate";
import {width} from "./src/width";
import {zoomToLayer} from "./src/zoomToLayer";


var configuration = {};

// required by d3.chart specification
configuration.initialize = initialize;

// optional data transform "hook" method to transform incoming data
configuration.transform = transform;

// accessors and mutators
configuration.width = width;
configuration.height = height;
configuration.projection = projection;
configuration.rotate = rotate;
configuration.graticule = graticule;
configuration.scale = scale;
configuration.translate = translate;
configuration.center = center;
configuration.precision = precision;
configuration.pointRadius = pointRadius;
configuration.zoomToLayer = zoomToLayer;

export default function() {
  d3.chart("atlas", configuration);
}
