FROM alpine

# update apk repo
#RUN echo "http://dl-4.alpinelinux.org/alpine/v3.14/main" >> /etc/apk/repositories && \
#    echo "http://dl-4.alpinelinux.org/alpine/v3.14/community" >> /etc/apk/repositories

# update
RUN apk update

# install chromedriver
RUN apk update
RUN apk add chromium chromium-chromedriver

# install node
RUN apk add nodejs npm

# move files
COPY . /src
WORKDIR /src

# install selenium
RUN npm install selenium-webdriver

# run the script
#ENTRYPOINT ["npm", "start"]
