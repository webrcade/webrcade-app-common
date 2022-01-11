#!/bin/bash
npm run-script build
npm pack
cp *.tgz out/
