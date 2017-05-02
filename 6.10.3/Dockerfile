FROM node:6.10.3
MAINTAINER Azure App Services Container Images <appsvc-images@microsoft.com>
 
COPY init_container.sh /bin/
 
RUN  npm install -g pm2 \
     && mkdir /pm2home     \
     && chmod 777 /pm2home \
     && rm -rf /pm2home/logs \
     && ln -s /home/LogFiles /pm2home/logs \
     && echo "root:Docker!" | chpasswd \
     && apt update \
     && apt install -y --no-install-recommends openssh-server \
     && chmod 755 /bin/init_container.sh 

COPY sshd_config /etc/ssh/

EXPOSE 2222

CMD ["/bin/init_container.sh"]
