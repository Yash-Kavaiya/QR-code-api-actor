# Use the official Apify Node.js base image
FROM apify/actor-node:20

# Copy package files
COPY package*.json ./

# Install NPM packages
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

# Copy source code
COPY . ./

# Run the Actor
CMD npm start
