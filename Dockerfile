# Stage 1: Build Frontend
ARG TARGETARCH

FROM --platform=$BUILDPLATFORM node:22-alpine AS frontend-builder_amd64
FROM --platform=$BUILDPLATFORM node:22-alpine AS frontend-builder_arm64

FROM frontend-builder_${TARGETARCH} AS frontend-builder

WORKDIR /app
COPY package.json package-lock.json tsconfig.json vite.config.ts ./
RUN npm ci --ignore-scripts --legacy-peer-deps
COPY . .
RUN npm run build:docker

# Stage 2: Prepare Backend
FROM --platform=$BUILDPLATFORM python:3.14-slim AS backend-builder_amd64
FROM --platform=$BUILDPLATFORM python:3.14 AS backend-builder_arm64

FROM backend-builder_${TARGETARCH} AS backend-builder

WORKDIR /app

# Install git, build dependencies for python packages, and wheel for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    curl \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Set up Rust environment
ENV PATH="/root/.cargo/bin:${PATH}"

# Install maturin for building the Rust wheel
RUN pip install --no-cache-dir maturin

# Clone the backend repository
ARG BACKEND_REPO_URL=https://github.com/jbelew/nms_optimizer-service.git
ARG BACKEND_REPO_BRANCH=main
RUN git clone --branch ${BACKEND_REPO_BRANCH} --depth 1 ${BACKEND_REPO_URL} .
RUN sed -i '/nms_optimizer_service/d' requirements.txt

# Build the Rust wheel
RUN maturin build --release --out /tmp/wheels

# Stage 3: Final Image
FROM --platform=$BUILDPLATFORM python:3.14-slim AS final-stage_amd64
FROM --platform=$BUILDPLATFORM python:3.14 AS final-stage_arm64

FROM final-stage_${TARGETARCH} AS final-stage

LABEL maintainer="jbelew.dev@gmail.com"
LABEL description="NMS Optimizer Web UI and Python Backend Service"
ENV PYTHONUNBUFFERED=1
ENV APP_USER=appuser
ENV APP_GROUP=appgroup
RUN groupadd -r ${APP_GROUP} && useradd -r -g ${APP_GROUP} -d /opt/app -s /sbin/nologin ${APP_USER}
RUN id ${APP_USER}
RUN apt-get update && apt-get install -y --no-install-recommends nginx supervisor build-essential && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/app/venv
ENV PATH="/opt/app/venv/bin:$PATH"
RUN /opt/app/venv/bin/pip install --no-cache-dir gunicorn gevent
WORKDIR /opt/app
COPY --from=frontend-builder /app/dist ./frontend_dist
COPY --from=backend-builder /app ./backend_app
COPY --from=backend-builder /tmp/wheels /tmp/wheels
RUN /opt/app/venv/bin/pip install --no-cache-dir /tmp/wheels/*.whl
RUN /opt/app/venv/bin/pip install --no-cache-dir -r backend_app/requirements.txt
RUN apt-get purge -y --auto-remove build-essential && rm -rf /var/lib/apt/lists/*
COPY docker_configs/app.nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default
COPY docker_configs/supervisord.conf /etc/supervisor/supervisord.conf
EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
