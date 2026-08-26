# Node.js 22.16.0 bookworm-slim multi-platform manifest.
FROM docker.io/library/node@sha256:048ed02c5fd52e86fda6fbd2f6a76cf0d4492fd6c6fee9e2c463ed5108da0e34 AS node-runtime

# TeX Live historic Debian 2024 multi-platform manifest.
FROM ghcr.io/xu-cheng/texlive-historic-debian@sha256:608a158f476de2fc7f49969298f194afe634ed0eae51d8fd1f8cc41cb94c7a12

COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install --yes --no-install-recommends \
      ca-certificates \
      curl \
      git \
      openssh-client \
      poppler-utils \
    && rm -rf /var/lib/apt/lists/* \
    && test "$(node --version)" = "v22.16.0"
