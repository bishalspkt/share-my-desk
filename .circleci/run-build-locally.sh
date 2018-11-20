#!/usr/bin/env bash

# Plug and Play values for local testing

# CIRCLE_TOKEN # Set up if not present in environment

COMMIT_HASH="d681837b9c6cd7127a0eed427eedd047e6cd1d3d"
USERNAME="bishalspkt"
SOURCE="github"
PROJECT_NAME="share-my-desk"
BRANCH="master"



curl --user ${CIRCLE_TOKEN}: \
    --request POST \
    --form revision=${COMMIT_HASH} \
    --form config=@config.yml \
    --form notify=false \
        https://circleci.com/api/v1.1/project/${SOURCE}/${USERNAME}/${PROJECT_NAME}/tree/${BRANCH}
