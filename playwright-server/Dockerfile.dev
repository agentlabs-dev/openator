FROM mcr.microsoft.com/playwright:v1.50.1-noble AS dev

WORKDIR /app

# Install dependencies for VNC, Xvfb, and noVNC
RUN apt-get update && apt-get install -y \
    x11vnc \
    xvfb \
    xfce4 \
    xterm \
    curl \
    novnc \
    websockify && \
    rm -rf /var/lib/apt/lists/*

# Set up VNC password
RUN mkdir -p ~/.vnc && echo "secret" | x11vnc -storepasswd secret ~/.vnc/passwd && chmod 600 ~/.vnc/passwd

# (Optional) Copy package files if you want to use npm-managed dependencies.
COPY package.json package-lock.json ./
RUN npm install
RUN npm i -g ts-node

# Copy the Playwright server code including our new script
COPY . .

# Set the DISPLAY environment variable
ENV DISPLAY=:99

EXPOSE 5900 6080 9222

CMD Xvfb :99 -screen 0 1920x1080x24 & \
    sleep 2 && \
    x11vnc -forever -usepw -create -shared -display :99 & \
    websockify --web=/usr/share/novnc/ --cert=none 6080 localhost:5900 & \
    npm run start
