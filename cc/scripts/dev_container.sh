#!/bin/bash

if [ "$#" != "1" ]
then
    echo "usage: container.sh [container]"
    exit 255
fi

container=$1

python cc/gen.py container "${container}"
