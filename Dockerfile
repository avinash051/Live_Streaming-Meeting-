FROM node:12.18.4
WORKDIR /app
COPY ./ ./
RUN npm install -g @angular/cli@10.1.7
RUN npm install
RUN npm install ng
RUN npm install cors
RUN ng build --prod
EXPOSE 3030
CMD ng serve --port 3030 --host=0.0.0.0  --disableHostCheck true