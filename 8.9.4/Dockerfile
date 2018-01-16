FROM node:8.9.4
MAINTAINER Azure App Services Container Images <appsvc-images@microsoft.com>

COPY startup /opt/startup
COPY hostingstart.html /home/site/wwwroot/hostingstart.html
COPY sshd_config /etc/ssh/

RUN npm install -g pm2 \
     && mkdir -p /home/LogFiles \
     && echo "root:Docker!" | chpasswd \
     && echo "cd /home" >> /etc/bash.bashrc \
     && apt update \
     && apt install -y --no-install-recommends openssh-server vim curl wget tcptraceroute \
     && cd /opt/startup \
     && npm install \
     && chmod 755 /opt/startup/init_container.sh

EXPOSE 2222 8080

ENV PM2HOME /pm2home

ENV PORT 8080
ENV WEBSITE_ROLE_INSTANCE_ID localRoleInstance
ENV WEBSITE_INSTANCE_ID localInstance
ENV PATH ${PATH}:/home/site/wwwroot

WORKDIR /home/site/wwwroot

ENTRYPOINT ["/opt/startup/init_container.sh"]
