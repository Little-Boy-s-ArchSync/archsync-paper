FROM ghcr.io/xu-cheng/texlive-historic-debian:2024

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install --yes --no-install-recommends \
      ca-certificates \
      curl \
      git \
      openssh-client \
      poppler-utils \
    && rm -rf /var/lib/apt/lists/*
