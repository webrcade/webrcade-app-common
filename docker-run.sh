bash scripts/build-docker-image.sh
docker run -v "$(pwd)"/out:/app/out webrcade-app-common
