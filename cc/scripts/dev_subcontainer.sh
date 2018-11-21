#!/bin/bash

if [ "$#" != "1" ]
then
    echo "usage: subcontainer.sh [subcontainer]"
    exit 255
fi

subcontainer=$1

python cc/gen.py subcontainer "${subcontainer}"
