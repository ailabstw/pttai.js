#!/bin/bash

if [ "$#" != "1" ]
then
    echo "usage: component.sh [component]"
    exit 255
fi

component=$1

python cc/gen.py component "${component}"
