FROM denoland/deno:alpine as builder

ARG MARMOT_VERSION=v0.8.3-beta.1

WORKDIR /root
COPY . .
# ADD https://github.com/maxpert/marmot/releases/download/${MARMOT_VERSION}/marmot-${MARMOT_VERSION}-linux-amd64.tar.gz /tmp/marmot.tar.gz
# RUN apk --no-cache add ca-certificates wget && \
#     cd /root && \
#     tar vxzf /tmp/marmot.tar.gz
RUN deno compile --allow-all --unstable --output ./main ./main.ts

FROM frolvlad/alpine-glibc:alpine-3.17
WORKDIR /root
COPY --from=builder /root/main /root/main
COPY --from=builder /root/index.html /root/index.html

ENTRYPOINT ["/root/main"]
CMD []
