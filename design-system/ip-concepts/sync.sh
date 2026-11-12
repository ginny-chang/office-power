#!/bin/sh
# Copies the concept page into dist/ so the 4173 preview can serve it. Run again after npm run build.
# The character module keeps its real relative paths, so the page and My Board load the same file.
cd "$(dirname "$0")/../.." || exit 1
out=dist/ip-concepts
mkdir -p $out/vendor/addons/geometries $out/vendor/addons/environments $out/src-dashboard $out/src/components
cp design-system/ip-concepts/index.html design-system/ip-concepts/main.js $out/
cp node_modules/three/build/three.module.js $out/vendor/
cp node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js $out/vendor/addons/geometries/
cp node_modules/three/examples/jsm/environments/RoomEnvironment.js $out/vendor/addons/environments/
cp src-dashboard/agent-characters.js src-dashboard/agent-portraits.js $out/src-dashboard/
cp src/components/robot-shell.js $out/src/components/
