#!/bin/bash

project=`basename \`pwd\``

python cc/gen.py project "${project}"
