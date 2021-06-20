#!/bin/bash

# Start services
pm2 start app.config.yaml

# Watch logs
pm2 logs
