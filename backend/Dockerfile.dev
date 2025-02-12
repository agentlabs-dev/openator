FROM node:20-alpine AS dev

WORKDIR /app

# Install only Node dependencies for your backend
COPY package.json package-lock.json ./
RUN npm install

# Copy backend application
COPY . .

EXPOSE 3000

# Updated CMD to only start the backend server
CMD npm run start:dev
