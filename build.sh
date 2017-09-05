#!/bin/bash -e

VERSION="0.0.1";
NAME="nucleardreamer/airman";

MANIFEST_TOOL_PATH=$(which manifest-tool);

UNAME_ARCH=$(uname -m);

if [[ $# -lt 3 && $1 == "manifest" ]]; then
    if [ ! -e "$MANIFEST_TOOL_PATH" ]; then
        echo "";
        echo "* manifest-tool missing. Install it so you can use it!.";
        echo "";
        exit 1;
    else
        $MANIFEST_TOOL_PATH push from-spec manifest.yml
        $MANIFEST_TOOL_PATH push from-spec manifest.latest.yml
        echo "";
        echo "* manifest pushed successfully.";
        exit 0;
    fi
fi

case $UNAME_ARCH in
  x86_64)
    ARCH_TAG="amd64";
    ;;
  armv6l|armv7l)
    ARCH_TAG="arm";
    ;;
esac

FULL_TAG=$NAME:$VERSION-$ARCH_TAG
LATEST_TAG=$NAME:$ARCH_TAG

# build our base tag
echo "";
echo "** Building $FULL_TAG";
echo "";
docker build -t $FULL_TAG $(pwd);
docker tag $FULL_TAG $LATEST_TAG

# push our tags array
if [[ $# -lt 3 && $1 == "push" ]]; then
  docker push $FULL_TAG;
  docker push $LATEST_TAG;
fi
