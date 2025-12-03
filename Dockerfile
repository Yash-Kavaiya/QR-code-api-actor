# Use the official Apify Node.js base image
FROM apify/actor-node:20

# Install system dependencies required for canvas and sharp compilation on Alpine
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    libpng-dev \
    pixman-dev \
    python3 \
    vips-dev \
    fftw-dev \
    expat-dev \
    glib-dev

# Copy package files
COPY package*.json ./

# Install NPM packages and rebuild sharp for Alpine musl
RUN npm --quiet set progress=false \
    && npm install --only=prod --include=optional \
    && npm rebuild sharp --platform=linuxmusl --arch=x64 \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

# Copy source code
COPY . ./

# Run the Actor
CMD npm start
