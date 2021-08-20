FROM devopsfaith/krakend:latest

COPY krakend.json /etc/krakend/krakend.json
COPY templates/ /etc/krakend/templates/
COPY settings/ /etc/krakend/settings/

ENV FC_ENABLE "1"
ENV FC_SETTINGS "/etc/krakend/settings"
ENV FC_TEMPLATES "/etc/krakend/templates"

EXPOSE 8085