# Base image
FROM node:18.16.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install uuid@8.3.2
RUN npm run build

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD [ "node", "server.js" ]