import {center} from "./src/center.js";
import {graticule} from "./src/graticule.js";
import {height} from "./src/height.js";
import {initialize} from "./src/initialize.js";
import {path} from "./src/path.js";
import {pointRadius} from "./src/pointRadius.js";
import {precision} from "./src/precision.js";
import {projection} from "./src/projection.js";
import {rotate} from "./src/rotate.js";
import {scale} from "./src/scale.js";
import {transform} from "./src/transform.js";
import {translate} from "./src/translate.js";
import {width} from "./src/width.js";
import {zoomToLayer} from "./src/zoomToLayer.js";


!function() {
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

  d3.chart("atlas", configuration);
}();
