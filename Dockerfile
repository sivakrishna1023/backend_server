FROM node:18.16.0
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["pm2","start","index.js"]