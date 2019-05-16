#!/bin/bash

scriptDIR=$(cd `dirname $0` && pwd)
projDIR=`dirname "$scriptDIR"`

pip install virtualenv

eval $projDIR/scripts/init_cookiecutter.sh;

npm install;

ln -s $projDIR/config.js $projDIR/node_modules/config.js;
rm $projDIR/node_modules/react-scripts/config/webpack.config.dev.js;
ln $projDIR/config/webpack.config.dev.js $projDIR/node_modules/react-scripts/config;
rm $projDIR/node_modules/react-scripts/config/webpack.config.prod.js;
ln $projDIR/config/webpack.config.prod.js $projDIR/node_modules/react-scripts/config;
